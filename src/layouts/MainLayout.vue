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
          v-model="settings.model.value"
          :options="settings.models"
          @update:model-value="saveModel"
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
      <!-- Button to start a new chat -->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>New chat</q-item-section>
      </q-item>

      <q-separator class="my-separator" inset />

      <!-- List of saved ChatGPT chats -->
      <q-scroll-area
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        style="height: calc(100% - 295px)"
      >
      </q-scroll-area>

      <q-separator class="my-separator" inset />

      <!-- Button to clear the chat -->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="delete" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Clear conversations</q-item-label>
        </q-item-section>
      </q-item>
      <!-- Button to open the settings window here -->
      <q-item clickable v-ripple @click="showSettingsDialog">
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Settings</q-item-label>
        </q-item-section>
      </q-item>
      <!-- Button to copy the link to the API purchase page -->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="link" />
        </q-item-section>
        <q-item-section>
          <q-item-label>OpenAI billing page</q-item-label>
        </q-item-section>
      </q-item>
      <!-- Button for donations -->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="favorite" color="purple" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Donate</q-item-label>
        </q-item-section>
      </q-item>
      <!-- About button -->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="info" style="color: primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>About</q-item-label>
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { version } from "../../package.json";
import { ref } from "vue";
import { settings } from "src/settings";
import { thumbStyle, barStyle } from "src/styles";
import SettingsDialog from "src/components/SettingsDialog.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();

defineOptions({
  name: "MainLayout",
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const saveModel = () => {
  $q.localStorage.setItem("model", settings.model.value);
};

function showSettingsDialog() {
  $q.dialog({
    component: SettingsDialog,
    // componentProps: {},
  });
}
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
