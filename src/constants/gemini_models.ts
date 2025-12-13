/**
 * Gemini API Translation - Available Models
 * 
 * Simplified model list for VRChat translation use case.
 */

import type { GeminiModel } from '../types/gemini'

/**
 * Available Gemini models for translation
 */
export const GEMINI_MODELS: GeminiModel[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Best quality with thinking capability.',
        recommended: true,
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fastest response time.',
        recommended: false,
    },
]

/**
 * Default model ID
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

/**
 * Get a model by ID
 */
export function getGeminiModelById(id: string): GeminiModel | undefined {
    return GEMINI_MODELS.find(model => model.id === id)
}

/**
 * Get the recommended model
 */
export function getRecommendedGeminiModel(): GeminiModel {
    return GEMINI_MODELS.find(model => model.recommended) || GEMINI_MODELS[0]
}
