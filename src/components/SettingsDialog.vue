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
          <q-select
            outlined
            v-model="settings.model.value"
            :options="settings.models"
            label="Select OpenAI Model"
            popup-content-style="font-size: 1.1em"
            class="model-selector q-mb-md"
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
import { useDialogPluginComponent } from "quasar";
import { settings } from "src/settings";
import { thumbStyle, barStyle } from "src/styles";
import { useQuasar } from "quasar";

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
  onDialogOK();
}
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
</style>
