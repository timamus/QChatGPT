<template>
  <q-scroll-area
    ref="scrollAreaRef"
    :thumb-style="thumbStyle"
    :bar-style="barStyle"
    class="q-scroll-area fit absolute"
  >
    <div v-if="messages.length !== 0">
      <!-- <div v-for="message in messages" :key="message.id">
        {{ message.text }}
      </div> -->
      <messages-component :messages="messages" />
    </div>
  </q-scroll-area>
</template>

<script setup>
import { ref, watch } from "vue";
import MessagesComponent from "./MessagesComponent.vue";
import { thumbStyle, barStyle } from "src/styles";
import { selectedChatId, messages } from "../services/chatDBServices.js";

const scrollAreaRef = ref(null);

// Watch for changes in the messages array
watch(
  messages,
  async (newMessages, oldMessages) => {
    // Get the scroll percentage for the top of the scroll area
    let scrollPercentageTop = scrollAreaRef.value.getScrollPercentage().top;

    // Check if the scroll position is near the bottom
    if (scrollPercentageTop >= 0.995 && scrollPercentageTop <= 1) {
      // If so, scroll to the bottom
      scrollAreaRef.value.setScrollPosition(
        "vertical",
        scrollAreaRef.value.getScroll().verticalSize
      );
    }
  },
  { deep: true } // Enable deep watching for changes within the messages array
);

// Watch for changes in the selectedChatId
watch(selectedChatId, async (newId, oldId) => {
  if (newId !== oldId) {
    // Delay to ensure the DOM has updated
    setTimeout(() => {
      if (scrollAreaRef.value) {
        // Scroll to a large vertical position (bottom)
        scrollAreaRef.value.setScrollPosition("vertical", 1000000);
      } else {
        console.error("scrollAreaRef is not defined");
      }
    }, 100); // 100 milliseconds delay
  }
});
</script>

<style scoped>
.q-scroll-area {
  height: 100%;
  width: 100%;
}
</style>
