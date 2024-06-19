// src/openAIServices.js

import axios from "axios";

export const fetchModels = async (apiKey) => {
  try {
    const response = await axios.get("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
};

export const fetchGptModels = async (apiKey) => {
  const allModels = await fetchModels(apiKey);
  return allModels
    .filter((model) => model.id.includes("gpt"))
    .map((model) => model.id);
};