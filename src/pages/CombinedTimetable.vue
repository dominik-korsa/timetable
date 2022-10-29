<template>
  <timetable-layout
    title=""
    :offset="offset"
    :is-loading="isLoading"
    :has-data="weekdays !== null"
    :error-message="errorMessage"
    @retry-load="retryLoad()"
  >
    <template #default>
      <div class="combined-timetable__wrapper">
        <combined-timetable-grid
          :weekday="weekdays[dayIndex]"
          :hours="data.hours"
        />
      </div>
    </template>
    <template #tabs>
      <q-tabs
        v-model="dayIndex"
        align="justify"
        class="text-grey combined-timetable__tabs"
        active-color="primary"
        indicator-color="primary"
        dense
        narrow-indicator
        no-caps
      >
        <q-tab
          v-for="(tab, i) in tabs"
          :key="i"
          :name="i"
        >
          <div class="text-weight-medium">
            {{ tab.name }}
          </div>
          <div
            v-if="tab.date !== null"
            class="text-caption combined-timetable__tab-date"
          >
            {{ tab.date }}
          </div>
        </q-tab>
      </q-tabs>
    </template>
  </timetable-layout>
</template>
<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useOffset, weekdayNames, weekdayNamesShort } from 'src/shared';
import { onBeforeRouteLeave } from 'vue-router';
import { useClientRef } from 'src/api/client';
import { AllClassesLessons, TableLessonMoment } from 'src/api/common';
import { NotInCacheError } from 'src/api/requests';
import { useQuasar } from 'quasar';
import CombinedTimetableGrid from 'components/CombinedTimetableGrid.vue';
import { Substitution } from '@wulkanowy/asc-timetable-parser';
import { Temporal } from '@js-temporal/polyfill';
import { mondayOf } from 'src/date-utils';
import { useConfigStore } from 'stores/config';
import TimetableLayout from '../layouts/TimetableLayout.vue';

export interface Weekday {
  name: string;
  units: {
    unitType: string;
    unit: string;
    unitName: string;
    moments: TableLessonMoment[];
    substitutions: Substitution[];
  }[];
}

export default defineComponent({
  components: { CombinedTimetableGrid, TimetableLayout },
  setup: () => {
    const clientRef = useClientRef();
    const quasar = useQuasar();
    const config = useConfigStore();

    const data = ref<AllClassesLessons | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);
    const { dayOfWeek } = Temporal.Now.plainDateISO();
    const dayIndex = ref([0, 6].includes(dayOfWeek) ? 0 : dayOfWeek - 1);

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
          lessons, unit, unitName, unitType, headers,
        }) => ({
          unitType,
          unit,
          unitName,
          moments: lessons[index],
          substitutions: headers?.[index]?.substitutions ?? [],
        })),
      }));
    });

    return {
      offset,
      retryLoad,
      isLoading,
      data,
      errorMessage,
      weekdays,
      dayIndex,
      tabs: computed(() => {
        const monday = offset.value === null
          ? null
          : mondayOf(Temporal.Now.plainDateISO()).add({ weeks: offset.value.current });
        return (quasar.screen.lt.sm ? weekdayNamesShort : weekdayNames).map((name, weekdayIndex) => {
          const date = monday?.add({ days: weekdayIndex }) ?? null;
          return ({
            name,
            date: date === null ? null : (config.iso8601 ? date.toString() : date.toLocaleString()),
          });
        });
      }),
    };
  },
});
</script>

<style lang="scss">
.combined-timetable__wrapper {
  height: 100%;
}

.combined-timetable__tabs {
  .q-tab {
    padding: 0;
  }

  .q-tab__content {
    min-width: 20px;
  }

  .combined-timetable__tab-date {
    font-size: min(0.7rem, 2.7vw);
    line-height: 1.2;
    padding-bottom: 2px;
  }
}
</style>
