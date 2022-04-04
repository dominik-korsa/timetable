<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';

export default defineComponent({
  name: 'App',
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();
    watch(
      () => config.dark,
      (value) => quasar.dark.set(value),
      { immediate: true },
    );
  },
});
</script>
