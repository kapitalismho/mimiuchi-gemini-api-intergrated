/**
 * Gemini API Translation - IPC Message Type Definitions
 * 
 * This file contains IPC message type definitions for Gemini translation.
 * Based on specs/001-gemini-api-translation/contracts/ipc-messages.md
 */

import type { TranslationRequest, TranslationResponse } from './gemini'

/**
 * IPC channel names for Gemini translation
 */
export const GEMINI_IPC_CHANNELS = {
    /** Validate API key (renderer → main) */
    VALIDATE_KEY: 'gemini-validate-key',
    /** Get Gemini config (renderer → main) */
    GET_CONFIG: 'gemini-get-config',
    /** Save Gemini config (renderer → main) */
    SAVE_CONFIG: 'gemini-save-config',
    /** Request translation (renderer → main) */
    TRANSLATE: 'gemini-translate',
    /** Translation result (main → renderer) */
    TRANSLATE_RENDER: 'gemini-translate-render',
} as const

/**
 * API key validation response
 */
export interface ValidateKeyResponse {
    /** Whether the API key is valid */
    valid: boolean
    /** Error message if invalid */
    error?: string
}

/**
 * Get config response (excludes sensitive API key)
 */
export interface GetConfigResponse {
    /** Model ID */
    model: string
    /** Custom system prompt */
    system_prompt: string
    /** Whether API key is set (but not the key itself) */
    api_key_set: boolean
}

/**
 * Re-export types for convenience
 */
export type { TranslationRequest, TranslationResponse }
