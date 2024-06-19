<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
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
            outlined
            v-model="settings.apiKey.value"
            label="Enter your OpenAI API Key"
            class="input-api-key q-mb-md"
          />
          <!-- Model selection and refresh button -->
          <div class="row items-center">
            <!-- Model dropdown -->
            <q-select
              outlined
              v-model="settings.model.value"
              :options="settings.models.value"
              label="Select OpenAI Model"
              popup-content-style="font-size: 1.1em"
              class="model-selector q-mb-md col"
            />
            <!-- Refresh button -->
            <q-btn
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
            outlined
            v-model="settings.prompt.value"
            type="textarea"
            label="System Prompt"
            hint="Max 3000 characters"
            maxlength="3000"
            class="prompt"
          />
          <div class="q-mt-md">
            <q-badge color="primary"
              >Temperature: {{ settings.temperature.value }} (0 to 2)</q-badge
            >
            <q-slider
              v-model="settings.temperature.value"
              label-always
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
              label-always
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
              label-always
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
              label-always
              :min="-2"
              :max="2"
              :step="0.01"
              class="col-grow custom-slider"
            />
          </div>
        </q-card-section>
      </q-scroll-area>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Save" color="primary" @click="onSaveClick" />
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

function onSaveClick() {
  $q.localStorage.setItem("apiKey", settings.apiKey.value);
  $q.localStorage.setItem("model", settings.model.value);
  $q.localStorage.setItem("temperature", settings.temperature.value.toString());
  $q.localStorage.setItem("top_p", settings.top_p.value.toString());
  $q.localStorage.setItem(
    "frequency_penalty",
    settings.frequency_penalty.value.toString()
  );
  $q.localStorage.setItem(
    "presence_penalty",
    settings.presence_penalty.value.toString()
  );
  $q.localStorage.setItem("prompt", settings.prompt.value);
  onDialogOK();
}

const loading = ref(false);

// Load models and update local storage
const loadModels = async () => {
  loading.value = true;
  const apiKey = settings.apiKey.value;
  const gptModels = await fetchGptModels(apiKey);
  console.log(gptModels);
  settings.models.value = gptModels;
  $q.localStorage.setItem("models", JSON.stringify(gptModels));
  loading.value = false;
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
