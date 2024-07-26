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
          square
          filled
          v-model="settings.model.value"
          :options="settings.models.value"
          @update:model-value="saveModel"
          label="OpenAI Model"
          popup-content-class="popup-styled scrollbar-styled"
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
      <!-- Search field -->
      <q-input
        v-model="search"
        filled
        dense
        type="search"
        class="q-px-md q-py-sm"
        style="font-size: 1.1em"
        maxlength="50"
        @update:model-value="onSearchInput"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
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
        style="height: calc(100% - 346px)"
      >
        <q-list v-if="chats.length !== 0">
          <template v-for="chat in groupedChats" :key="chat.id">
            <q-item v-if="chat.isSeparator" class="separator-item">
              <!-- Timeline marker -->
              <q-item-section>
                <q-item-label class="text-subtitle2">{{
                  chat.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-else
              clickable
              v-ripple
              @click="handleSelectChat(chat.id)"
              :active="selectedChatId === chat.id"
              active-class="selected-chat"
            >
              <q-item-section avatar style="margin-right: 5px">
                <q-icon name="message" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis truncate">{{
                  chat.name
                }}</q-item-label>
              </q-item-section>
              <q-menu
                touch-position
                context-menu
                transition-show="jump-down"
                transition-hide="jump-up"
                class="popup-styled"
              >
                <!-- Popup menu -->
                <q-list dense style="min-width: 100px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="showDeleteChatDialog(chat.id, chat.name)"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" class="text-red" />
                    </q-item-section>
                    <q-item-section class="text-red">Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </template>
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
      <q-item clickable v-ripple @click="openApiLink">
        <q-item-section avatar>
          <q-icon name="link" />
        </q-item-section>
        <q-item-section>
          <q-item-label>OpenAI billing page</q-item-label>
        </q-item-section>
      </q-item>
      <!-- Button for donations -->
      <q-item clickable v-ripple @click="openDonateLink">
        <q-item-section avatar>
          <q-icon name="favorite" color="deep-purple" />
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

    <q-footer bordered> <send-component /> </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { version } from "../../package.json";
import { ref, onMounted, computed } from "vue";
import { settings, loadSettings } from "src/settings";
import { thumbStyle, barStyle } from "src/styles";
import SettingsDialog from "src/components/SettingsDialog.vue";
import AboutDialog from "src/components/AboutDialog.vue";
import DeleteChatDialog from "src/components/DeleteChatDialog.vue";
import ClearChatsDialog from "src/components/ClearChatsDialog.vue";
import SendComponent from "src/components/SendComponent.vue";
import { useQuasar, openURL, date } from "quasar";
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

const search = ref("");

const onSearchInput = async () => {
  await fetchChats(search.value);
};

onMounted(async () => {
  loadSettings(); // Load settings

  // Show settings dialog if API key is missing
  if (!settings.apiKey.value.trim()) {
    showSettingsDialog();
  }

  selectedChatId.value = await handleGetChats();
  await handleSelectChat(selectedChatId.value);
});

const handleGetChats = async () => {
  const id = await fetchChats();
  return id; // return the ID of the last modified chat
};

const handleNewChat = async () => {
  await selectChat(null);
  closeDrawerIfOverlay();
};

const handleSelectChat = async (chatId) => {
  await selectChat(chatId);
  closeDrawerIfOverlay();
};

// Groups chats by last modified date into timeline categories
const groupedChats = computed(() => {
  const today = date.startOfDate(new Date(), "day");
  const yesterday = date.addToDate(today, { days: -1 });
  const sevenDaysAgo = date.addToDate(today, { days: -7 });
  const thirtyDaysAgo = date.addToDate(today, { days: -30 });

  const result = [];
  let lastSeparator = null;

  chats.value.forEach((chat) => {
    const chatDate = date.startOfDate(chat.lastModified, "day");

    let label;
    if (chatDate >= today) {
      label = "Today";
    } else if (chatDate >= yesterday) {
      label = "Yesterday";
    } else if (chatDate >= sevenDaysAgo) {
      label = "Previous 7 days";
    } else if (chatDate >= thirtyDaysAgo) {
      label = "Previous 30 days";
    } else {
      label = date.formatDate(chat.lastModified, "MMMM YYYY");
    }

    if (lastSeparator !== label) {
      result.push({ isSeparator: true, label });
      lastSeparator = label;
    }

    result.push(chat);
  });

  return result;
});

const saveModel = () => {
  $q.localStorage.setItem("model", settings.model.value);
};

function showDeleteChatDialog(chatId, chatName) {
  $q.dialog({
    component: DeleteChatDialog,
    componentProps: {
      chatId: chatId,
      chatName: chatName,
    },
  });
}

function showClearChatsDialog() {
  $q.dialog({
    component: ClearChatsDialog,
    // componentProps: {},
  });
}

function showSettingsDialog() {
  closeDrawerIfOverlay();
  $q.dialog({
    component: SettingsDialog,
    // componentProps: {},
  });
}

function showAboutDialog() {
  closeDrawerIfOverlay();
  $q.dialog({
    component: AboutDialog,
    // componentProps: {},
  });
}

/**
 * Opens the OpenAI billing page link
 */
const openApiLink = async () => {
  closeDrawerIfOverlay();
  openURL("https://platform.openai.com/settings/organization/billing/overview");
};

/**
 * Opens the donation link
 */
const openDonateLink = async () => {
  closeDrawerIfOverlay();
  openURL("https://paypal.me/tmusab");
};

// Close the left drawer menu if in overlay mode
function closeDrawerIfOverlay() {
  // Close the left drawer menu if the screen is small
  if ($q.screen.sm || $q.screen.xs) {
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

.my-separator {
  background: #027be3 !important;
}

.separator-item {
  min-height: 36px !important;
}

.selected-chat {
  /* Background color of the current (selected) chat */
  /* background-color: #3d3d3d; */
  /* background-color: rgba(255, 255, 255, 0.14); */
  /* background-color: rgba(25, 118, 210, 0.14); */
}

.truncate {
  max-width: 220px; /* Maximum width of the chat name */
}
</style>
