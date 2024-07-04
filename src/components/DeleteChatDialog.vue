<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="q-dialog-plugin acrylic-effect">
      <q-card-section>
        <div class="text-h6">Delete chat?</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row items-center">
        <span>This will delete</span>
        <span class="chat-name q-ml-sm">{{ chatName }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Delete" color="negative" @click="onDeleteClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from "quasar";
import { deleteChat } from "../services/chatDBServices.js";

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
  chatName: {
    type: String,
    required: true,
  },
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

async function onDeleteClick() {
  await deleteChat(props.chatId); // Delete chat from DB
  onDialogOK(); // Execute the dialog OK action
}
</script>

<style scoped>
.q-dialog-plugin {
  font-size: 1.1em;
}

.chat-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
</style>
