<template>
  <q-resize-observer @resize="onResizeQPage" />
  <q-scroll-area
    ref="scrollAreaRef"
    :thumb-style="thumbStyle"
    :bar-style="barStyle"
    class="q-scroll-area fit absolute"
  >
    <div v-if="messages.length !== 0">
      <messages-component :messages="messages" />
      <q-resize-observer @resize="onResize" />
      <q-scroll-observer @scroll="onScroll" />
    </div>
    <div
      v-else
      class="flex flex-center self-end"
      :style="{ 'margin-top': `${marginTop}px`, width: '100%' }"
    >
      <q-resize-observer @resize="onResizeTipPanel" />
      <div class="row q-col-gutter-md tip-button-container">
        <div
          class="col-6 col-sm-3"
          v-for="button in TipButtons"
          :key="button.label"
        >
          <q-btn
            :icon="button.icon"
            :label="button.label"
            class="tip-button"
            no-caps
            @click="() => handleTipBtnAction(button.label)"
          />
        </div>
      </div>
    </div>
  </q-scroll-area>
</template>

<script setup>
import { ref, watch } from "vue";
import MessagesComponent from "./MessagesComponent.vue";
import { thumbStyle, barStyle } from "src/styles";
import {
  selectedChatId,
  messages,
  lastApiCallTime,
} from "../services/chatDBServices.js";
import { sendMessage as sendOpenAIMessage } from "../services/openAIServices.js";

const scrollAreaRef = ref(null);
const heightQPage = ref(0);
const heightTipPanel = ref(0);
const marginTop = ref(0);

const TipButtons = [
  {
    icon: "lightbulb_outline",
    label: "Tell me an interesting fact about dinosaurs",
  },
  {
    icon: "science",
    label: "Explain quantum computing in simple terms",
  },
  {
    icon: "terminal",
    label: "How do I make an HTTP request in JavaScript?",
  },
  {
    icon: "edit",
    label: "Suggest gift ideas for a 10-year-old's birthday",
  },
];

const handleTipBtnAction = async (label) => {
  await sendOpenAIMessage(ref(label), ref([]), null);
};

/**
 * Interpolates a value exponentially between two points (x0, y0) and (x1, y1).
 *
 * @param {number} x - The x-coordinate at which to interpolate.
 * @param {number} x0 - The x-coordinate of the first point.
 * @param {number} y0 - The y-coordinate of the first point.
 * @param {number} x1 - The x-coordinate of the second point.
 * @param {number} y1 - The y-coordinate of the second point.
 * @return {number} - The interpolated y-coordinate corresponding to x.
 */
function exponentialInterpolate(x, x0, y0, x1, y1) {
  // Calculate the exponent based on the given points
  const exponent = Math.log(y1 / y0) / (x1 - x0);
  // Return the interpolated value at x
  return y0 * Math.exp(exponent * (x - x0));
}

const scrollInfo = ref({});

const onResize = (size) => {
  // Get the scroll area size
  const scrollSize = scrollAreaRef.value.getScroll().verticalSize;
  // Determine the scroll percentage threshold based on content size
  const x0 = 600;
  const y0 = 0.85;
  const x1 = 25000;
  const y1 = 0.995;
  let scrollPercentageThreshold =
    scrollSize <= x0
      ? y0
      : scrollSize >= x1
      ? y1
      : exponentialInterpolate(scrollSize, x0, y0, x1, y1);
  // Get the scroll percentage for the top
  let scrollPercentageTop = scrollAreaRef.value.getScrollPercentage().top;
  // Check if the value is within the desired range
  if (
    scrollPercentageTop >= scrollPercentageThreshold &&
    scrollPercentageTop <= 1 &&
    scrollInfo.value.direction === "down"
  ) {
    // Scroll to the bottom
    scrollAreaRef.value.setScrollPosition(
      "vertical",
      scrollAreaRef.value.getScroll().verticalSize
    );
  }
};

const onScroll = (info) => {
  scrollInfo.value = info;
};

// Position the tip panel in the middle of the QPage height
const onResizeQPage = (size) => {
  heightQPage.value = size.height;
  const heightDelta = heightQPage.value - heightTipPanel.value;
  marginTop.value = heightDelta > 0 ? heightDelta / 2 : 0;
};

const onResizeTipPanel = (size) => {
  heightTipPanel.value = size.height;
};

// Watch for changes in the selectedChatId
watch(selectedChatId, async (newId, oldId) => {
  if (newId !== oldId) {
    // Delay to ensure the DOM has updated
    setTimeout(() => {
      if (scrollAreaRef.value) {
        // Scroll to the bottom
        scrollAreaRef.value.setScrollPosition(
          "vertical",
          scrollAreaRef.value.getScroll().verticalSize
        );
      } else {
        console.error("scrollAreaRef is not defined");
      }
    }, 100); // 100 milliseconds delay
  }
});

// Watch for changes in the lastApiCallTime
watch(lastApiCallTime, (newTime, oldTime) => {
  scrollAreaRef.value.setScrollPosition(
    "vertical",
    scrollAreaRef.value.getScroll().verticalSize,
    300
  );
});
</script>

<style scoped>
.q-scroll-area {
  height: 100%;
  width: 100%;
}

.tip-button-container {
  max-width: 44rem;
  width: 100%;
}

.tip-button {
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  width: 100%;
  height: 100%;
  font-size: 1.1em;
}
</style>
