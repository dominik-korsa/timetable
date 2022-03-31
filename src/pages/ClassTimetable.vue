<template>
  <q-page
    v-if="data === null"
    padding
    class="column content-center justify-center"
  >
    <template v-if="errorMessage !== null">
      <div class="text-center">
        {{ errorMessage }}
      </div>
      <q-btn
        color="primary"
        class="q-mt-md"
        @click="retryLoad"
      >
        Spróbuj ponownie
      </q-btn>
    </template>
    <q-spinner
      v-else
      color="primary"
      size="64px"
    />
  </q-page>
  <q-page
    v-else
    class="class-timetable"
  >
    <timetable-grid
      v-if="data !== null"
      :data="data"
    />
  </q-page>
</template>

<script lang="ts">
import { TableData } from 'src/api/common';
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { loadVLoHours } from 'src/api/v-lo';
import { CacheMode, NotInCacheError } from 'src/api/requests';
import TimetableGrid from 'components/TimetableGrid.vue';
import { loadOptivumTable } from 'src/api/optivum';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ClassTimetable',
  components: { TimetableGrid },
  setup: () => {
    const route = useRoute();
    const quasar = useQuasar();

    const data = ref<TableData | null>(null);
    const errorMessage = ref<string | null>(null);

    let refreshId = 0;

    const attemptLoad = async (
      url: string | undefined,
      classValue: string,
      cacheMode: CacheMode,
    ): Promise<TableData> => {
      if (url === undefined) {
        const [hours] = await Promise.all([loadVLoHours(cacheMode)]);
        return {
          hours,
        };
      }
      return loadOptivumTable(url, classValue, cacheMode);
    };

    watch(
      [() => route.params.url as string | undefined, () => route.params.class as string],
      async ([url, classValue]) => {
        refreshId += 1;
        const currId = refreshId;
        data.value = null;
        errorMessage.value = null;

        let cacheFailed = false;
        try {
          const cachedData = await attemptLoad(url, classValue, CacheMode.CacheOnly);
          if (currId !== refreshId) return;
          data.value = cachedData;
        } catch (error) {
          cacheFailed = true;
          if (!(error instanceof NotInCacheError)) console.warn(error);
        }

        try {
          const networkData = await attemptLoad(url, classValue, CacheMode.NetworkOnly);
          if (currId !== refreshId) return;
          data.value = networkData;
        } catch (error) {
          console.error(error);
          if (cacheFailed) errorMessage.value = 'Nie udało się wczytać planu lekcji';
          else {
            quasar.notify({
              type: 'negative',
              message: 'Nie udało się wczytać planu lekcji, wyświetlanie zapisanej wersji',
            });
          }
        }
      },
      { immediate: true },
    );

    const retryLoad = async () => {
      data.value = null;
      errorMessage.value = null;
      const url = route.params.url as string | undefined;
      const classValue = route.params.class as string;
      try {
        data.value = await attemptLoad(url, classValue, CacheMode.NetworkOnly);
      } catch (error) {
        console.error(error);
        errorMessage.value = 'Nie udało się wczytać planu lekcji';
      }
    };

    return ({
      data,
      errorMessage,
      retryLoad,
    });
  },
});
</script>

<style lang="scss">
.class-timetable {
  display: flex;
  flex-direction: row;
}
</style>
