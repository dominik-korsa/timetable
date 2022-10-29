<template>
  <timetable-layout
    title="Zestawienie"
    :offset="offset"
    :is-loading="isLoading"
    :has-data="weekdays !== null"
    :error-message="errorMessage"
    @retry-load="retryLoad()"
  >
    <template #default>
      <div class="combined-timetable__wrapper overflow-auto">
        <q-scroll-observer
          axis="horizontal"
          @scroll="onScroll"
        />
        <combined-timetable-grid
          v-for="(weekday, i) in weekdays"
          :key="i"
          :weekday="weekday"
          :hours="data.hours"
        />
      </div>
    </template>
  </timetable-layout>
</template>
<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useOffset, weekdayNames } from 'src/shared';
import { onBeforeRouteLeave } from 'vue-router';
import { useClientRef } from 'src/api/client';
import { AllClassesLessons, TableLessonMoment } from 'src/api/common';
import { NotInCacheError } from 'src/api/requests';
import { useQuasar } from 'quasar';
import CombinedTimetableGrid from 'components/CombinedTimetableGrid.vue';
import TimetableLayout from '../layouts/TimetableLayout.vue';

export interface Weekday {
  name: string;
  units: {
    unitType: string;
    unit: string;
    unitName: string;
    moments: TableLessonMoment[];
  }[];
}

export default defineComponent({
  components: { CombinedTimetableGrid, TimetableLayout },
  setup: () => {
    const clientRef = useClientRef();
    const quasar = useQuasar();

    const data = ref<AllClassesLessons | null>(null);
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

    const weekdays = computed<Weekday[] | null>(() => {
      if (data.value === null) return null;
      const { units } = data.value;
      return weekdayNames.map((weekdayName, index) => ({
        name: weekdayName,
        units: units.map(({
          lessons, unit, unitName, unitType,
        }) => ({
          unitType,
          unit,
          unitName,
          moments: lessons[index],
        })),
      }));
    });

    const scrollPosition = ref('0px');

    return {
      offset,
      retryLoad,
      isLoading,
      data,
      errorMessage,
      weekdays,
      onScroll: (event: { position: { top: number; left: number; } }) => {
        scrollPosition.value = `${event.position.left}px`;
      },
      scrollPosition,
    };
  },
});
</script>

<style lang="scss">
.combined-timetable__wrapper {
  height: 100%;
  --timetable-scroll-left: v-bind(scrollPosition);
}
</style>
