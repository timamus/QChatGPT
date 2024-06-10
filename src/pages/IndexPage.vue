<template>
  <q-page class="flex flex-center">
    <chat-component />
  </q-page>
</template>

<script setup>
import ChatComponent from "components/ChatComponent.vue";

defineOptions({
  name: "IndexPage",
});
</script>
