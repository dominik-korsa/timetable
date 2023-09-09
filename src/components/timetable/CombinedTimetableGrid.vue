<template>
  <div
    ref="grid"
    class="combined-timetable-grid"
  >
    <q-scroll-observer
      axis="horizontal"
      :scroll-target="grid"
      :debounce="500"
      @scroll="onScroll"
    />
    <div class="combined-timetable-grid__header bg-page border-b">
      <div class="combined-timetable-grid__header-classes">
        <div
          v-for="unit in weekday.units"
          :key="`${unit.unitType},${unit.unitName}`"
          class="combined-timetable-grid__unit"
        >
          <div
            class="combined-timetable-grid__unit-name rounded-borders"
            :class="{
              'combined-timetable-grid__unit-name--favourite': unit.isFavourite,
            }"
            :aria-label="`Klasa ${unit.unitName}`"
          >
            {{ unit.unitName }}
          </div>
          <div
            v-if="unit.substitutions.length > 0"
            class="q-mr-xs"
          >
            <substitutions-button
              :substitutions="unit.substitutions"
              small
              :unit-type="unit.unitType"
              :unit-name="unit.unitName"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="markerPositionPx !== null"
      class="time-marker combined-timetable-grid__marker"
    />
    <div class="combined-timetable-grid__time-slots">
      <time-slot-markers
        :time-slots="timeSlots"
        :rows="rows"
      />
      <div
        v-if="markerPositionPx !== null"
        class="time-marker-triangle time-marker-triangle--left combined-timetable-grid__time-marker-triangle"
      />
    </div>
    <div
      class="combined-timetable-grid__days"
      aria-label="Siatka planu lekcji"
    >
      <div
        v-for="(day, i) in items"
        :key="i"
        class="combined-timetable-grid__day"
      >
        <timetable-item
          v-for="item in day"
          :key="item.gridRow"
          :moment="item.moment"
          :time-slot="item.timeSlot"
          :style="`grid-row: ${item.gridRow}`"
          :unit-type="unitType"
          small
        />
      </div>
    </div>
    <div class="combined-timetable-grid__corner bg-page border-b" />
  </div>
</template>

<script lang="ts" setup>
import {
  computed, onMounted, PropType, ref,
} from 'vue';
import {
  calculateRows, calculateTimestamps, TableLessonMoment, TableTimeSlot, UnitType,
} from 'src/api/common';
import TimetableItem from 'components/timetable/TimetableItem.vue';
import SubstitutionsButton from 'components/timetable/SubstitutionsButton.vue';
import { useConfigStore } from 'stores/config';
import { useClientRef } from 'src/api/client';
import { useNow } from 'src/utils';
import _ from 'lodash';
import TimeSlotMarkers from 'components/timetable/TimeSlotMarkers.vue';
import { Weekday } from 'src/pages/CombinedTimetable.vue';

interface TableItem {
  moment: TableLessonMoment;
  timeSlot: TableTimeSlot;
  gridRow: number;
}

const props = defineProps({
  weekday: {
    type: Object as PropType<Weekday>,
    required: true,
  },
  timeSlots: {
    type: Array as PropType<TableTimeSlot[]>,
    required: true,
  },
  isCurrentWeek: Boolean,
  unitType: {
    type: String as PropType<UnitType>,
    required: true,
  },
});

const config = useConfigStore();
const clientRef = useClientRef();

const timestamps = computed(() => calculateTimestamps(props.timeSlots, 10));
const now = useNow(5000);

const hourPixels = 50;

const grid = ref<HTMLDivElement>();
onMounted(() => {
  if (!clientRef.value) return;
  grid.value?.scrollTo({ left: config.getCombinedTimetableScroll(clientRef.value.key) });
});

const rows = computed(() => calculateRows(timestamps.value, hourPixels));
const items = computed(() => props.weekday.units.map(({ moments }) => {
  const result: TableItem[] = [];
  moments.forEach((moment, momentIndex) => {
    if (moment.lessons.length === 0) return;
    result.push(({
      gridRow: momentIndex * 2 + 2,
      moment,
      timeSlot: props.timeSlots[momentIndex],
    }));
  });
  return result;
}));

const markerPositionPx = computed(() => {
  if (!props.isCurrentWeek || props.weekday.index !== now.value.dayOfWeek - 1) return null;

  const midnight = now.value.round({ smallestUnit: 'day', roundingMode: 'floor' });
  const timePosition = (now.value.epochSeconds - midnight.epochSeconds) / 60;
  if (
    timePosition < timestamps.value[0]
      || timePosition > _.last(timestamps.value)!
  ) return null;
  return `${((timePosition - timestamps.value[0]) * hourPixels) / 60}px`;
});

const onScroll = (event: { position: { top: number, left: number } }) => {
  if (!clientRef.value) return;
  config.setCombinedTimetableScroll(clientRef.value.key, event.position.left);
};
</script>

<style lang="scss">
$column-width: 75px;
$column-gap: 4px;

.combined-timetable-grid {
  overflow: auto;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;

  .combined-timetable-grid__time-slots {
    grid-row: 2;
    grid-column: 1;
    position: sticky;
    left: 0;
    display: flex;
    z-index: 1;

    .combined-timetable-grid__time-marker-triangle {
      transform: translateY(v-bind(markerPositionPx)) translateY(-1px);
    }
  }

  .combined-timetable-grid__header {
    position: sticky;
    top: 0;
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    z-index: 2;
    grid-row: 1;
    grid-column: 3;

    .combined-timetable-grid__date {
      text-align: right;
    }
  }

  .combined-timetable-grid__header-classes {
    display: flex;
    flex-direction: row;
    padding: 0 $column-gap/2;

    .combined-timetable-grid__unit {
      width: $column-width;
      min-width: $column-width;
      max-width: $column-width;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      min-height: 32px;

      .combined-timetable-grid__unit-name {
        font-size: 1rem;
        text-align: center;
        margin-left: auto;
        margin-right: auto;
        border: 1px solid transparent;
        padding: 2px;
        line-height: 1;

        &.combined-timetable-grid__unit-name--favourite {
          border-color: $amber;
          background: rgba($amber, 0.15);
        }
      }
    }
  }

  .combined-timetable-grid__days {
    grid-row: 2;
    grid-column: 3;
    display: flex;
    min-width: 0;
    padding: 0 $column-gap/2;
  }

  .combined-timetable-grid__day {
    width: $column-width;
    box-sizing: border-box;
    padding: 0 $column-gap/2;
    display: grid;
    grid-template-rows: v-bind(rows);
  }

  .combined-timetable-grid__marker {
    grid-row: 2;
    grid-column: 3;
    transform: translateY(v-bind(markerPositionPx));
    z-index: 1;

    &::before {
      content: none;
    }

    &::after {
      position: sticky;
      right: 0;
      margin-left: auto;
    }
  }

  .combined-timetable-grid__corner {
    grid-row: 1;
    grid-column: 1;
    position: sticky;
    top: -1px;
    margin-top: -1px;
    margin-right: -1px;
    left: 0;
    z-index: 3;
  }
}
</style>
