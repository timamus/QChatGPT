import { ref } from "vue";
import db from "boot/db";

export let chats = ref([]);
export let messages = ref([]);
export let selectedChatId = ref(null);

// Variable to store the time of the last OpenAI API call
export let lastApiCallTime = ref(null);

// Fetch all chats from the database, sort them, and select the most recent one
export const fetchChats = async () => {
  const loadedChats = await db.chats.toArray();
  // Check if there are any chats
  if (loadedChats.length > 0) {
    // Sort chats by the last modified date, starting with the most recent
    const sortedChats = loadedChats.sort(
      (a, b) => b.lastModified - a.lastModified
    );
    chats.value = sortedChats;
    return chats.value[0].id;
  }
  return null;
};

// Create a new chat and select it
export const createChat = async () => {
  const chatId = await db.chats.add({
    name: "New chat",
    messages: [],
    lastModified: new Date(),
  });
  selectedChatId.value = chatId;
  return chatId;
};

// Select a chat by its ID and load its messages
export const selectChat = async (chatId) => {
  if (chatId) {
    selectedChatId.value = chatId;
    try {
      // Attempt to load messages for the selected chat
      messages.value = await loadChat(chatId);
    } catch (error) {
      // Handle potential errors when loading the chat
      console.error("Ошибка при загрузке чата:", error);
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
  await db.chats.clear();
  chats.value = [];
  messages.value = [];
  selectedChatId.value = null;
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
      .filter((message) => message.role !== 2) // Do not save error messages to the DB
      .map((message) => ({
        role: message.role,
        text: message.text,
      }));
    // Rename the chat if there are messages
    if (newMessages.length > 0) {
      chat.name = newMessages[0].text.substring(0, 50); // Update chat name
    }
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
  await fetchChats();
  await saveMessagesToChat(chatId, newMessages);
  return chatId;
};
