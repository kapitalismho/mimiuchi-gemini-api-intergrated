<template>
  <v-card
    :title="t('settings.translation.title')" :subtitle="t('settings.translation.description')"
    color="transparent" flat
  >
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col>
          <v-chip variant="outlined" label color="error" size="large">
            <v-icon start icon="mdi-alert" />
            {{ t('settings.translation.warning') }}
          </v-chip>
        </v-col>
        <v-col :cols="12">
          <v-card flat>
            <v-list-item :title="t('settings.translation.enabled')">
              <template #append>
                <v-switch
                  v-model="translationStore.enabled"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12">
          <v-select
            v-model="translationStore.type"
            :label="t('settings.translation.type')"
            :items="translation_types"
            item-title="title"
            item-value="value"
            variant="outlined"
            hide-details
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #append>
                  <v-icon :icon="item.raw.type === 'cloud' ? 'mdi-cloud' : 'mdi-laptop'" />
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <!-- Transformers.js notice -->
        <v-col v-if="translationStore.type === 'Transformers.js'" :cols="12">
          <v-alert variant="outlined" type="info" prominent>
            <v-alert-title class="text-subtitle-1">
              <i18n-t keypath="settings.translation.ml_notice" tag="label" scope="global">
                <span class="text-primary">{{ translationStore.type }}</span>
              </i18n-t>
            </v-alert-title>
          </v-alert>
        </v-col>

        <!-- Gemini Settings Section -->
        <template v-if="translationStore.type === 'Gemini'">
          <!-- Cloud notice -->
          <v-col :cols="12">
            <v-alert variant="outlined" type="warning" prominent>
              <v-alert-title class="text-subtitle-1">
                <v-icon start icon="mdi-cloud-outline" />
                {{ t('settings.translation.gemini.cloud_notice') }}
              </v-alert-title>
            </v-alert>
          </v-col>

          <!-- API Key Input -->
          <v-col :cols="12">
            <!-- Show saved state if key exists -->
            <v-text-field
              v-if="hasStoredKey && !editingApiKey"
              :model-value="'API Key saved'"
              :label="t('settings.translation.gemini.api_key')"
              variant="outlined"
              readonly
              :hint="t('settings.translation.gemini.valid')"
              :persistent-hint="true"
              prepend-inner-icon="mdi-check-circle"
            >
              <template #append>
                <v-btn
                  color="warning"
                  variant="outlined"
                  @click="editingApiKey = true; geminiApiKey = ''"
                >
                  {{ t('settings.translation.gemini.change_key') }}
                </v-btn>
              </template>
            </v-text-field>
            
            <!-- Show input field for new/editing key -->
            <v-text-field
              v-else
              v-model="geminiApiKey"
              :label="t('settings.translation.gemini.api_key')"
              :placeholder="t('settings.translation.gemini.api_key_placeholder')"
              type="password"
              variant="outlined"
              :hint="apiKeyHint"
              :persistent-hint="true"
              :error="apiKeyError"
              :loading="apiKeyValidating"
            >
              <template #append>
                <v-btn
                  v-if="editingApiKey"
                  class="mr-2"
                  variant="text"
                  @click="editingApiKey = false"
                >
                  Cancel
                </v-btn>
                <v-btn
                  :loading="apiKeyValidating"
                  :disabled="!geminiApiKey || apiKeyValidating"
                  color="primary"
                  variant="outlined"
                  @click="validateApiKey"
                >
                  {{ apiKeyValidating ? t('settings.translation.gemini.validating') : t('settings.translation.gemini.validate_key') }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <!-- Model Selector -->
          <v-col :cols="12">
            <v-select
              v-model="translationStore.gemini_model"
              :label="t('settings.translation.gemini.model')"
              :items="geminiModels"
              item-title="name"
              item-value="id"
              variant="outlined"
              :hint="t('settings.translation.gemini.model_hint')"
              persistent-hint
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #subtitle>
                    {{ item.raw.description }}
                  </template>
                  <template #append>
                    <v-chip
                      v-if="item.raw.recommended"
                      size="small"
                      color="success"
                      variant="tonal"
                    >
                      {{ t('settings.translation.gemini.recommended') }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- System Prompt -->
          <v-col :cols="12">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel :title="t('settings.translation.gemini.system_prompt')">
                <template #text>
                  <v-textarea
                    v-model="translationStore.gemini_system_prompt"
                    :placeholder="DEFAULT_GEMINI_SYSTEM_PROMPT"
                    :hint="t('settings.translation.gemini.system_prompt_hint')"
                    persistent-hint
                    variant="outlined"
                    rows="6"
                    auto-grow
                    class="mt-2"
                  />
                  <v-btn
                    variant="outlined"
                    size="small"
                    class="mt-2"
                    prepend-icon="mdi-restore"
                    @click="resetSystemPrompt"
                  >
                    Reset to Default
                  </v-btn>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>

          <!-- Error Display -->
          <v-col v-if="translationStore.gemini_last_error" :cols="12">
            <v-alert type="error" variant="tonal" closable @click:close="translationStore.gemini_last_error = ''">
              {{ translationStore.gemini_last_error }}
            </v-alert>
          </v-col>
        </template>

        <v-col :cols="12" :sm="6">
          <v-autocomplete
            v-model="translationStore.source"
            :label="t('settings.translation.source')"
            :items="translation_options"
            item-title="title"
            item-value="value"
            auto-select-first
            hide-details
          />
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-autocomplete
            v-model="translationStore.target"
            :label="t('settings.translation.target')"
            :items="translation_options"
            item-title="title"
            item-value="value"
            auto-select-first
            hide-details
          />
        </v-col>
        <v-col :cols="12">
          <v-card flat>
            <v-list-item :title="t('settings.translation.show_original')">
              <template #append>
                <v-switch
                  v-model="translationStore.show_original"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useSpeechStore } from '@/stores/speech'
import translation_options from '@/constants/translation_options'
import { GEMINI_MODELS, DEFAULT_GEMINI_SYSTEM_PROMPT } from '@/constants/gemini_models'

const { t } = useI18n()

const translationStore = useTranslationStore()
const speechStore = useSpeechStore()

const stt_language = speechStore.stt.language

// Gemini-specific state
const geminiApiKey = ref('')
const apiKeyValidating = ref(false)
const apiKeyError = ref(false)
const apiKeyValidated = ref(false)
const hasStoredKey = ref(false)  // Track if key exists in secure storage
const editingApiKey = ref(false) // Track if user is editing the API key
const promptExpanded = ref(false) // Track if system prompt textarea is expanded

const geminiModels = GEMINI_MODELS

// Reset system prompt to default
function resetSystemPrompt() {
  translationStore.gemini_system_prompt = DEFAULT_GEMINI_SYSTEM_PROMPT
}

const translation_types = ref([
  {
    title: 'Transformers.js (BETA)',
    value: 'Transformers.js',
    type: 'local',
  },
  {
    title: 'Gemini API',
    value: 'Gemini',
    type: 'cloud',
  },
])

// Computed hint for API key field
const apiKeyHint = computed(() => {
  if (apiKeyValidating.value) return t('settings.translation.gemini.validating')
  if (apiKeyError.value) return t('settings.translation.gemini.invalid')
  if (translationStore.gemini_api_key_valid) return t('settings.translation.gemini.valid')
  return ''
})

// Load Gemini config on mount
onMounted(async () => {
  if (window.ipcRenderer) {
    try {
      const config = await window.ipcRenderer.invoke('gemini-get-config')
      if (config.api_key_set) {
        hasStoredKey.value = true
        translationStore.gemini_api_key_valid = true
      }
      translationStore.gemini_model = config.model
      translationStore.gemini_system_prompt = config.system_prompt
    } catch (error) {
      console.error('Failed to load Gemini config:', error)
    }
  }
})

// Validate API key
async function validateApiKey() {
  if (!geminiApiKey.value || geminiApiKey.value.includes('•')) return

  apiKeyValidating.value = true
  apiKeyError.value = false

  try {
    if (window.ipcRenderer) {
      const result = await window.ipcRenderer.invoke('gemini-validate-key', geminiApiKey.value)
      
      if (result.valid) {
        translationStore.gemini_api_key_valid = true
        translationStore.gemini_api_key = geminiApiKey.value
        apiKeyValidated.value = true
        hasStoredKey.value = true        // Mark that key is now stored
        editingApiKey.value = false      // Exit editing mode
        
        // Save config
        await saveGeminiConfig()
      } else {
        apiKeyError.value = true
        translationStore.gemini_api_key_valid = false
      }
    }
  } catch (error) {
    console.error('API key validation failed:', error)
    apiKeyError.value = true
  } finally {
    apiKeyValidating.value = false
  }
}

// Save Gemini config
async function saveGeminiConfig() {
  if (window.ipcRenderer) {
    try {
      await window.ipcRenderer.invoke('gemini-save-config', {
        api_key: geminiApiKey.value.includes('•') ? undefined : geminiApiKey.value,
        model: translationStore.gemini_model,
        system_prompt: translationStore.gemini_system_prompt,
      })
    } catch (error) {
      console.error('Failed to save Gemini config:', error)
    }
  }
}

// Watch for model/prompt changes and save
watch(() => translationStore.gemini_model, saveGeminiConfig)
watch(() => translationStore.gemini_system_prompt, saveGeminiConfig)
</script>

