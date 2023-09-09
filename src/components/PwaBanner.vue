<template>
  <q-card
    v-if="showPrompt"
    flat
    bordered
  >
    <q-card-section
      class="text-h6"
      role="heading"
    >
      Zainstaluj jako aplikację (PWA)
    </q-card-section>
    <q-card-section class="q-py-none">
      Możesz dodać tą stronę do ekranu głównego,
      aby uzyskać jeszcze szybszy dostęp do swojego planu lekcji!
    </q-card-section>
    <q-card-actions align="center">
      <q-btn
        color="primary"
        outline
        @click="install"
      >
        Zainstaluj
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { installPromptEvent } from 'src/install-prompt';

const showPrompt = computed(() => installPromptEvent.value !== null);

const install = async () => {
  await installPromptEvent.value?.prompt();
};
</script>
