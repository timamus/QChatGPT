// src/services/chatDBServices.js

import { ref } from "vue";
import db from "boot/db";

import { abortStream } from "../services/openAIServices.js";

export let chats = ref([]);
export let messages = ref([]);
export let selectedChatId = ref(null);

// Variable to store the time of the last OpenAI API call
export let lastApiCallTime = ref(null);

// Fetch all chats from the database, sort them, and select the most recent one
export const fetchChats = async (filterWord) => {
  const loadedChats = await db.chats.toArray();

  // Check if there are any chats
  if (loadedChats.length > 0) {
    let filteredChats;

    if (filterWord) {
      // Convert filterWord to lowercase for case-insensitive search
      const lowerFilterWord = filterWord.toLowerCase();

      // Filter chats based on the filter word in messages
      filteredChats = loadedChats.filter((chat) =>
        chat.messages.some(
          (message) =>
            message.role === 0 &&
            message.text.toLowerCase().includes(lowerFilterWord)
        )
      );
    } else {
      // If filterWord is empty, don't filter, just use all chats
      filteredChats = loadedChats;
    }

    // Sort chats by the last modified date, starting with the most recent
    const sortedChats = filteredChats.sort(
      (a, b) => b.lastModified - a.lastModified
    );

    // Map to only include the required fields
    const mappedChats = sortedChats.map((chat) => ({
      id: chat.id,
      name: chat.name,
      lastModified: chat.lastModified,
    }));

    chats.value = mappedChats;

    // Return the ID of the most recent chat or null if no chats
    return chats.value.length > 0 ? chats.value[0].id : null;
  }
  chats.value = [];
  return null;
};

// Create a new chat and select it
export const createChat = async (incomingText) => {
  // Check if incomingText exists and is not empty
  // Use the first 50 characters as the name or "New chat"
  const name =
    incomingText && incomingText.trim()
      ? incomingText.trim().substring(0, 50)
      : "New chat";
  const chatId = await db.chats.add({
    name: name,
    messages: [],
    lastModified: new Date(),
  });
  selectedChatId.value = chatId;
  return chatId;
};

// Select a chat by its ID and load its messages
export const selectChat = async (chatId) => {
  abortStream();
  if (chatId) {
    selectedChatId.value = chatId;
    try {
      // Attempt to load messages for the selected chat
      messages.value = await loadChat(chatId);
    } catch (error) {
      // Handle potential errors when loading the chat
      console.error("Error loading chat:", error);
      // Clear messages or set them to an error state
      messages.value = [];
    }
  } else {
    selectedChatId.value = null;
    messages.value = [];
  }
};

// Clear all chats from the database and reset state
export const clearChats = async () => {
  await selectChat(null);
  await db.chats.clear();
  await db.files.clear();
  chats.value = [];
};

// Load messages for a given chat ID
export const loadChat = async (chatId) => {
  if (chatId) {
    const selectedChat = await db.chats.get(chatId);
    return selectedChat ? selectedChat.messages : [];
  }
  return [];
};

// Save new messages to a chat, updating its metadata
export const saveMessagesToChat = async (chatId, newMessages) => {
  let chat = await db.chats.get(chatId);
  if (chat) {
    // Filter out error messages and map to the required format
    chat.messages = newMessages
      .filter((message) => message.role !== 2 && message.role !== 3) // Do not save error and system messages to the DB
      .map((message) => ({
        role: message.role,
        text: message.text,
        fileIds: message.fileIds ? Array.from(message.fileIds) : null,
      }));
    // Update the last modified date
    chat.lastModified = new Date();
    await db.chats.put(chat);
  }
};

// Save a chat and its messages, creating a new chat if necessary
export const saveChat = async (chatId, newMessages) => {
  if (!chatId) {
    chatId = await createChat();
  }
  await saveMessagesToChat(chatId, newMessages);
  await fetchChats();
  return chatId;
};

export const deleteChat = async (chatId) => {
  if (chatId) {
    try {
      // Get id and chatId of all files related to the given chatId
      const filesToDelete = [];
      await db.files.where({ chatId }).each((file) => {
        filesToDelete.push({ id: file.id, chatId: file.chatId });
      });

      // Delete all files related to the given chatId
      const fileIdsToDelete = filesToDelete.map((file) => file.id);
      await db.files.bulkDelete(fileIdsToDelete);

      // Delete the chat with the given ID
      await db.chats.delete(chatId);

      // Update the chats list by fetching all remaining chats
      await fetchChats();

      // If the deleted chat was the selected one, reset the selectedChatId and messages
      if (selectedChatId.value === chatId) {
        await selectChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }
};

// Function to save files to the files table with chatId
export const saveUploadedFiles = async (chatId, uploadedFiles) => {
  if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
    return []; // Return an empty array if there are no files
  }

  const fileIds = await Promise.all(
    uploadedFiles.map(async ({ file }) => {
      return await db.files.add({
        chatId,
        name: file.name,
        content: file.content,
      });
    })
  );

  return fileIds;
};

// Function to get file contents by their IDs
export const getFilesByIds = async (fileIds) => {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return []; // Return an empty array if fileIds is null or an empty array
  }
  return await db.files.where("id").anyOf(fileIds).toArray();
};
