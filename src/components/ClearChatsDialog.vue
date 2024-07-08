<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="q-dialog-plugin acrylic-effect">
      <q-card-section>
        <div class="text-h5">Clear chat history?</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <span>Are you sure you want to clear all chats?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Clear" color="negative" @click="onClearClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from "quasar";
import { fetchChats, clearChats } from "../services/chatDBServices.js";

const props = defineProps({
  // ...your custom props
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

async function onClearClick() {
  await clearChats(); // Clear all chats from the database
  await fetchChats(); // Fetch the updated list of chats
  onDialogOK(); // Execute the dialog OK action
}
</script>

<style scoped>
.q-dialog-plugin {
  font-size: 1.1em;
}
</style>
