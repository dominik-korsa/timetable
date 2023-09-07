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
          :weekday="weekdays[offset.dayIndex]"
          :time-slots="data.timeSlots"
          :is-current-week="offset.isCurrentWeek ?? true"
          unit-type="class"
        />
      </div>
    </template>
    <template #tabs>
      <q-tab-panels
        :model-value="offsetId"
        animated
        :swipeable="false"
        class="bg-transparent"
      >
        <q-tab-panel
          v-for="{id, tabs} in tabPanels"
          :key="id"
          :name="id"
          class="q-pa-none"
        >
          <q-tabs
            v-model="offset.dayIndex"
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
  useIsFavourite, weekdayNames, weekdayNamesShort, useSyncedOffset,
} from 'src/shared';
import { useClientRef } from 'src/api/client';
import {
  AllClassesLessons, Substitution, TableLessonMoment, UnitType,
} from 'src/api/common';
import { NotInCacheError } from 'src/api/requests';
import { useQuasar } from 'quasar';
import CombinedTimetableGrid from 'components/timetable/CombinedTimetableGrid.vue';
import { Temporal } from '@js-temporal/polyfill';
import { useConfigStore } from 'stores/config';
import { onBeforeRouteLeave } from 'vue-router';
import { useFormatter } from 'src/composables/formatter';
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
    const formatter = useFormatter();
    const isFavourite = useIsFavourite();

    const data = ref<AllClassesLessons | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);

    let refreshId = 0;

    const { offset, disposeOffset, offsetDisposed } = useSyncedOffset(
      () => clientRef.value === undefined || !clientRef.value.supportsOffsets,
    );
    onBeforeRouteLeave(() => {
      disposeOffset();
    });

    const dataRef = computed(() => {
      if (clientRef.value === undefined) return null;
      if (offsetDisposed.value) return null;
      return ({
        client: clientRef.value,
        monday: offset.value.monday,
      });
    });

    watch(
      dataRef,
      async (value, prevValue) => {
        if (value === null) return;
        if (prevValue && value.client === prevValue.client && value.monday.equals(prevValue.monday)) return;

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
          const cachedData = await value.client.getLessonsOfAllClasses(true, value.monday);
          if (currId !== refreshId) return;
          data.value = cachedData;
          clearTimeout(clearTimeoutId);
        } catch (error) {
          cacheFailed = true;
          if (!(error instanceof NotInCacheError)) console.warn(error);
        }

        try {
          const networkData = await value.client.getLessonsOfAllClasses(false, value.monday);
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
        data.value = await dataRef.value.client.getLessonsOfAllClasses(false, dataRef.value.monday);
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
      offsetId: computed({
        set: (value: string) => {
          offset.value.monday = Temporal.PlainDate.from(value);
        },
        get: () => offset.value.monday.toString(),
      }),
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
      tabPanels: computed(() => {
        const names = quasar.screen.lt.sm ? weekdayNamesShort : weekdayNames;
        if (offset.value.const) {
          return [{
            id: offset.value.monday.toString(),
            tabs: names.map((name, weekdayIndex) => ({
              name,
              label: weekdayNames[weekdayIndex],
              date: null,
            })),
          }];
        }
        return [
          offset.value.monday.subtract({ weeks: 1 }),
          offset.value.monday,
          offset.value.monday.add({ weeks: 1 }),
        ].map((monday) => ({
          id: monday.toString(),
          tabs: names.map((name, weekdayIndex) => {
            const date = monday.add({ days: weekdayIndex });
            return ({
              name,
              date: formatter.formatDisplay(date),
              label: `${weekdayNames[weekdayIndex]}, ${formatter.formatLabel(date)}`,
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
