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
    <div class="combined-timetable-grid__header bg-page">
      <div class="combined-timetable-grid__header-classes">
        <div
          v-for="unit in weekday.units"
          :key="`${unit.unitType},${unit.unitName}`"
          class="combined-timetable-grid__unit"
        >
          <div
            class="combined-timetable-grid__unit-name"
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
    <div class="combined-timetable-grid__hours">
      <hour-markers
        :hours="hours"
        :rows="rows"
      />
      <div
        v-if="markerPositionPx !== null"
        class="time-marker-triangle time-marker-triangle--left combined-timetable-grid__time-marker-triangle"
      />
    </div>
    <div
      class="combined-timetable-grid__grid"
      aria-label="Siatka planu lekcji"
    >
      <timetable-item
        v-for="item in items"
        :key="item.key"
        class="combined-timetable-grid__grid-item"
        :moment="item.moment"
        :hour="item.hour"
        :style="item.style"
        :unit-type="unitType"
        small
      />
    </div>
    <div class="combined-timetable-grid__corner bg-page" />
  </div>
</template>

<script lang="ts">
import { Weekday } from 'src/pages/CombinedTimetable.vue';
import {
  computed, defineComponent, onMounted, PropType, ref,
} from 'vue';
import {
  calculateRows, calculateTimestamps, TableHour, TableLessonMoment, UnitType,
} from 'src/api/common';
import TimetableItem from 'components/TimetableItem.vue';
import SubstitutionsButton from 'components/SubstitutionsButton.vue';
import { useConfigStore } from 'stores/config';
import { useClientRef } from 'src/api/client';
import { useNow } from 'src/utils';
import _ from 'lodash';
import HourMarkers from 'components/HourMarkers.vue';

export default defineComponent({
  name: 'CombinedTimetableGrid',
  components: { HourMarkers, SubstitutionsButton, TimetableItem },
  props: {
    weekday: {
      type: Object as PropType<Weekday>,
      required: true,
    },
    hours: {
      type: Array as PropType<TableHour[]>,
      required: true,
    },
    isCurrentWeek: Boolean,
    unitType: {
      type: String as PropType<UnitType>,
      required: true,
    },
  },
  setup: (props) => {
    const config = useConfigStore();
    const clientRef = useClientRef();

    const timestamps = computed(() => calculateTimestamps(props.hours, 10));
    const now = useNow(5000);

    const hourPixels = 50;

    const grid = ref<HTMLDivElement>();
    onMounted(() => {
      if (!clientRef.value) return;
      grid.value?.scrollTo({ left: config.getCombinedTimetableScroll(clientRef.value.key) });
    });

    return {
      grid,
      rows: computed(() => calculateRows(timestamps.value, hourPixels)),
      items: computed(() => props.weekday.units.flatMap(({ moments }, unitIndex) => {
        const items: {
          key: string;
          style: string;
          moment: TableLessonMoment;
          hour: TableHour;
        }[] = [];
        moments.forEach((moment, momentIndex) => {
          if (moment.lessons.length === 0) return;
          const gridColumn = unitIndex + 1;
          const gridRow = momentIndex * 2 + 2;
          items.push(({
            style: `grid-column: ${gridColumn}; grid-row: ${gridRow}`,
            key: `${gridColumn}/${gridRow}`,
            moment,
            hour: props.hours[momentIndex],
          }));
        });
        return items;
      })),
      markerPositionPx: computed(() => {
        if (!props.isCurrentWeek || props.weekday.index !== now.value.dayOfWeek - 1) return null;

        const midnight = now.value.round({ smallestUnit: 'day', roundingMode: 'floor' });
        const timePosition = (now.value.epochSeconds - midnight.epochSeconds) / 60;
        if (
          timePosition < timestamps.value[0]
          || timePosition > _.last(timestamps.value)!
        ) return null;
        return `${((timePosition - timestamps.value[0]) * hourPixels) / 60}px`;
      }),
      columnCount: computed(() => props.weekday.units.length),
      onScroll: (event: { position: { top: number, left: number } }) => {
        if (!clientRef.value) return;
        config.setCombinedTimetableScroll(clientRef.value.key, event.position.left);
      },
    };
  },
});
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

  .combined-timetable-grid__hours {
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
    border-bottom: 1px solid var(--separator-color);
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
        border-radius: $generic-border-radius;
        padding: 2px;
        line-height: 1;

        &.combined-timetable-grid__unit-name--favourite {
          border-color: $amber;
          background: rgba($amber, 0.15);
        }
      }
    }
  }

  .combined-timetable-grid__grid {
    grid-row: 2;
    grid-column: 3;
    display: grid;
    grid-template-rows: v-bind(rows);
    grid-auto-columns: $column-width;
    padding: 0 $column-gap/2;
  }

  .combined-timetable-grid__grid-item {
    margin: 0 $column-gap/2;
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
    border-bottom: solid var(--separator-color) 1px;
    position: sticky;
    top: -1px;
    margin-top: -1px;
    margin-right: -1px;
    left: 0;
    z-index: 3;
  }
}
</style>
