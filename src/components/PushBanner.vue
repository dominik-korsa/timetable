<template>
  <q-card
    class="row items-center q-pa-sm no-wrap"
    bordered
    flat
  >
    <div class="col-fill q-ml-sm q-mr-md">
      Powiadamiaj o nowych zastępstwach
    </div>
    <q-btn
      outline
      no-caps
      :color="state === 'prompt' ? 'primary' : 'grey'"
      :disable="state !== 'prompt'"
      @click="subscribe()"
    >
      {{ message }}
    </q-btn>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { enableNotifications, getRegistrationStatus, subscribePush } from 'src/push/push-manager';
import { useQuasar } from 'quasar';

const quasar = useQuasar();

const state = ref<PermissionState>('denied');
getRegistrationStatus()
  .then((v) => { state.value = v; })
  .catch(console.error);

const message = computed(() => ({
  denied: 'Zablokowane',
  granted: 'Włączone',
  prompt: 'Włącz',
}[state.value]));

const subscribe = async () => {
  try {
    const result = await enableNotifications();
    if (result === 'denied') state.value = 'denied';
    if (result !== 'granted') return;
    await subscribePush();
    state.value = 'granted';
  } catch (error) {
    console.error(error);
    quasar.notify({
      type: 'negative',
      message: 'Nie udało się włączyć powiadomień',
    });
  }
};
</script>
