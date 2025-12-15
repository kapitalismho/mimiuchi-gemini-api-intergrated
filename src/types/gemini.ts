/**
 * Gemini API Translation - Type Definitions
 * 
 * This file contains all Gemini-related TypeScript type definitions.
 * Based on specs/001-gemini-api-translation/data-model.md
 */

/**
 * Translation request sent from renderer to main process
 */
export interface TranslationRequest {
  /** Text to translate */
  text: string
  /** Source language (NLLB-200 code, e.g., 'eng_Latn') */
  source_lang: string
  /** Target language (NLLB-200 code, e.g., 'jpn_Jpan') */
  target_lang: string
  /** Log index for tracking which transcript */
  index: number
  /** Request timestamp (Date.now()) */
  timestamp: number
}

/**
 * Translation response sent from main process to renderer
 */
export interface TranslationResponse {
  /** Translation status */
  status: 'complete' | 'error'
  /** Translated text (if status === 'complete') */
  output: string
  /** Error message (if status === 'error') */
  error?: string
  /** Log index (matches request) */
  index: number
  /** Response timestamp (Date.now()) */
  timestamp: number
  /** Model used (for debugging) */
  model?: string
}

/**
 * Gemini configuration stored in main process
 */
export interface GeminiConfig {
  /** Gemini API key (never sent to renderer) */
  api_key: string
  /** Model ID (e.g., 'gemini-2.5-flash') */
  model: string
  /** Custom system instruction */
  system_prompt: string
  /** Request timeout in milliseconds (default: 5000ms) */
  timeout_ms: number
}

/**
 * Gemini model definition for model selector
 */
export interface GeminiModel {
  /** Model ID (e.g., 'gemini-2.5-flash') */
  id: string
  /** Display name */
  name: string
  /** User-friendly description */
  description: string
  /** Whether this is the recommended model */
  recommended: boolean
}


/**
 * Gemini API error with user-friendly messaging
 */
export interface GeminiError {
  /** HTTP status code */
  code: number
  /** Error status name */
  status: string
  /** Technical error message */
  message: string
  /** User-friendly message */
  userMessage: string
  /** When error occurred */
  timestamp: number
  /** Whether user can retry */
  retryable: boolean
}
