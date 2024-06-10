<template>
  <q-scroll-area
    ref="scrollAreaRef"
    :thumb-style="thumbStyle"
    :bar-style="barStyle"
    class="q-scroll-area fit absolute"
  >
    <div v-if="messages.length !== 0">
      <!-- <div v-for="message in store.messages" :key="message.id">
      {{ message.text }}
    </div> -->
      <messages-component :messages="messages" />
    </div>
  </q-scroll-area>
</template>

<script setup>
import { ref } from "vue";
import MessagesComponent from "./MessagesComponent.vue";
import { thumbStyle, barStyle } from "src/styles";

const messages = ref([]);
</script>

<style scoped>
.q-scroll-area {
  height: 100%;
  width: 100%;
}
</style>
