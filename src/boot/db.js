import Dexie from "dexie";

const db = new Dexie("ChatDB");

db.version(1).stores({
  chats: "++id, name, messages, lastModified", // Table for storing chats
  files: "++id, chatId, name, content", // Table for storing files
  images: "++id, chatId, content", // Table for stroing images from Dall-E
});

export default db;
