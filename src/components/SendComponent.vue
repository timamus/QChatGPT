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
    <template v-slot:append>
      <q-spinner-dots size="2rem" v-if="isLoading" />
      <div>
        <q-btn
          round
          flat
          icon="send"
          @click="sendMessage"
          :disable="isLoading"
          v-if="!isLoading"
        />
        <q-btn
          round
          flat
          icon="stop_circle"
          @click="abortStream"
          v-if="isLoading"
        />
      </div>
    </template>
  </q-input>
</template>

<script setup>
import { ref } from "vue";
import OpenAI from "openai";
import { settings } from "src/settings";
import {
  selectedChatId,
  messages,
  lastApiCallTime,
  createChat,
  saveChat,
} from "../services/chatDBServices.js";

const newMessage = ref("");
const isLoading = ref(false);
let stream = ref(null);
let isNoAbort = false;

// Create a new instance of the OpenAI client
function getOpenAI() {
  return new OpenAI({
    apiKey: settings.apiKey.value,
    dangerouslyAllowBrowser: true,
  });
}

// Send a new message to the OpenAI API and handle the response stream
const sendMessage = async () => {
  // Ensure input is not empty and response is not in progress
  if (!newMessage.value || isLoading.value) {
    return;
  }

  // Update the time before making the API call
  lastApiCallTime.value = new Date(); // This assigns the current date and time

  // Add the new message to the messages array with role 0 (user)
  messages.value.push({ text: newMessage.value, role: 0 });
  newMessage.value = "";
  isLoading.value = true;

  // Filter out error messages and map the messages to the required API format
  const apiMessages = messages.value
    .filter((message) => message.role !== 2) // Do not send error messages to the API
    .map((message) => {
      let role;
      switch (message.role) {
        case 0:
          role = "user";
          break;
        case 1:
          role = "assistant";
          break;
        case 2:
          role = "error";
          break;
      }
      return {
        role: role,
        content: message.text,
      };
    });

  let isError = false;
  const openai = getOpenAI();

  // Send messages to the OpenAI API and handle the response stream
  stream.value = await openai.chat.completions
    .create({
      model: settings.model.value,
      messages: apiMessages,
      temperature: settings.temperature.value,
      top_p: settings.top_p.value,
      frequency_penalty: settings.frequency_penalty.value,
      presence_penalty: settings.presence_penalty.value,
      stream: true,
    })
    .catch(async (err) => {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.message);
      console.log(err.headers); // {server: 'nginx', ...}
      isError = true;
      messages.value.push({ text: "Error: " + err.message, role: 2 });
      //throw err;
    });

  if (!isError) {
    messages.value.push({ text: "", role: 1 });
  }

  let chatId = null;
  isNoAbort = true;

  // Create or use selected chat ID
  if (selectedChatId.value === null) {
    chatId = await createChat();
  } else {
    chatId = selectedChatId.value;
  }

  isNoAbort = false;

  // Save the chat if there was an error, otherwise process the response stream
  if (isError) {
    // Save chat to the database if the messages array changes
    chatId = await saveChat(chatId, messages.value);
  } else {
    for await (const chunk of stream.value) {
      const textResponse = chunk.choices[0]?.delta?.content || "";
      messages.value[messages.value.length - 1].text += textResponse;
      // Save chat to the database if the messages array changes
      chatId = await saveChat(chatId, messages.value);
    }
  }
  isLoading.value = false;
};

// Abort the response stream if it exists
const abortStream = () => {
  if (stream.value) {
    stream.value.controller.abort();
  }
};
</script>

<style scoped>
.my-input {
  max-width: 50rem !important;
  margin: 0 auto; /* Center alignment */
  font-size: 1.1em;
}

:deep(.q-field__append) {
  align-self: flex-end;
}
</style>
