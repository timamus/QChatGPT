<template>
  <div v-if="files">
    <div v-for="file in files" :key="file.name" class="file-item">
      <q-card class="card-file" flat bordered>
        <q-card-section class="row no-wrap items-center">
          <q-icon
            name="file_present"
            class="q-ma-xs col-auto flex flex-center"
            size="32px"
          ></q-icon>
          <div class="col">{{ file.name }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getFilesByIds } from "../services/chatDBServices.js";

const props = defineProps({
  fileIds: {
    type: Array,
    required: true,
  },
});

const files = ref([]);

onMounted(async () => {
  files.value = await getFilesByIds(props.fileIds);
});
</script>

<style scoped>
/* Styling for file card */
.card-file {
  margin-bottom: 1em;
  margin-top: 1em;
  max-width: 350px;
  background: rgba(0, 0, 0, 0) !important;
}

/* Styling adjustments for vertical card sections */
.q-card__section--vert {
  padding: 0 !important;
}
</style>
