import { defineStore } from 'pinia'

import { ref } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useSpeechStore } from '@/stores/speech'

export const useTranslationStore = defineStore('translation', () => {
  const enabled = ref(false)
  const type = ref('Transformers.js')
  const source = ref('eng_Latn')
  const target = ref('jpn_Jpan')
  const download = ref(-1) // percent downloaded 0-100. -1 = done
  const show_original = ref(true)

  // Gemini-specific configuration
  const gemini_api_key = ref('')
  const gemini_model = ref('gemini-2.5-flash')
  const gemini_system_prompt = ref('')
  const gemini_api_key_valid = ref(false)
  const gemini_last_error = ref('')

  function onMessageReceived(data: any) {
    const logsStore = useLogsStore()
    switch (data.status) {
      case 'progress':
        if (data.file === 'onnx/encoder_model_quantized.onnx')
          download.value = data.progress
        break
      case 'ready':
        download.value = -1
        break
      case 'update':
        logsStore.logs[data.index].translation = data.output
        logsStore.loading_result = true
        break
      case 'complete': {
        const { on_submit } = useSpeechStore()

        logsStore.logs[data.index].translation = data.output[0].translation_text
        logsStore.loading_result = false
        logsStore.logs[data.index].isTranslationFinal = true

        on_submit(logsStore.logs[data.index], data.index)
        break
      }
    }
  }

  /**
   * Handle Gemini translation response
   */
  function onGeminiResponse(data: any) {
    const logsStore = useLogsStore()
    const { on_submit } = useSpeechStore()

    if (data.status === 'complete') {
      logsStore.logs[data.index].translation = data.output
      logsStore.loading_result = false
      logsStore.logs[data.index].isTranslationFinal = true
      gemini_last_error.value = ''

      on_submit(logsStore.logs[data.index], data.index)
    } else if (data.status === 'error') {
      gemini_last_error.value = data.error || 'Unknown translation error'
      logsStore.loading_result = false
      // Don't send to OSC on error (silent fail for VRChat)
    }
  }

  /**
   * Check if a language is supported by Gemini API
   * Gemini supports fewer languages than NLLB-200 (Transformers.js)
   */
  function isLanguageSupportedByGemini(nllbCode: string): boolean {
    // Major languages supported by Gemini
    const geminiSupportedCodes = [
      'arb_Arab', 'ben_Beng', 'bul_Cyrl', 'zho_Hans', 'zho_Hant',
      'hrv_Latn', 'ces_Latn', 'dan_Latn', 'nld_Latn', 'eng_Latn',
      'est_Latn', 'fin_Latn', 'fra_Latn', 'deu_Latn', 'ell_Grek',
      'guj_Gujr', 'heb_Hebr', 'hin_Deva', 'hun_Latn', 'ind_Latn',
      'ita_Latn', 'jpn_Jpan', 'kan_Knda', 'kor_Hang', 'lav_Latn',
      'lit_Latn', 'mal_Mlym', 'mar_Deva', 'nob_Latn', 'pol_Latn',
      'por_Latn', 'ron_Latn', 'rus_Cyrl', 'srp_Cyrl', 'slk_Latn',
      'slv_Latn', 'spa_Latn', 'swe_Latn', 'tam_Taml', 'tel_Telu',
      'tha_Thai', 'tur_Latn', 'ukr_Cyrl', 'urd_Arab', 'vie_Latn',
    ]
    return geminiSupportedCodes.includes(nllbCode)
  }

  /**
   * Check if current language pair is compatible with the target service
   */
  function checkLanguageCompatibility(targetService: string): {
    compatible: boolean;
    sourceCompatible: boolean;
    targetCompatible: boolean;
  } {
    if (targetService === 'Transformers.js') {
      // Transformers.js (NLLB-200) supports all languages in the options
      return { compatible: true, sourceCompatible: true, targetCompatible: true }
    } else if (targetService === 'Gemini') {
      const sourceOk = isLanguageSupportedByGemini(source.value)
      const targetOk = isLanguageSupportedByGemini(target.value)
      return {
        compatible: sourceOk && targetOk,
        sourceCompatible: sourceOk,
        targetCompatible: targetOk
      }
    }
    return { compatible: true, sourceCompatible: true, targetCompatible: true }
  }

  /**
   * Switch translation service with language preservation
   */
  function switchService(newService: string): {
    success: boolean;
    warning?: string;
  } {
    const compatibility = checkLanguageCompatibility(newService)

    if (!compatibility.compatible) {
      let warning = 'Some languages may not be supported: '
      if (!compatibility.sourceCompatible) warning += `Source (${source.value}) `
      if (!compatibility.targetCompatible) warning += `Target (${target.value})`

      // Still allow switching, but warn the user
      type.value = newService
      return { success: true, warning }
    }

    type.value = newService
    return { success: true }
  }

  function reset() {
    enabled.value = false
    type.value = 'Transformers.js'
    source.value = 'eng_Latn'
    target.value = 'jpn_Jpan'
    download.value = -1
    show_original.value = true
    gemini_api_key.value = ''
    gemini_model.value = 'gemini-2.5-flash'
    gemini_system_prompt.value = ''
    gemini_api_key_valid.value = false
    gemini_last_error.value = ''
  }

  return {
    enabled,
    type,
    source,
    target,
    download,
    show_original,
    onMessageReceived,
    // Gemini-specific exports
    gemini_api_key,
    gemini_model,
    gemini_system_prompt,
    gemini_api_key_valid,
    gemini_last_error,
    onGeminiResponse,
    // Service switching
    isLanguageSupportedByGemini,
    checkLanguageCompatibility,
    switchService,
    reset,
  }
})
