// src/services/openAIServices.js

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

function getOpenAI() {
  return new OpenAI({
    apiKey: settings.apiKey.value,
    dangerouslyAllowBrowser: true,
  });
}

export let stream = null;
export let isLoading = ref(false);
let isNoAbort = false;

// Send a new message to the OpenAI API and handle the response stream
export async function sendMessage(newMessage, uploadedFiles, uploader) {
  // Ensure input is not empty and response is not in progress
  if (!newMessage.value || isLoading.value) {
    return;
  }

  // Update the time before making the API call
  lastApiCallTime.value = new Date(); // This assigns the current date and time

  // Add the new message to the messages array with role 0 (user)
  messages.value.push({
    role: 0,
    text: newMessage.value,
    files:
      uploadedFiles.value.length > 0
        ? uploadedFiles.value.map((file) => ({
            name: file.file.name,
            content: file.file.content,
          }))
        : null,
  });

  newMessage.value = "";
  isLoading.value = true;

  if (uploader && uploader.value && uploader.value.removeQueuedFiles) {
    // Call removeQueuedFiles to clear uploaded files after adding the message
    uploader.value.removeQueuedFiles();
  }

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
        case 3:
          role = "system";
          break;
      }

      if (message.files && message.files.length > 0) {
        const content = [];

        if (message.text) {
          content.push({ type: "text", text: message.text });
        }

        message.files.forEach((file) => {
          content.push({
            type: "image_url",
            image_url: {
              url: file.content,
            },
          });
        });

        return {
          role: role,
          content: content,
        };
      } else {
        return {
          role: role,
          content: message.text,
        };
      }
    });

  // Add the system message at the beginning of apiMessages
  if (settings.prompt.value && settings.prompt.value.trim() !== "") {
    apiMessages.unshift({
      role: "system",
      content: settings.prompt.value,
    });
  }

  let isError = false;

  const openai = getOpenAI();

  // Send messages to the OpenAI API and handle the response stream
  stream = await openai.chat.completions
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
    chatId = await createChat(messages.value[0].text);
  } else {
    chatId = selectedChatId.value;
  }

  isNoAbort = false;

  // Save the chat if there was an error, otherwise process the response stream
  if (isError) {
    // Save chat to the database if the messages array changes
    chatId = await saveChat(chatId, messages.value);
  } else {
    for await (const chunk of stream) {
      const textResponse = chunk.choices[0]?.delta?.content || "";
      if (messages.value.length > 0) {
        messages.value[messages.value.length - 1].text += textResponse;
        // Save chat to the database if the messages array changes
        chatId = await saveChat(chatId, messages.value);
      }
    }
  }
  isLoading.value = false;
}

// Abort the response stream if it exists
export function abortStream() {
  if (stream) {
    stream.controller.abort();
  }
}

// Fetch all models from OpenAI API
export const fetchModels = async () => {
  const openai = getOpenAI();
  const list = await openai.models.list();
  const models = [];
  for await (const model of list) {
    models.push(model);
  }
  return models;
};

// Fetch only GPT models
export const fetchGptModels = async () => {
  const allModels = await fetchModels();
  return allModels
    .filter((model) => model.id.includes("gpt"))
    .map((model) => model.id);
};
