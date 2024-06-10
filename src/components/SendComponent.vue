<template>
  <q-input
    outlined
    bottom-slots
    v-model="newMessage"
    label="Send a message"
    @keydown.enter.prevent="newMessage ? sendMessage() : null"
    class="q-pa-md my-input flex items-end"
    :input-style="{ maxHeight: '284px' }"
    clearable
    autogrow
  >
  </q-input>
</template>

<script setup>
import { ref } from "vue";

const newMessage = ref("");

const sendMessage = async () => {
  return "";
};
</script>

<style scoped>
.my-input {
  max-width: 50rem !important;
  margin: 0 auto; /* Center alignment */
  font-size: 1.1em;
}

.my-input .q-field__append {
  align-self: flex-end;
  margin-left: 10px;
}
</style>
