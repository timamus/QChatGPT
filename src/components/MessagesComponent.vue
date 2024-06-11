<template>
  <!-- List of messages; only displayed if there are messages -->
  <q-list v-if="messages.length !== 0">
    <!-- Iterate through each message -->
    <q-item
      v-for="message in messages"
      :key="message.id"
      :class="{
        'sent-message': message.role === 0,
        'received-message': message.role !== 0,
      }"
      class="justify-center"
    >
      <!-- Display avatar for the user -->
      <q-avatar size="30px" class="q-mx-md" v-if="message.role === 0">
        <img src="~assets/Font_Awesome_5_solid_user-circle.svg" />
      </q-avatar>
      <!-- Display avatar for ChatGPT -->
      <q-avatar size="30px" class="q-mx-md" v-if="message.role === 1">
        <img src="~assets/qchatgpt-logo-green.svg" />
      </q-avatar>
      <!-- Display warning icon for system messages -->
      <q-avatar
        size="30px"
        font-size="20px"
        color="red"
        text-color="white"
        icon="warning"
        class="q-mx-md"
        v-if="message.role === 2"
      />
      <q-item-section class="custom-message">
        <q-item-label class="text-subtitle1">{{
          message.role === 0 ? "You" : "ChatGPT"
        }}</q-item-label>
        <!-- Display plain text for user messages -->
        <template v-if="message.role === 0">
          <pre class="pre-wrap">{{ message.text }}</pre>
        </template>
        <!-- Display processed text for ChatGPT or system messages -->
        <template
          v-else
          v-for="(part, index) in splitMessage(message.text)"
          :key="'template-' + index"
        >
          <pre
            class="pre-wrap"
            v-if="!isCode(part)"
            :key="'text-' + index"
            :style="{ color: message.role === 2 ? 'red' : 'whitesmoke' }"
            >{{ part.trim() }}</pre
          >
          <q-card flat bordered class="card-code" v-else :key="'code-' + index">
            <q-item>
              <q-item-section>
                <q-item-label>
                  <!-- Language name header for the code block -->
                  {{ getLanguage(part) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn @click="copyCode(part)">
                  <q-icon name="content_copy" />
                  Copy code
                </q-btn>
              </q-item-section>
            </q-item>

            <q-separator />

            <!-- Section to display code highlighting -->
            <q-card-section style="display: flex; flex: 1 0 0">
              <div style="display: grid">
                <div class="pre-content" style="overflow-x: auto">
                  <highlightjs
                    style="padding-left: 1em"
                    :autodetect="false"
                    :language="getLanguageClass(part)"
                    :code="highlightCode(part)"
                  />
                </div>
              </div>
            </q-card-section>

            <!-- This code works too, but when you scroll the code, the selection is lost -->
            <!-- <q-card-section>
            <q-scroll-area
              :thumb-style="thumbStyle"
              :bar-style="barStyle"
              :style="{ height: height, width: '100%' }"
            >
              <pre v-html="highlightCode(part)" :class="getLanguageClass(part)"></pre>
              <q-resize-observer @resize="onResize" />
            </q-scroll-area>
          </q-card-section> -->
          </q-card>
        </template>
      </q-item-section>
      <!-- Button to copy the entire message block -->
      <q-item-section side class="items-start self-start">
        <q-btn icon="content_copy" @click="copyBlock(message.text)" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { useQuasar, copyToClipboard } from "quasar";
import { thumbStyle, barStyle } from "src/styles";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

// Function to split messages into text and code parts
const splitMessage = (text) => {
  let result = [];
  let start = 0;
  let end = 0;
  while ((start = text.indexOf("```", end)) !== -1) {
    if (start !== end) {
      result.push(text.slice(end, start));
    }
    end = text.indexOf("```", start + 3);
    if (end === -1) {
      end = text.length;
    } else {
      end += 3;
    }
    result.push(text.slice(start, end));
  }
  if (end !== text.length) {
    result.push(text.slice(end));
  }
  return result;
  // Use cases:
  //console.log(splitMessage("Hello ```World``` !")); // ['Hello ', '```World```', ' !']
  //console.log(splitMessage("Hello ```World")); // ['Hello ', '```World']
  //console.log(splitMessage("Hello ```World```")); // ['Hello ', '```World```']
  //console.log(splitMessage("```Hello``` World")); // ['```Hello```', ' World']
};

// Check if a text segment is a code block
const isCode = (text) => text.startsWith("```");

// Remove code markers from a text
const removeCodeMarkers = (text) => {
  return text.replace(/```.*\n?/g, "").replace(/```/g, "");
};

// Map to convert short language names to full names for syntax highlighting
const languageMap = {
  "c#": "csharp",
  cs: "csharp",
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  "c++": "cpp",
  sh: "bash",
  kt: "kotlin",
  rs: "rust",
  proto: "protobuf",
  vue: "javascript",
};

// Detect language from code block
const detectLanguage = (code) => {
  const language = getLanguage(code).toLowerCase();
  const mappedLanguage = languageMap[language] || language;
  return mappedLanguage;
};

// Get CSS class for language
const getLanguageClass = (part) => {
  const language = detectLanguage(part);
  return language;
};

// Escape HTML for safe insertion
const escapeHtml = (html) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Highlight code for display
const highlightCode = (code) => {
  const cleanCode = removeCodeMarkers(code);
  const escapedCode = escapeHtml(cleanCode);

  return cleanCode;
};

// Get language from code block
const getLanguage = (code) => {
  const match = code.match(/```(.*)/);
  return match ? match[1] : "plaintext";
};

// Use Quasar to handle notifications
const $q = useQuasar();

// Function to copy code to clipboard
const copyCode = async (part) => {
  const codeOnly = part.split("\n").slice(1, -1).join("\n");
  await copyToClipboard(codeOnly).then(() => {
    $q.notify({
      color: "green",
      position: "bottom",
      message: "Code Copied",
      icon: "done",
      timeout: 2000,
    });
  });
};

// Function to copy entire text block to clipboard
const copyBlock = async (text) => {
  await copyToClipboard(text).then(() => {
    $q.notify({
      color: "green",
      position: "bottom",
      message: "Text Copied",
      icon: "done",
      timeout: 2000,
    });
  });
};
</script>

<style scoped>
/* Styling for sent and received messages */
.sent-message {
  background-color: #002433;
}

.received-message {
  background-color: #080e1a;
}

/* Styling for code card */
.card-code {
  margin-bottom: 1em;
  margin-top: 1em;
  max-width: 100%;
}

/* Dark theme styling for code card */
.q-dark.card-code {
  background: #002433 !important;
}

/* Styling for preformatted text display */
.pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: whitesmoke;
  font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
  font-size: 1.1em;
  max-width: 48rem !important;
  margin: 0;
}

/* Deep styling for code highlighting */
:deep(pre code.hljs) {
  background: #002433 !important;
  padding: 0 !important;
  overflow-x: visible !important;
}

/* Styling adjustments for vertical card sections */
.q-card__section--vert {
  padding: 0 !important;
}

/* Custom styling for message display */
.custom-message {
  max-width: 48rem !important;
  padding-bottom: 1em;
}

/* Styling for item labels */
.q-item__label {
  word-wrap: break-word;
  max-width: 100%;
  font-size: 1.1em;
}
</style>
