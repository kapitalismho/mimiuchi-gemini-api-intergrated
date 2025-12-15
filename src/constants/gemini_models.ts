/**
 * Gemini API Translation - Available Models
 * 
 * Simplified model list for VRChat translation use case.
 */

import type { GeminiModel } from '../types/gemini'
import defaultPromptRaw from '../../prompts/default-translation.txt?raw'

/**
 * Available Gemini models for translation
 */
export const GEMINI_MODELS: GeminiModel[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Best quality with fast response.',
        recommended: true,
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fastest response time, lightweight.',
        recommended: false,
    },
]

/**
 * Default model ID
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

/**
 * Default system prompt for translation
 * Loaded from prompts/default-translation.txt
 * 
 * Available variables (replaced at runtime):
 * - ${sourceName} - Source language name (e.g., "Korean")
 * - ${targetName} - Target language name (e.g., "Japanese")
 * - ${sourceLang} - Source language code (e.g., "kor_Hang")
 * - ${targetLang} - Target language code (e.g., "jpn_Jpan")
 */
export const DEFAULT_GEMINI_SYSTEM_PROMPT = defaultPromptRaw.trim()

