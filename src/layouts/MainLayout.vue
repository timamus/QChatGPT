<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-select
          standout
          v-model="model"
          :options="models"
          @update:model-value="saveSettings"
          label="OpenAI Model"
          popup-content-style="font-size: 1.1em"
          class="toolbar-model-selector"
        >
          <template v-slot:append>
            <q-avatar size="30px">
              <img src="~assets/qchatgpt-logo-green.svg" />
            </q-avatar>
          </template>
        </q-select>

        <q-space />

        <div>QChatGPT v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list> </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { version } from "../../package.json";
import { ref } from "vue";
import { useQuasar } from "quasar";
const $q = useQuasar();

defineOptions({
  name: "MainLayout",
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const models = ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
const model = ref($q.localStorage.getItem("model") || models[0]);
</script>

<style scoped>
.toolbar-model-selector {
  width: 170px;
  font-size: 1.1em;
}

/* Change the background color for highlighted, standout, and dark-themed QSelect components */
:deep(.q-field--highlighted.q-field--standout.q-field--dark .q-field__control) {
  background: var(--q-dark) !important;
}

/* Change the text color for highlighted, standout, and dark-themed QSelect components */
:deep(.q-field--highlighted.q-field--standout.q-field--dark .q-field__native) {
  color: #fff;
}
</style>
