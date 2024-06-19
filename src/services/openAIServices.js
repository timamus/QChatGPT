// src/openAIServices.js

import axios from "axios";

// Fetch all models from OpenAI API
export const fetchModels = async (apiKey) => {
  const response = await axios.get("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data.data;
};

// Fetch only GPT models
export const fetchGptModels = async (apiKey) => {
  const allModels = await fetchModels(apiKey);
  return allModels
    .filter((model) => model.id.includes("gpt"))
    .map((model) => model.id);
};
