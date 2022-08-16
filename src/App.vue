<template>
  <old-domain-layout v-if="isOldDomian" />
  <router-view v-else />
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';
import OldDomainLayout from 'layouts/OldDomainLayout.vue';

export default defineComponent({
  name: 'App',
  components: { OldDomainLayout },
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();
    watch(
      () => config.dark,
      (value) => quasar.dark.set(value),
      { immediate: true },
    );
    return {
      isOldDomian: computed(() => window.location.host === process.env.OLD_HOST),
    };
  },
});
</script>
