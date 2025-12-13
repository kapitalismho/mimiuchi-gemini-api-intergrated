/**
 * Language Mapper - NLLB-200 to Gemini BCP-47 Code Mapping
 * 
 * Maps between NLLB-200 language codes used by mimiuchi's UI and
 * Gemini/BCP-47 codes used by the Gemini API.
 * 
 * Based on specs/001-gemini-api-translation/contracts/gemini-api.md
 */

/**
 * Language mapping interface
 */
export interface LanguageMapping {
    /** NLLB-200 code (e.g., 'eng_Latn') */
    nllb: string
    /** Gemini/BCP-47 code (e.g., 'en') */
    gemini: string
    /** Human-readable name */
    name: string
    /** Whether Gemini supports this language */
    supported: boolean
}

/**
 * Complete mapping of NLLB-200 to Gemini BCP-47 language codes
 * Sorted alphabetically by language name for maintainability
 */
export const LANGUAGE_MAPPINGS: LanguageMapping[] = [
    // Major languages
    { nllb: 'arb_Arab', gemini: 'ar', name: 'Arabic', supported: true },
    { nllb: 'asm_Beng', gemini: 'as', name: 'Assamese', supported: true },
    { nllb: 'aze_Latn', gemini: 'az', name: 'Azerbaijani', supported: true },
    { nllb: 'bel_Cyrl', gemini: 'be', name: 'Belarusian', supported: true },
    { nllb: 'bul_Cyrl', gemini: 'bg', name: 'Bulgarian', supported: true },
    { nllb: 'ben_Beng', gemini: 'bn', name: 'Bengali', supported: true },
    { nllb: 'bos_Latn', gemini: 'bs', name: 'Bosnian', supported: true },
    { nllb: 'cat_Latn', gemini: 'ca', name: 'Catalan', supported: true },
    { nllb: 'ces_Latn', gemini: 'cs', name: 'Czech', supported: true },
    { nllb: 'cym_Latn', gemini: 'cy', name: 'Welsh', supported: true },
    { nllb: 'dan_Latn', gemini: 'da', name: 'Danish', supported: true },
    { nllb: 'deu_Latn', gemini: 'de', name: 'German', supported: true },
    { nllb: 'ell_Grek', gemini: 'el', name: 'Greek', supported: true },
    { nllb: 'eng_Latn', gemini: 'en', name: 'English', supported: true },
    { nllb: 'spa_Latn', gemini: 'es', name: 'Spanish', supported: true },
    { nllb: 'est_Latn', gemini: 'et', name: 'Estonian', supported: true },
    { nllb: 'eus_Latn', gemini: 'eu', name: 'Basque', supported: true },
    { nllb: 'pes_Arab', gemini: 'fa', name: 'Persian', supported: true },
    { nllb: 'fin_Latn', gemini: 'fi', name: 'Finnish', supported: true },
    { nllb: 'fra_Latn', gemini: 'fr', name: 'French', supported: true },
    { nllb: 'gle_Latn', gemini: 'ga', name: 'Irish', supported: true },
    { nllb: 'gla_Latn', gemini: 'gd', name: 'Scottish Gaelic', supported: true },
    { nllb: 'glg_Latn', gemini: 'gl', name: 'Galician', supported: true },
    { nllb: 'guj_Gujr', gemini: 'gu', name: 'Gujarati', supported: true },
    { nllb: 'heb_Hebr', gemini: 'he', name: 'Hebrew', supported: true },
    { nllb: 'hin_Deva', gemini: 'hi', name: 'Hindi', supported: true },
    { nllb: 'hrv_Latn', gemini: 'hr', name: 'Croatian', supported: true },
    { nllb: 'hun_Latn', gemini: 'hu', name: 'Hungarian', supported: true },
    { nllb: 'hye_Armn', gemini: 'hy', name: 'Armenian', supported: true },
    { nllb: 'ind_Latn', gemini: 'id', name: 'Indonesian', supported: true },
    { nllb: 'isl_Latn', gemini: 'is', name: 'Icelandic', supported: true },
    { nllb: 'ita_Latn', gemini: 'it', name: 'Italian', supported: true },
    { nllb: 'jpn_Jpan', gemini: 'ja', name: 'Japanese', supported: true },
    { nllb: 'kat_Geor', gemini: 'ka', name: 'Georgian', supported: true },
    { nllb: 'kaz_Cyrl', gemini: 'kk', name: 'Kazakh', supported: true },
    { nllb: 'khm_Khmr', gemini: 'km', name: 'Khmer', supported: true },
    { nllb: 'kan_Knda', gemini: 'kn', name: 'Kannada', supported: true },
    { nllb: 'kor_Hang', gemini: 'ko', name: 'Korean', supported: true },
    { nllb: 'kir_Cyrl', gemini: 'ky', name: 'Kyrgyz', supported: true },
    { nllb: 'lao_Laoo', gemini: 'lo', name: 'Lao', supported: true },
    { nllb: 'lit_Latn', gemini: 'lt', name: 'Lithuanian', supported: true },
    { nllb: 'lvs_Latn', gemini: 'lv', name: 'Latvian', supported: true },
    { nllb: 'mkd_Cyrl', gemini: 'mk', name: 'Macedonian', supported: true },
    { nllb: 'mal_Mlym', gemini: 'ml', name: 'Malayalam', supported: true },
    { nllb: 'mon_Cyrl', gemini: 'mn', name: 'Mongolian', supported: true },
    { nllb: 'mar_Deva', gemini: 'mr', name: 'Marathi', supported: true },
    { nllb: 'zsm_Latn', gemini: 'ms', name: 'Malay', supported: true },
    { nllb: 'mlt_Latn', gemini: 'mt', name: 'Maltese', supported: true },
    { nllb: 'mya_Mymr', gemini: 'my', name: 'Burmese', supported: true },
    { nllb: 'npi_Deva', gemini: 'ne', name: 'Nepali', supported: true },
    { nllb: 'nld_Latn', gemini: 'nl', name: 'Dutch', supported: true },
    { nllb: 'nno_Latn', gemini: 'nn', name: 'Norwegian Nynorsk', supported: true },
    { nllb: 'nob_Latn', gemini: 'no', name: 'Norwegian', supported: true },
    { nllb: 'pan_Guru', gemini: 'pa', name: 'Punjabi', supported: true },
    { nllb: 'pol_Latn', gemini: 'pl', name: 'Polish', supported: true },
    { nllb: 'pbt_Arab', gemini: 'ps', name: 'Pashto', supported: true },
    { nllb: 'por_Latn', gemini: 'pt', name: 'Portuguese', supported: true },
    { nllb: 'ron_Latn', gemini: 'ro', name: 'Romanian', supported: true },
    { nllb: 'rus_Cyrl', gemini: 'ru', name: 'Russian', supported: true },
    { nllb: 'sin_Sinh', gemini: 'si', name: 'Sinhala', supported: true },
    { nllb: 'slk_Latn', gemini: 'sk', name: 'Slovak', supported: true },
    { nllb: 'slv_Latn', gemini: 'sl', name: 'Slovenian', supported: true },
    { nllb: 'sqi_Latn', gemini: 'sq', name: 'Albanian', supported: true },
    { nllb: 'srp_Cyrl', gemini: 'sr', name: 'Serbian', supported: true },
    { nllb: 'swe_Latn', gemini: 'sv', name: 'Swedish', supported: true },
    { nllb: 'swh_Latn', gemini: 'sw', name: 'Swahili', supported: true },
    { nllb: 'tam_Taml', gemini: 'ta', name: 'Tamil', supported: true },
    { nllb: 'tel_Telu', gemini: 'te', name: 'Telugu', supported: true },
    { nllb: 'tgk_Cyrl', gemini: 'tg', name: 'Tajik', supported: true },
    { nllb: 'tha_Thai', gemini: 'th', name: 'Thai', supported: true },
    { nllb: 'tgl_Latn', gemini: 'tl', name: 'Tagalog', supported: true },
    { nllb: 'tur_Latn', gemini: 'tr', name: 'Turkish', supported: true },
    { nllb: 'ukr_Cyrl', gemini: 'uk', name: 'Ukrainian', supported: true },
    { nllb: 'urd_Arab', gemini: 'ur', name: 'Urdu', supported: true },
    { nllb: 'uzn_Latn', gemini: 'uz', name: 'Uzbek', supported: true },
    { nllb: 'vie_Latn', gemini: 'vi', name: 'Vietnamese', supported: true },
    { nllb: 'xho_Latn', gemini: 'xh', name: 'Xhosa', supported: true },
    { nllb: 'zho_Hans', gemini: 'zh-CN', name: 'Chinese (Simplified)', supported: true },
    { nllb: 'zho_Hant', gemini: 'zh-TW', name: 'Chinese (Traditional)', supported: true },
    { nllb: 'zul_Latn', gemini: 'zu', name: 'Zulu', supported: true },

    // Additional supported languages (may have lower quality)
    { nllb: 'afr_Latn', gemini: 'af', name: 'Afrikaans', supported: true },
    { nllb: 'amh_Ethi', gemini: 'am', name: 'Amharic', supported: true },
    { nllb: 'ceb_Latn', gemini: 'ceb', name: 'Cebuano', supported: true },
    { nllb: 'hau_Latn', gemini: 'ha', name: 'Hausa', supported: true },
    { nllb: 'ibo_Latn', gemini: 'ig', name: 'Igbo', supported: true },
    { nllb: 'jav_Latn', gemini: 'jv', name: 'Javanese', supported: true },
    { nllb: 'som_Latn', gemini: 'so', name: 'Somali', supported: true },
    { nllb: 'snd_Arab', gemini: 'sd', name: 'Sindhi', supported: true },
    { nllb: 'sun_Latn', gemini: 'su', name: 'Sundanese', supported: true },
    { nllb: 'yor_Latn', gemini: 'yo', name: 'Yoruba', supported: true },
]

/**
 * Map from NLLB-200 code to LanguageMapping
 */
const nllbToMappingMap = new Map<string, LanguageMapping>(
    LANGUAGE_MAPPINGS.map(m => [m.nllb, m])
)

/**
 * Map from Gemini code to LanguageMapping
 */
const geminiToMappingMap = new Map<string, LanguageMapping>(
    LANGUAGE_MAPPINGS.map(m => [m.gemini, m])
)

/**
 * Convert NLLB-200 code to Gemini BCP-47 code
 * @param nllbCode NLLB-200 code (e.g., 'eng_Latn')
 * @returns Gemini BCP-47 code (e.g., 'en') or null if not found
 */
export function nllbToGemini(nllbCode: string): string | null {
    return nllbToMappingMap.get(nllbCode)?.gemini ?? null
}

/**
 * Convert Gemini BCP-47 code to NLLB-200 code
 * @param geminiCode Gemini BCP-47 code (e.g., 'en')
 * @returns NLLB-200 code (e.g., 'eng_Latn') or null if not found
 */
export function geminiToNllb(geminiCode: string): string | null {
    return geminiToMappingMap.get(geminiCode)?.nllb ?? null
}

/**
 * Get language name from NLLB-200 code
 * @param nllbCode NLLB-200 code (e.g., 'eng_Latn')
 * @returns Human-readable name (e.g., 'English') or the code itself if not found
 */
export function getLanguageName(nllbCode: string): string {
    return nllbToMappingMap.get(nllbCode)?.name ?? nllbCode
}

/**
 * Check if a language is supported by Gemini
 * @param nllbCode NLLB-200 code
 * @returns true if supported
 */
export function isLanguageSupported(nllbCode: string): boolean {
    return nllbToMappingMap.get(nllbCode)?.supported ?? false
}

/**
 * Get all supported languages
 * @returns Array of supported LanguageMapping
 */
export function getSupportedLanguages(): LanguageMapping[] {
    return LANGUAGE_MAPPINGS.filter(m => m.supported)
}

/**
 * Get mapping by NLLB code
 * @param nllbCode NLLB-200 code
 * @returns LanguageMapping or undefined
 */
export function getMappingByNllb(nllbCode: string): LanguageMapping | undefined {
    return nllbToMappingMap.get(nllbCode)
}
