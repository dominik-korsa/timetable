<template>
  <old-domain-layout v-if="isOldDomian" />
  <router-view v-else />
</template>

<script lang="ts" setup>
import {
  computed, provide, ref, watch,
} from 'vue';
import { useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';
import OldDomainLayout from 'layouts/OldDomainLayout.vue';
import { useRouter } from 'vue-router';
import { Client, clientSymbol, getClient } from 'src/api/client';
import { useNavigation } from 'src/router/navigation';
import { paths } from 'src/router/path-builder';

const quasar = useQuasar();
const config = useConfigStore();
const router = useRouter();
const navigation = useNavigation();

const client = ref<Client | undefined>();
provide(clientSymbol, client);
watch(() => navigation.params.tri, (tri, oldTri) => {
  if (tri === oldTri || tri === null) return;
  try {
    client.value = getClient(tri);
  } catch (error) {
    console.error(error);
    quasar.notify({
      type: 'negative',
      message: 'Niepoprawny identyfikator planu lekcji',
    });
    router.push(paths.home);
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
const isOldDomian = computed(() => window.location.host === process.env.OLD_HOST);
</script>
