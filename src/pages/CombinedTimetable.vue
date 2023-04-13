<template>
  <timetable-layout
    title=""
    :offset="offset"
    :is-loading="isLoading"
    :has-data="weekdays !== null"
    :error-message="errorMessage"
    :is-startup="isStartup"
    @retry-load="retryLoad"
    @startup-toggle="onStartupToggle"
  >
    <template #default>
      <div class="combined-timetable__wrapper">
        <combined-timetable-grid
          :weekday="weekdays[dayIndex]"
          :hours="data.hours"
          :is-current-week="offset?.isCurrentWeek ?? true"
          unit-type="class"
        />
      </div>
    </template>
    <template #tabs>
      <q-tab-panels
        :model-value="offset?.current ?? 0"
        animated
        :swipeable="false"
        class="bg-transparent"
      >
        <q-tab-panel
          v-for="{weekOffset, tabs} in tabPanels"
          :key="weekOffset"
          :name="weekOffset"
          class="q-pa-none"
        >
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
              :aria-label="tab.label"
            >
              <div
                class="text-weight-medium"
                aria-hidden="true"
              >
                {{ tab.name }}
              </div>
              <div
                v-if="tab.date !== null"
                aria-hidden="true"
                class="text-caption combined-timetable__tab-date"
              >
                {{ tab.date }}
              </div>
            </q-tab>
          </q-tabs>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </timetable-layout>
</template>
<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import {
  useIsFavourite, useOffset, weekdayNames, weekdayNamesShort,
} from 'src/shared';
import { onBeforeRouteLeave } from 'vue-router';
import { useClientRef } from 'src/api/client';
import {
  AllClassesLessons, Substitution, TableLessonMoment, UnitType,
} from 'src/api/common';
import { NotInCacheError } from 'src/api/requests';
import { useQuasar } from 'quasar';
import CombinedTimetableGrid from 'components/CombinedTimetableGrid.vue';
import { Temporal } from '@js-temporal/polyfill';
import { mondayOf } from 'src/date-utils';
import { useConfigStore } from 'stores/config';
import TimetableLayout from '../layouts/TimetableLayout.vue';

export interface Weekday {
  name: string;
  index: number;
  units: {
    unitType: UnitType;
    unit: string;
    unitName: string;
    moments: TableLessonMoment[];
    substitutions: Substitution[];
    isFavourite: boolean;
  }[];
}

export default defineComponent({
  components: { CombinedTimetableGrid, TimetableLayout },
  setup: () => {
    const clientRef = useClientRef();
    const quasar = useQuasar();
    const config = useConfigStore();
    const isFavourite = useIsFavourite();

    const data = ref<AllClassesLessons | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);
    const { dayOfWeek } = Temporal.Now.plainDateISO();
    const dayIndex = ref([6, 7].includes(dayOfWeek) ? 0 : (dayOfWeek - 1));

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
        index,
        units: units.map(({
          lessons, unit, unitName, unitType, headers,
        }) => ({
          unitType,
          unit,
          unitName,
          moments: lessons[index],
          substitutions: headers?.[index]?.substitutions ?? [],
          isFavourite: isFavourite.value(unitType, unit),
        })),
      }));
    });

    const isStartup = computed(
      () => config.startupUnit !== null
        && dataRef.value !== null
        && config.startupUnit.tri === dataRef.value.client.tri
        && config.startupUnit.unitType === 'combined',
    );

    return {
      offset,
      retryLoad,
      isStartup,
      onStartupToggle: () => {
        if (!dataRef.value) return;
        config.setStartupTable(isStartup.value ? null : {
          tri: dataRef.value.client.tri,
          unitType: 'combined',
        });
      },
      isLoading,
      data,
      errorMessage,
      weekdays,
      dayIndex,
      tabPanels: computed(() => {
        const monday = offset.value === null
          ? null
          : mondayOf(Temporal.Now.plainDateISO());
        const offsets = offset.value === null ? [0] : [
          offset.value.current - 1,
          offset.value.current,
          offset.value.current + 1,
        ];
        return offsets.map((weekOffset) => ({
          weekOffset,
          tabs: (quasar.screen.lt.sm ? weekdayNamesShort : weekdayNames).map((name, weekdayIndex) => {
            const date = monday?.add({ weeks: weekOffset }).add({ days: weekdayIndex }) ?? null;
            const fullWeekdayName = weekdayNames[weekdayIndex];
            return ({
              name,
              label: date === null ? fullWeekdayName : `${fullWeekdayName} ${date.toLocaleString()}`,
              date: date === null ? null : (config.iso8601 ? date.toString() : date.toLocaleString()),
            });
          }),
        }));
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
