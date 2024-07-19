// src/settings.js

import { ref, watch } from "vue";
import { LocalStorage } from "quasar";

export const settings = {
  apiKey: ref(""),
  models: ref(["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]),
  model: ref("gpt-4o"),
  temperature: ref(1),
  top_p: ref(1),
  frequency_penalty: ref(0),
  presence_penalty: ref(0),
  prompt: ref(""),
  sendOnEnter: ref(true),
  imageSize: ref("1024x1024"),
  imageStyle: ref("vivid"),
};

export function loadSettings() {
  const keys = [
    "apiKey",
    "models",
    "model",
    "temperature",
    "top_p",
    "frequency_penalty",
    "presence_penalty",
    "prompt",
    "sendOnEnter",
    "imageSize",
    "imageStyle",
  ];

  keys.forEach((key) => {
    const value = LocalStorage.getItem(key);
    if (value !== null) {
      if (key === "models") {
        settings[key].value = JSON.parse(value);
      } else if (
        [
          "temperature",
          "top_p",
          "frequency_penalty",
          "presence_penalty",
        ].includes(key)
      ) {
        settings[key].value = parseFloat(value);
      } else if (key === "sendOnEnter") {
        settings[key].value = value === "true";
      } else {
        settings[key].value = value;
      }
    }
  });
}

export function saveSettings() {
  LocalStorage.set("apiKey", settings.apiKey.value);
  LocalStorage.set("models", JSON.stringify(settings.models.value));
  LocalStorage.set("model", settings.model.value);
  LocalStorage.set("temperature", settings.temperature.value.toString());
  LocalStorage.set("top_p", settings.top_p.value.toString());
  LocalStorage.set(
    "frequency_penalty",
    settings.frequency_penalty.value.toString()
  );
  LocalStorage.set(
    "presence_penalty",
    settings.presence_penalty.value.toString()
  );
  LocalStorage.set("prompt", settings.prompt.value);
  LocalStorage.set("sendOnEnter", settings.sendOnEnter.value.toString());
  LocalStorage.set("imageSize", settings.imageSize.value);
  LocalStorage.set("imageStyle", settings.imageStyle.value);
}

// Automatically save settings when they change
Object.keys(settings).forEach((key) => {
  watch(settings[key], () => {
    saveSettings();
  });
});
