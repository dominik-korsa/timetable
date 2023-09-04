<template>
  <old-domain-layout v-if="isOldDomian" />
  <router-view v-else />
</template>

<script lang="ts">
// global: url, tri

import {
  computed, defineComponent, provide, ref, watch,
} from 'vue';
import { useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';
import OldDomainLayout from 'layouts/OldDomainLayout.vue';
import { useRoute, useRouter } from 'vue-router';
import { Client, clientSymbol, getClient } from 'src/api/client';
import { paramNames } from 'src/router/route-constants';

export default defineComponent({
  name: 'App',
  components: { OldDomainLayout },
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();

    const router = useRouter();
    const route = useRoute();
    const client = ref<Client|undefined>();

    // TODO: Remove
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.url = (url: string) => {
      const encoded = encodeURI(url)
        .replaceAll(
          /['?#]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
        );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      global.tri(`'${encoded}'`);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.tri = (tri: string) => {
      const path = `/${tri}/`;
      if (path === route.path) return;
      router.push({
        path,
      });
    };

    provide(clientSymbol, client);
    watch(() => route.params[paramNames.tri], (tri: string | string[] | undefined, oldTri) => {
      if (tri === oldTri || tri === undefined) return;
      if (typeof tri === 'object') [tri] = tri;
      try {
        client.value = getClient(tri);
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: 'Niepoprawny identyfikator planu lekcji',
        });
        // TODO: Restore
        // router.push({ name: routeNames.home });
        client.value = undefined;
      }
    }, { immediate: true });

    if (window.sessionStorage.getItem('just-updated') !== null) {
      window.sessionStorage.removeItem('just-updated');
      quasar.notify({
        icon: 'arrow_circle_up',
        message: 'Zaktualizowano aplikację!',
        caption: 'Korzystasz teraz z najnowszej wersji',
        timeout: 6000,
      });
    }

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
