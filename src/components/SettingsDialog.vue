<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="q-dialog-plugin acrylic-effect">
      <q-card-section>
        <div class="text-h5">Settings</div>
      </q-card-section>

      <q-separator />

      <q-scroll-area
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="q-dialog-scroll-area"
      >
        <q-card-section class="q-mb-md">
          <div class="q-mb-md text-h6">Appearance</div>
          <div class="row justify-between items-center toggle">
            <span>Sending by pressing Enter</span>
            <q-toggle v-model="settings.sendOnEnter.value" />
          </div>
          <div class="q-pt-xs text-left toggle-hint">
            Line break, in this case, will be possible by pressing Ctrl + Enter
          </div>
        </q-card-section>
        <q-card-section class="q-mb-md">
          <div class="q-mb-md text-h6">General settings</div>
          <q-input
            filled
            v-model="settings.apiKey.value"
            label="Enter your OpenAI API Key"
            class="input-api-key q-mt-lg"
            maxlength="150"
          >
            <template v-if="settings.apiKey.value" v-slot:append>
              <q-icon
                name="cancel"
                @click.stop.prevent="settings.apiKey.value = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <q-btn
            flat
            @click="
              openURL(
                'https://platform.openai.com/settings/profile?tab=api-keys'
              )
            "
            label="Obtain API key"
            color="primary"
            icon="open_in_new"
            no-caps
            class="q-mt-sm"
          />
          <!-- Model selection and refresh button -->
          <div class="row items-center">
            <!-- Model dropdown -->
            <q-select
              filled
              v-model="settings.model.value"
              :options="settings.models.value"
              label="Select OpenAI Model"
              popup-content-class="popup-styled scrollbar-styled"
              class="model-selector q-mt-lg col"
            />
            <!-- Refresh button -->
            <q-btn
              flat
              :loading="loading"
              color="primary"
              class="q-mt-lg col-auto custom-btn-height"
              @click="loadModels"
            >
              <q-icon name="refresh" size="32px" />
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
          </div>
          <q-input
            filled
            v-model="settings.prompt.value"
            type="textarea"
            label="System Prompt"
            hint="Max 3000 characters"
            maxlength="3000"
            class="prompt q-mt-lg"
            input-class="scrollbar-styled"
          >
            <template v-if="settings.prompt.value" v-slot:append>
              <q-icon
                name="cancel"
                @click.stop.prevent="settings.prompt.value = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <div class="q-mt-lg">
            <q-badge color="primary"
              >Temperature: {{ settings.temperature.value }} (0 to 2)</q-badge
            >
            <q-slider
              v-model="settings.temperature.value"
              label
              :min="0"
              :max="2"
              :step="0.1"
              class="col-grow custom-slider"
            />
          </div>
          <div class="q-mt-lg">
            <q-badge color="primary"
              >Top P: {{ settings.top_p.value }} (0 to 1)</q-badge
            >
            <q-slider
              v-model="settings.top_p.value"
              label
              :min="0"
              :max="1"
              :step="0.01"
              class="col-grow custom-slider"
            />
          </div>
          <div class="q-mt-lg">
            <q-badge color="primary"
              >Frequency penalty: {{ settings.frequency_penalty.value }} (-2 to
              2)</q-badge
            >
            <q-slider
              v-model="settings.frequency_penalty.value"
              label
              :min="-2"
              :max="2"
              :step="0.01"
              class="col-grow custom-slider"
            />
          </div>
          <div class="q-mt-lg">
            <q-badge color="primary"
              >Presence penalty: {{ settings.presence_penalty.value }} (-2 to
              2)</q-badge
            >
            <q-slider
              v-model="settings.presence_penalty.value"
              label
              :min="-2"
              :max="2"
              :step="0.01"
              class="col-grow custom-slider"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-mb-md">
          <div class="q-mb-md text-h6">Dall-E settings</div>
          <q-select
            filled
            v-model="settings.imageSize.value"
            :options="[
              '256x256',
              '512x512',
              '1024x1024',
              '1792x1024',
              '1024x1729',
            ]"
            label="Select Image Size"
            popup-content-class="popup-styled scrollbar-styled"
            class="model-selector q-mt-lg col"
          />
          <q-select
            filled
            v-model="settings.imageStyle.value"
            :options="['vivid', 'natural']"
            label="Select Image Style"
            popup-content-class="popup-styled scrollbar-styled"
            class="model-selector q-mt-lg col"
          />
        </q-card-section>
      </q-scroll-area>
      <q-card-actions align="right">
        <!-- <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" /> -->
        <q-btn flat label="RESET" color="negative" @click="resetSettings" />
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent, openURL } from "quasar";
import { settings } from "src/settings";
import { thumbStyle, barStyle } from "src/styles";
import { useQuasar } from "quasar";
import { fetchGptModels } from "src/services/openAIServices";

const $q = useQuasar();

const props = defineProps({
  // ...your custom props
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  onDialogOK();
}

// Function to reset settings to default values
const resetSettings = () => {
  settings.temperature.value = 1;
  settings.top_p.value = 1;
  settings.frequency_penalty.value = 0;
  settings.presence_penalty.value = 0;
  settings.imageSize.value = "1024x1024";
  settings.imageStyle.value = "vivid";
};

const loading = ref(false);

// Load models and update local storage
const loadModels = async () => {
  loading.value = true;
  try {
    const gptModels = await fetchGptModels();
    settings.models.value = gptModels;
    $q.localStorage.setItem("models", JSON.stringify(gptModels));
  } catch (error) {
    console.error("Error loading models:", error);

    let message = `Error loading models: ${error.message}`;
    if (error.response?.status === 401) {
      message += ". Please ensure you have provided a valid API key.";
    }

    $q.notify({
      type: "negative",
      color: "red",
      position: "bottom",
      message: `<span style="font-size: 1.1em;">${message}</span>`,
      html: true,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.q-dialog-plugin {
  width: 440px;
  max-width: 80vw;
  height: 90vh;
  max-height: 90vh;
}

.q-dialog-scroll-area {
  height: calc(100% - 117px);
  padding-right: 5px;
}

.toggle {
  width: 100%;
  font-size: 1.1em;
}

.toggle-hint {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.7);
}

.input-api-key {
  font-size: 1.1em;
}

.model-selector {
  font-size: 1.1em;
}

:deep(.custom-slider .q-slider__text) {
  font-size: 1.1em;
}

.prompt {
  font-size: 1.1em;
}

.custom-btn-height {
  height: 56px;
}
</style>
