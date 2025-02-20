<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="q-dialog-plugin acrylic-effect">
      <q-card-section class="row items-center">
        <q-avatar icon="info" color="primary" text-color="white" size="32px" />
        <span class="text-h5 q-ml-sm">About Us</span>
      </q-card-section>

      <q-separator />

      <q-scroll-area
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="q-dialog-scroll-area"
      >
        <q-card-section>
          <div class="text-h6">About QChatGPT</div>
          Welcome to QChatGPT, a cross-platform application built with the
          Quasar Framework. This tool lets you freely explore the OpenAI ChatGPT
          API. Due to the Quasar Framework, QChatGPT supports various platforms
          including web browsers, iOS, Android, and Electron for desktop apps.
          Feel free to visit our GitHub page to view the source code, and
          consider giving us a star if you like our work!
        </q-card-section>

        <q-card-section>
          <q-btn
            flat
            @click="openURL('https://github.com/timamus/QChatGPT')"
            label="Open GitHub page"
            color="primary"
            icon="open_in_new"
            no-caps
          />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Support</div>
          We work hard to keep making our app better by adding new features.
          Your help is important to us. If you like our app, please consider
          supporting us with a donation through Stripe. We appreciate your
          support, as it helps us do our best. Thank you for being part of our
          community.
        </q-card-section>

        <q-card-section>
          <q-btn
            flat
            label="Report a problem"
            color="primary"
            icon="open_in_new"
            @click="openURL('https://github.com/timamus/QChatGPT/issues')"
            class="q-mr-sm"
            no-caps
          />
          <q-btn
            flat
            label="Donate"
            color="primary"
            icon="open_in_new"
            @click="openURL('https://paypal.me/tmusab')"
            no-caps
          />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Privacy Statement</div>
          At QChatGPT, your privacy is our priority. We do not store or share
          any of your interactions with external servers. All data remains on
          your device. Feel free to review our source code on GitHub.
          Additionally, your API key remains on your device and is used
          exclusively for accessing the OpenAI API.
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Author</div>
          Developed by Timur M.
        </q-card-section>
      </q-scroll-area>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Close" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent, openURL } from "quasar";
import { thumbStyle, barStyle } from "src/styles";

const props = defineProps({
  // ...your custom props
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>

<style scoped>
.q-dialog-plugin {
  width: 480px;
  max-width: 80vw;
  height: 90vh;
  max-height: 90vh;
  font-size: 1.1em;
}

.q-dialog-scroll-area {
  height: calc(100% - 117px);
  padding-right: 5px;
}
</style>
