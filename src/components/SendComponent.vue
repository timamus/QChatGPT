<template>
  <div v-show="hasFiles" class="q-pt-md q-px-md">
    <q-uploader
      ref="uploader"
      label="Uploaded files"
      multiple
      class="custom-uploader scrollbar-styled"
      @added="handleUpload"
      @removed="handleFileRemove"
      flat
      hide-upload-btn
      clearable
      max-files="10"
      max-file-size="5242880"
      accept=".png,.jpeg,.jpg,.webp,.gif"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn
            v-if="scope.queuedFiles.length > 0"
            icon="clear_all"
            @click="scope.removeQueuedFiles"
            round
            dense
            flat
          >
            <q-tooltip>Clear All</q-tooltip>
          </q-btn>
          <q-spinner v-if="isUploading" class="q-uploader__spinner" />
          <div class="col">
            <div class="q-uploader__title">Uploaded files</div>
            <div class="q-uploader__subtitle">
              {{ scope.uploadSizeLabel }} / {{ uploadProgressLabel }}
            </div>
          </div>
          <q-btn
            v-if="scope.canAddFiles"
            type="a"
            icon="add_box"
            @click="scope.pickFiles"
            round
            dense
            flat
          >
            <q-uploader-add-trigger />
            <q-tooltip>Pick Files</q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-uploader>
  </div>
  <q-input
    filled
    v-model="newMessage"
    label="Send a message"
    @keydown.enter.prevent="handleEnterPress"
    class="q-px-md q-pt-md my-input flex items-end"
    :input-style="{ maxHeight: '284px' }"
    clearable
    autogrow
  >
    <template v-slot:prepend>
      <q-btn round flat icon="attach_file" @click="triggerUpload" />
    </template>
    <template v-slot:append>
      <q-spinner-dots size="2rem" v-if="isLoading" />
      <div>
        <q-btn
          round
          flat
          icon="sym_o_imagesmode"
          :color="isImageGeneration ? 'green' : ''"
          @click="isImageGeneration = !isImageGeneration"
        ></q-btn>
        <q-btn
          round
          flat
          icon="send"
          @click="sendMessage"
          :disable="isLoading"
          v-if="!isLoading"
        />
        <q-btn
          round
          flat
          icon="stop_circle"
          @click="abortStream"
          v-if="isLoading && !isImageGeneration"
        />
      </div>
    </template>
  </q-input>
  <div class="q-pt-xs text-center centered-text">
    ChatGPT can make mistakes. Check important info.
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import {
  sendMessage as sendOpenAIMessage,
  abortStream,
  isLoading,
  isImageGeneration
} from "../services/openAIServices.js";
import { settings } from "src/settings";

const newMessage = ref("");
// Variables for file upload
const uploader = ref(null); // File uploader
const hasFiles = ref(false); // Flag indicating if files are present
const uploadedFiles = ref([]); // List of uploaded files
const uploadProgressLabel = ref("0%"); // Upload progress label
const isUploading = ref(false); // Flag indicating upload process

const isValidMessage = (message) => {
  // Trim the message and check if it's not empty
  return message.trim().length > 0;
};

const sendMessage = async () => {
  if (newMessage.value && isValidMessage(newMessage.value)) {
    await sendOpenAIMessage(
      newMessage,
      uploadedFiles,
      uploader
    );
  }
};

const handleEnterPress = (event) => {
  if (event.ctrlKey) {
    // Send message if Ctrl + Enter is pressed
    sendMessage();
  } else if (settings.sendOnEnter.value) {
    // Send message if Enter is pressed and sendOnEnter is true
    sendMessage();
  } else {
    // Insert a new line if sendOnEnter is false
    const position = event.target.selectionStart;
    newMessage.value =
      newMessage.value.slice(0, position) +
      "\n" +
      newMessage.value.slice(position);
    nextTick(() => {
      event.target.selectionStart = position + 1;
      event.target.selectionEnd = position + 1;
    });
  }
};

const triggerUpload = (event) => {
  if (uploader.value) {
    uploader.value.pickFiles(event);
  }
};

const updateUploadProgressLabel = () => {
  const totalFiles = uploader.value.files.length;
  const convertedFiles = uploadedFiles.value.length;
  const progress =
    totalFiles > 0 ? Math.round((convertedFiles / totalFiles) * 100) : 0;
  uploadProgressLabel.value = `${progress}%`;
};

function handleUpload(files) {
  hasFiles.value = uploader.value.files.length > 0;
  isUploading.value = true;
  files.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      uploadedFiles.value.push({
        file: {
          name: file.name,
          content: e.target.result,
        },
      });
      updateUploadProgressLabel();
      if (index === files.length - 1) {
        isUploading.value = false;
      }
    };
    reader.readAsDataURL(file);
  });
}

const handleFileRemove = (removedFiles) => {
  removedFiles.forEach((removedFile) => {
    uploadedFiles.value = uploadedFiles.value.filter(
      (file) => file.file.name !== removedFile.name
    );
  });
  hasFiles.value = uploader.value.files.length > 0;
  updateUploadProgressLabel();
};
</script>

<style scoped>
.custom-uploader {
  max-width: 48rem;
  width: 100%;
  margin: 0 auto;
  font-size: 1.1em;
  background: rgba(255, 255, 255, 0.07);
}

:deep(.custom-uploader .q-uploader__file) {
  width: 150px;
  height: 150px;
  margin-top: 8px; /* Add vertical spacing */
  margin-left: 8px; /* Add horizontal spacing between elements */
}

:deep(.custom-uploader .q-uploader__file--img) {
  background-size: cover; /* Set background to cover the entire element */
}

:deep(.custom-uploader .q-uploader__list) {
  display: flex;
  flex-wrap: wrap; /* Ensure items wrap to a new line if there is not enough space */
  align-items: center; /* Align items vertically in the center */
  justify-content: flex-start; /* Align items at the start of the container */
}

:deep(.custom-uploader .q-uploader__file-header) {
  align-items: start;
}

.my-input {
  max-width: 50rem !important;
  margin: 0 auto; /* Center alignment */
  font-size: 1.1em;
}

:deep(.q-field__append) {
  align-self: flex-end;
}

:deep(.q-field__prepend) {
  align-self: flex-end;
}

.centered-text {
  width: 100%;
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.7);
}
</style>
