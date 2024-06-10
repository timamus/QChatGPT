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
      <q-item clickable v-ripple @click="handleNewChat">
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
        <q-list v-if="chats.length !== 0">
          <q-item
            v-for="chat in chats"
            :key="chat.id"
            clickable
            v-ripple
            @click="handleSelectChat(chat.id)"
            :class="{ 'selected-chat': selectedChatId === chat.id }"
          >
            <q-item-section avatar style="margin-right: 5px">
              <q-icon name="message" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis truncate">{{
                chat.name
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator class="my-separator" inset />

      <!-- Button to clear the chat -->
      <q-item clickable v-ripple @click="showClearChatsDialog">
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
      <q-item clickable v-ripple @click="copyLink">
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
      <q-item clickable v-ripple @click="showAboutDialog">
        <q-item-section avatar>
          <q-icon name="info" style="color: primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>About</q-item-label>
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-footer bordered class="custom-footer"> <send-component /> </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { version } from "../../package.json";
import { ref, onMounted } from "vue";
import { settings } from "src/settings";
import { thumbStyle, barStyle } from "src/styles";
import SettingsDialog from "src/components/SettingsDialog.vue";
import AboutDialog from "src/components/AboutDialog.vue";
import ClearChatsDialog from "src/components/ClearChatsDialog.vue";
import SendComponent from "src/components/SendComponent.vue";
import { useQuasar, copyToClipboard } from "quasar";
import {
  selectedChatId,
  chats,
  fetchChats,
  selectChat,
} from "../services/chatDBServices.js";

const $q = useQuasar();

defineOptions({
  name: "MainLayout",
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

onMounted(async () => {
  await fetchChats();
});

const handleNewChat = async () => {
  await selectChat(null);
  closeDrawerIfOverlay();
};

const handleSelectChat = async (chatId) => {
  await selectChat(chatId);
  closeDrawerIfOverlay();
};

const saveModel = () => {
  $q.localStorage.setItem("model", settings.model.value);
};

function showClearChatsDialog() {
  $q.dialog({
    component: ClearChatsDialog,
    // componentProps: {},
  });
}

function showSettingsDialog() {
  $q.dialog({
    component: SettingsDialog,
    // componentProps: {},
  });
}

function showAboutDialog() {
  $q.dialog({
    component: AboutDialog,
    // componentProps: {},
  });
}

/**
 * Copies the OpenAI billing page link to the clipboard
 */
const copyLink = async () => {
  // Attempt to copy the link to the clipboard
  await copyToClipboard(
    "https://platform.openai.com/settings/organization/billing/overview"
  )
    .then(() => {
      // Show a success notification if the copy operation is successful
      $q.notify({
        color: "green",
        position: "bottom",
        message: "Link Copied",
        icon: "done",
        timeout: 2000,
      });
    })
    .catch(() => {
      // Show an error notification if the copy operation fails
      $q.notify({
        color: "red",
        position: "bottom",
        message: "Failed to copy link",
        icon: "error",
        timeout: 2000,
      });
      console.error("Failed to copy link:", error);
    });
};

// Close the left drawer menu if in overlay mode
function closeDrawerIfOverlay() {
  // Close the left drawer menu if the screen is small
  if ($q.screen.sm) {
    leftDrawerOpen.value = false;
  }
}
</script>

<style scoped>
.q-item {
  font-size: 1.1em;
}

.q-item__section--avatar {
  min-width: 0px;
}

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

.my-separator {
  background: #027be3 !important;
}

.custom-footer {
  background-color: #050a14;
}

.selected-chat {
  background-color: #3d3d3d; /* Background color of the current (selected) chat */
}

.truncate {
  max-width: 220px; /* Maximum width of the chat name */
}
</style>
