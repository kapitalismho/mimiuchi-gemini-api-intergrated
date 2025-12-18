/**
 * Gemini Translation Service
 * 
 * Main process module for handling Gemini API translation requests.
 * Based on specs/001-gemini-api-translation/contracts/gemini-api.md
 */

// @ts-nocheck - electron-store types don't work well with ESM build
import { GoogleGenAI } from '@google/genai'
import Store from 'electron-store'
import { nllbToGemini, getLanguageName } from './language-mapper'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Simple file logger for Gemini errors
 */
class GeminiLogger {
    private logPath: string
    private maxLogSize = 1024 * 1024 // 1MB max log file size

    constructor() {
        const userDataPath = app.getPath('userData')
        this.logPath = path.join(userDataPath, 'gemini-errors.log')
    }

    log(level: 'INFO' | 'ERROR' | 'WARN', message: string, data?: any) {
        const timestamp = new Date().toISOString()
        const logEntry = `[${timestamp}] [${level}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`

        try {
            // Check file size and rotate if needed
            if (fs.existsSync(this.logPath)) {
                const stats = fs.statSync(this.logPath)
                if (stats.size > this.maxLogSize) {
                    // Rotate: rename old log and start fresh
                    const backupPath = this.logPath.replace('.log', '.old.log')
                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath)
                    fs.renameSync(this.logPath, backupPath)
                }
            }
            fs.appendFileSync(this.logPath, logEntry)
        } catch (err) {
            console.error('Failed to write to log file:', err)
        }
    }

    error(message: string, data?: any) {
        this.log('ERROR', message, data)
        console.error(`[Gemini] ${message}`, data || '')
    }

    info(message: string, data?: any) {
        this.log('INFO', message, data)
    }

    getLogPath(): string {
        return this.logPath
    }
}

// Singleton logger instance
const logger = new GeminiLogger()

/**
 * Gemini configuration interface
 */
interface GeminiConfig {
    api_key: string
    model: string
    system_prompt: string
    timeout_ms: number
}

/**
 * Gemini error interface
 */
interface GeminiError {
    code: number
    status: string
    message: string
    userMessage: string
    retryable: boolean
    timestamp: number
}

/**
 * Translation request interface
 */
interface TranslationRequest {
    text: string
    source_lang: string
    target_lang: string
    index: number
    timestamp: number
}

/**
 * Translation response interface
 */
interface TranslationResponse {
    status: 'complete' | 'error'
    output: string
    error?: string
    index: number
    timestamp: number
    model?: string
}

// Electron store schema
interface GeminiStoreSchema {
    api_key: string
    model: string
    system_prompt: string
    timeout_ms: number
}

// Load default system prompt from external file
function loadDefaultPrompt(): string {
    const fallbackPrompt = 'You are a professional translator. Translate the following text from ${sourceName} to ${targetName}. Output ONLY the translated text without any explanations.'

    try {
        // Try to load from prompts folder (relative to project root)
        const promptPath = path.join(app.getAppPath(), 'prompts', 'default-translation.txt')
        if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, 'utf-8').trim()
        }

        // Fallback: try development path
        const devPath = path.join(__dirname, '../../../../prompts/default-translation.txt')
        if (fs.existsSync(devPath)) {
            return fs.readFileSync(devPath, 'utf-8').trim()
        }

        logger.info('Default prompt file not found, using fallback')
        return fallbackPrompt
    } catch (error) {
        logger.error('Failed to load default prompt file', error)
        return fallbackPrompt
    }
}

const DEFAULT_SYSTEM_PROMPT = loadDefaultPrompt()

// Electron store for persistent config (encrypted API key storage)
const store = new Store<GeminiStoreSchema>({
    name: 'gemini-config-fork',  // Separate from PR branch config
    encryptionKey: 'mimiuchi-gemini-secure-key-v1', // Simple encryption for API key
    schema: {
        api_key: { type: 'string', default: '' },
        model: { type: 'string', default: 'gemini-3-flash-preview' },
        system_prompt: { type: 'string', default: DEFAULT_SYSTEM_PROMPT },
        timeout_ms: { type: 'number', default: 5000 },
    },
})

// Default configuration
const DEFAULT_CONFIG: GeminiConfig = {
    api_key: '',
    model: 'gemini-3-flash-preview',
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    timeout_ms: 10000,  // 10 seconds for API response
}

// Error mapping for user-friendly messages
const ERROR_MAP: Record<number, Omit<GeminiError, 'timestamp'>> = {
    400: {
        code: 400,
        status: 'INVALID_ARGUMENT',
        message: 'Invalid request format',
        userMessage: 'Translation request failed. Please try again.',
        retryable: true,
    },
    403: {
        code: 403,
        status: 'PERMISSION_DENIED',
        message: 'Invalid API key or insufficient permissions',
        userMessage: 'Invalid API key. Please check your settings.',
        retryable: false,
    },
    429: {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        message: 'Rate limit exceeded',
        userMessage: 'Rate limit exceeded. Please wait a moment and try again.',
        retryable: true,
    },
    500: {
        code: 500,
        status: 'INTERNAL',
        message: 'Internal server error',
        userMessage: 'Gemini service unavailable. Please try again later.',
        retryable: true,
    },
    503: {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'Service temporarily unavailable',
        userMessage: 'Gemini service unavailable. Please try again later.',
        retryable: true,
    },
}

/**
 * Rate limiter to prevent API quota exhaustion
 */
class RateLimiter {
    private queue: Array<() => Promise<void>> = []
    private processing = false
    private lastRequestTime = 0
    private minDelay = 0 // Disabled for paid tier accounts (Tier 1+)

    async enqueue<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn()
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            })
            this.processQueue()
        })
    }

    private async processQueue() {
        if (this.processing || this.queue.length === 0) return
        this.processing = true

        while (this.queue.length > 0) {
            const now = Date.now()
            const timeSinceLastRequest = now - this.lastRequestTime

            if (timeSinceLastRequest < this.minDelay) {
                await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest))
            }

            const fn = this.queue.shift()
            if (fn) {
                this.lastRequestTime = Date.now()
                await fn()
            }
        }

        this.processing = false
    }
}

/**
 * Gemini Translation Service Class
 */
export class GeminiTranslationService {
    private genAI: GoogleGenAI | null = null
    private config: GeminiConfig
    private rateLimiter = new RateLimiter()

    constructor() {
        this.config = this.loadConfig()
        if (this.config.api_key) {
            this.initializeClient()
        }
    }

    /**
     * Load configuration from electron-store
     */
    private loadConfig(): GeminiConfig {
        return {
            api_key: store.get('api_key', DEFAULT_CONFIG.api_key) as string,
            model: store.get('model', DEFAULT_CONFIG.model) as string,
            system_prompt: store.get('system_prompt', DEFAULT_CONFIG.system_prompt) as string,
            timeout_ms: store.get('timeout_ms', DEFAULT_CONFIG.timeout_ms) as number,
        }
    }

    /**
     * Save configuration to electron-store
     */
    saveConfig(config: Partial<GeminiConfig>): void {
        if (config.api_key !== undefined) {
            store.set('api_key', config.api_key)
            this.config.api_key = config.api_key
        }
        if (config.model !== undefined) {
            store.set('model', config.model)
            this.config.model = config.model
        }
        if (config.system_prompt !== undefined) {
            store.set('system_prompt', config.system_prompt)
            this.config.system_prompt = config.system_prompt
        }
        if (config.timeout_ms !== undefined) {
            store.set('timeout_ms', config.timeout_ms)
            this.config.timeout_ms = config.timeout_ms
        }

        // Reinitialize client if API key changed
        if (config.api_key !== undefined) {
            this.initializeClient()
        }
    }

    /**
     * Get configuration (without exposing API key)
     */
    getConfig(): { model: string; system_prompt: string; api_key_set: boolean } {
        return {
            model: this.config.model,
            system_prompt: this.config.system_prompt,
            api_key_set: !!this.config.api_key,
        }
    }

    /**
     * Initialize Gemini client
     */
    private initializeClient(): void {
        if (!this.config.api_key) {
            this.genAI = null
            return
        }

        try {
            this.genAI = new GoogleGenAI({ apiKey: this.config.api_key })
        } catch (error) {
            console.error('Failed to initialize Gemini client:', error)
            this.genAI = null
        }
    }

    /**
     * Build system prompt for translation
     * 
     * Supports variable substitution:
     * - ${sourceName} - Source language name (e.g., "Korean")
     * - ${targetName} - Target language name (e.g., "Japanese")
     * - ${sourceLang} - Source language code (e.g., "kor_Hang")
     * - ${targetLang} - Target language code (e.g., "jpn_Jpan")
     */
    buildSystemPrompt(sourceLang: string, targetLang: string): string {
        const sourceName = getLanguageName(sourceLang)
        const targetName = getLanguageName(targetLang)

        // Use custom prompt if set, otherwise use default
        const prompt = this.config.system_prompt || DEFAULT_SYSTEM_PROMPT

        // Replace variables in prompt
        const result = prompt
            .replace(/\$\{sourceName\}/g, sourceName)
            .replace(/\$\{targetName\}/g, targetName)
            .replace(/\$\{sourceLang\}/g, sourceLang)
            .replace(/\$\{targetLang\}/g, targetLang)

        // DEBUG: Log the final system prompt
        console.log('[Gemini] System Prompt:', result)

        return result
    }

    /**
     * Validate API key with a test call
     */
    async validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
        try {
            const testGenAI = new GoogleGenAI({ apiKey })

            const result = await Promise.race([
                testGenAI.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: 'Test',
                    config: {
                        systemInstruction: 'Respond with just "OK"',
                    },
                }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Validation timed out')), 10000)
                ),
            ])

            // If we got here, the API key is valid
            return { valid: true }
        } catch (error: any) {
            console.error('API key validation failed:', error)

            if (error.status === 403 || error.message?.includes('API key')) {
                return { valid: false, error: 'Invalid API key. Please check and try again.' }
            }
            if (error.message === 'Validation timed out') {
                return { valid: false, error: 'Validation timed out. Please check your connection.' }
            }

            return { valid: false, error: error.message || 'Unknown validation error' }
        }
    }

    /**
     * Translate text using Gemini API
     */
    async translate(request: TranslationRequest): Promise<TranslationResponse> {
        const { text, source_lang, target_lang, index, timestamp } = request

        // Check if client is initialized
        if (!this.genAI) {
            return {
                status: 'error',
                output: '',
                error: 'Gemini API not configured. Please enter your API key in settings.',
                index,
                timestamp: Date.now(),
            }
        }

        // Check language support
        const sourceGemini = nllbToGemini(source_lang)
        const targetGemini = nllbToGemini(target_lang)

        if (!sourceGemini || !targetGemini) {
            return {
                status: 'error',
                output: '',
                error: `Language pair not supported: ${source_lang} → ${target_lang}`,
                index,
                timestamp: Date.now(),
            }
        }

        try {
            // Use rate limiter to queue the request
            const translation = await this.rateLimiter.enqueue(async () => {
                // Build thinking config based on model
                // Gemini 3 uses thinkingLevel ('MINIMAL', 'LOW', 'MEDIUM', 'HIGH')
                // Gemini 2.x uses thinkingBudget (0 = disabled)
                const isGemini3 = this.config.model.startsWith('gemini-3')
                const thinkingConfig = isGemini3
                    ? { thinkingLevel: 'MINIMAL' }  // Gemini 3: MINIMAL = almost no thinking
                    : { thinkingBudget: 0 }         // Gemini 2.x: 0 = disable thinking

                // Race against timeout
                const result = await Promise.race([
                    this.genAI!.models.generateContent({
                        model: this.config.model,
                        contents: text,
                        config: {
                            systemInstruction: this.buildSystemPrompt(source_lang, target_lang),
                            maxOutputTokens: 1000,
                            temperature: 0.3,
                            thinkingConfig,
                        } as any, // Type assertion needed for thinkingConfig
                    }),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Request timed out')), this.config.timeout_ms)
                    ),
                ])

                return result.text || ''
            })

            return {
                status: 'complete',
                output: translation.trim(),
                index,
                timestamp: Date.now(),
                model: this.config.model,
            }
        } catch (error: any) {
            console.error('Translation error:', error)

            // Map error to user-friendly message
            const errorInfo = this.mapError(error)

            return {
                status: 'error',
                output: '',
                error: errorInfo.userMessage,
                index,
                timestamp: Date.now(),
            }
        }
    }

    /**
     * Map error to user-friendly message
     */
    private mapError(error: any): GeminiError {
        // Log actual error to file for debugging
        logger.error('Gemini API Error', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            name: error.name,
            stack: error.stack,
        })

        // Handle timeout specifically
        if (error.message === 'Request timed out') {
            return {
                code: 408,
                status: 'TIMEOUT',
                message: 'Request timed out',
                userMessage: 'Translation timed out. The server may be busy.',
                retryable: true,
                timestamp: Date.now(),
            }
        }

        // Handle network errors
        if (error.name === 'TypeError' && error.message?.includes('fetch')) {
            return {
                code: 0,
                status: 'NETWORK_ERROR',
                message: 'Network error',
                userMessage: 'Network error. Please check your internet connection.',
                retryable: true,
                timestamp: Date.now(),
            }
        }

        const status = error.status || 500
        const mapped = ERROR_MAP[status] || ERROR_MAP[500]

        return {
            ...mapped,
            timestamp: Date.now(),
        }
    }

    /**
     * Check if the service is ready to translate
     */
    isReady(): boolean {
        return !!this.genAI
    }
}

// Singleton instance
let serviceInstance: GeminiTranslationService | null = null

/**
 * Get or create the Gemini Translation Service instance
 */
export function getGeminiTranslationService(): GeminiTranslationService {
    if (!serviceInstance) {
        serviceInstance = new GeminiTranslationService()
    }
    return serviceInstance
}
