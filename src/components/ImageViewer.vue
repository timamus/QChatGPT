<template>
  <div class="q-pa-md">
    <div
      class="fixed-full image-viewer__blinder"
      :class="indexZoomed !== void 0 ? 'image-viewer__blinder--active' : void 0"
      @click="zoomImage()"
    />

    <div class="image-container">
      <q-img
        :key="imageId"
        :ref="
          (el) => {
            thumbRef[imageId] = el;
          }
        "
        loading="lazy"
        class="image-viewer__image"
        :style="imageId === indexZoomed ? 'opacity: 0.3' : void 0"
        :src="image"
        @click="zoomImage(imageId)"
      />
      <q-btn
        class="download-btn"
        icon="download"
        @click="downloadImage"
        dense
        text-color="black"
      />
    </div>

    <q-img
      ref="fullRef"
      class="image-viewer__image image-viewer__image-full fixed-center"
      :class="
        indexZoomed !== void 0 ? 'image-viewer__image-full--active' : void 0
      "
      :src="indexZoomed === imageId ? image : null"
      @load="imgLoadedResolve"
      @error="imgLoadedReject"
      @click="zoomImage()"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUpdate } from "vue";
import { morph, exportFile } from "quasar";
import { getImageById } from "../services/chatDBServices.js";

const props = defineProps({
  imageId: {
    type: [String, Number],
    required: true,
  },
});

const image = ref("");

const thumbRef = ref([]);
const fullRef = ref(null);

const indexZoomed = ref(void 0);

function imgLoadedResolve() {
  imgLoaded.resolve();
}

function imgLoadedReject() {
  imgLoaded.reject();
}

function zoomImage(index) {
  const indexZoomedState = indexZoomed.value;
  let cancel = void 0;

  imgLoaded.reject();

  const zoom = () => {
    if (index !== void 0 && index !== indexZoomedState) {
      imgLoaded.promise = new Promise((resolve, reject) => {
        imgLoaded.resolve = () => {
          imgLoaded.resolve = () => {};
          imgLoaded.reject = () => {};

          resolve();
        };
        imgLoaded.reject = () => {
          imgLoaded.resolve = () => {};
          imgLoaded.reject = () => {};

          reject();
        };
      });

      cancel = morph({
        from: thumbRef.value[index].$el,
        to: fullRef.value.$el,
        onToggle: () => {
          indexZoomed.value = index;
        },
        waitFor: imgLoaded.promise,
        duration: 400,
        hideFromClone: true,
        onEnd: (end) => {
          if (end === "from" && indexZoomed.value === index) {
            indexZoomed.value = void 0;
          }
        },
      });
    }
  };

  if (
    indexZoomedState !== void 0 &&
    (cancel === void 0 || cancel() === false)
  ) {
    morph({
      from: fullRef.value.$el,
      to: thumbRef.value[indexZoomedState].$el,
      onToggle: () => {
        indexZoomed.value = void 0;
      },
      duration: 200,
      keepToClone: true,
      onEnd: zoom,
    });
  } else {
    zoom();
  }
}

// Make sure to reset the dynamic refs before each update.
onBeforeUpdate(async () => {
  thumbRef.value = [];
});

onMounted(async () => {
  image.value = await getImageContent(props.imageId);
});

// Function to retrieve image content from the database
async function getImageContent(imageId) {
  const imageRecord = await getImageById(imageId);
  return imageRecord ? imageRecord.content : null;
}

const imgLoaded = {
  promise: Promise.resolve(),
  resolve: () => {},
  reject: () => {},
};

function downloadImage() {
  const base64Data = image.value.split(",")[1]; // Remove the data:image/png;base64, prefix
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  const randomName = `image_${Math.random().toString(36).substring(2, 15)}.png`;
  const status = exportFile(randomName, blob, { mimeType: "image/png" });

  if (status !== true) {
    console.error("Image download error: " + status);
  }
}
</script>

<style lang="sass">
.image-viewer
  &__image
    border-radius: 5px
    width: 350px
    max-width: 40vw
    cursor: pointer

    &-full
      width: 800px
      max-width: 70vw
      max-height: 100vh
      z-index: 2002
      pointer-events: none

      &--active
        pointer-events: all
  &__blinder
    opacity: 0
    z-index: 2000
    pointer-events: none
    transition: opacity 0.3s ease-in-out
    background-color: #050a14

    &--active
      opacity: 0.6
      pointer-events: all

      + div > .image-viewer__image
        z-index: 2001

.image-container
  position: relative
  display: inline-block

.download-btn
  position: absolute
  top: 10px
  right: 10px
</style>
