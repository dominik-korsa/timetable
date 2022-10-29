<template>
  <timetable-layout
    title="Zestawienie"
    :offset="offset"
    :is-loading="isLoading"
    :has-data="data !== null"
    :error-message="errorMessage"
    @retry-load="retryLoad()"
  />
</template>
<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useOffset } from 'src/shared';
import { onBeforeRouteLeave } from 'vue-router';
import { useClientRef } from 'src/api/client';
import { TableData } from 'src/api/common';
import { NotInCacheError } from 'src/api/requests';
import { useQuasar } from 'quasar';
import TimetableLayout from '../layouts/TimetableLayout.vue';

export default defineComponent({
  components: { TimetableLayout },
  setup: () => {
    const clientRef = useClientRef();
    const quasar = useQuasar();

    const data = ref<TableData[] | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);

    let refreshId = 0;

    const offset = computed(() => {
      if (clientRef.value !== undefined && clientRef.value.supportsOffsets) return useOffset();
      return null;
    });
    onBeforeRouteLeave(() => { offset.value?.reset(); });

    const dataRef = computed(() => {
      if (clientRef.value === undefined) return null;
      return ({
        client: clientRef.value,
        offset: offset.value?.current ?? 0,
      });
    });

    watch(
      dataRef,
      async (value) => {
        if (value === null) return;

        isLoading.value = true;
        refreshId += 1;
        const currId = refreshId;
        const clearTimeoutId = setTimeout(() => {
          if (currId !== refreshId) return;
          data.value = null;
        }, 750);
        errorMessage.value = null;

        let cacheFailed = false;
        try {
          const cachedData = await value.client.getLessonsOfAllClasses(true, value.offset);
          if (currId !== refreshId) return;
          data.value = cachedData;
          clearTimeout(clearTimeoutId);
        } catch (error) {
          cacheFailed = true;
          if (!(error instanceof NotInCacheError)) console.warn(error);
        }

        try {
          const networkData = await value.client.getLessonsOfAllClasses(false, value.offset);
          if (currId !== refreshId) return;
          clearTimeout(clearTimeoutId);
          data.value = networkData;
        } catch (error) {
          console.error(error);
          clearTimeout(clearTimeoutId);
          if (currId !== refreshId) return;
          if (cacheFailed) errorMessage.value = 'Nie udało się wczytać planu lekcji';
          else {
            quasar.notify({
              type: 'negative',
              message: 'Nie udało się wczytać aktualnego planu lekcji, wyświetlanie zapisanej wersji',
            });
          }
        }
        isLoading.value = false;
      },
      { immediate: true },
    );

    const retryLoad = async () => {
      if (dataRef.value === null) return;
      data.value = null;
      errorMessage.value = null;
      try {
        data.value = await dataRef.value.client.getLessonsOfAllClasses(false, dataRef.value.offset);
      } catch (error) {
        console.error(error);
        errorMessage.value = 'Nie udało się wczytać planu lekcji';
      }
    };

    return {
      offset,
      retryLoad,
      isLoading,
      data,
      errorMessage,
    };
  },
});
</script>
