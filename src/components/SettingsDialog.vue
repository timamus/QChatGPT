<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card flat bordered class="q-dialog-plugin acrylic-effect">
      <!-- <q-card class="q-dialog-plugin"> -->
      <q-card-section>
        <div class="text-h6">Settings</div>
      </q-card-section>
      <q-scroll-area
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="q-dialog-scroll-area"
      >
        <q-card-section>
          <q-input
            filled
            v-model="settings.apiKey.value"
            label="Enter your OpenAI API Key"
            class="input-api-key q-mb-md"
            maxlength="150"
            clearable
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
              class="model-selector q-mb-md col"
            />
            <!-- Refresh button -->
            <q-btn
              flat
              :loading="loading"
              color="primary"
              class="q-mb-md col-auto custom-btn-height"
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
            class="prompt"
            input-class="scrollbar-styled"
            clearable
          />
          <div class="q-mt-md">
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
          <div class="q-mt-md">
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
          <div class="q-mt-md">
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
          <div class="q-mt-md">
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
      </q-scroll-area>
      <q-card-actions align="right">
        <!-- <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" /> -->
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";
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
      message: message,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.q-dialog-plugin {
  width: 400px;
  max-width: 80vw;
  height: 560px;
  max-height: 80vh;
}

.q-dialog-scroll-area {
  height: calc(100% - 116px);
  padding-right: 5px;
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
