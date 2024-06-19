// src/settings.js
import { ref } from "vue";
import { LocalStorage } from "quasar";

export const settings = {
  apiKey: ref(LocalStorage.getItem("apiKey") || ""),
  models: ref(
    LocalStorage.getItem("models")
      ? JSON.parse(LocalStorage.getItem("models"))
      : ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
  ),
  model: ref(LocalStorage.getItem("model") || "gpt-4o"),
  temperature: ref(parseFloat(LocalStorage.getItem("temperature")) || 1),
  top_p: ref(parseFloat(LocalStorage.getItem("top_p")) || 1),
  frequency_penalty: ref(
    parseFloat(LocalStorage.getItem("frequency_penalty")) || 0
  ),
  presence_penalty: ref(
    parseFloat(LocalStorage.getItem("presence_penalty")) || 0
  ),
  prompt: ref(LocalStorage.getItem("prompt") || ""),
};
