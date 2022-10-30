<template>
  <div class="combined-timetable-grid">
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
            />
          </div>
        </div>
      </div>
    </div>
    <div class="combined-timetable-grid__grid">
      <timetable-item
        v-for="item in items"
        :key="item.key"
        class="combined-timetable-grid__grid-item"
        :moment="item.moment"
        :style="item.style"
        small
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Weekday } from 'src/pages/CombinedTimetable.vue';
import { computed, defineComponent, PropType } from 'vue';
import {
  calculateRows, calculateTimestamps, TableHour, TableLessonMoment,
} from 'src/api/common';
import TimetableItem from 'components/TimetableItem.vue';
import SubstitutionsButton from 'components/SubstitutionsButton.vue';

export default defineComponent({
  name: 'CombinedTimetableGrid',
  components: { SubstitutionsButton, TimetableItem },
  props: {
    weekday: {
      type: Object as PropType<Weekday>,
      required: true,
    },
    hours: {
      type: Array as PropType<TableHour[]>,
      required: true,
    },
  },
  setup: (props) => {
    const timestamps = computed(() => calculateTimestamps(props.hours, 10));
    const hourPixels = 50;
    return {
      rows: computed(() => calculateRows(timestamps.value, hourPixels)),
      items: computed(() => props.weekday.units.flatMap(({ moments }, unitIndex) => {
        const items: {
          key: string;
          style: string;
          moment: TableLessonMoment,
        }[] = [];
        moments.forEach((moment, momentIndex) => {
          if (moment.lessons.length === 0) return;
          const gridColumn = unitIndex + 1;
          const gridRow = momentIndex * 2 + 2;
          items.push(({
            style: `grid-column: ${gridColumn}; grid-row: ${gridRow}`,
            key: `${gridColumn}/${gridRow}`,
            moment,
          }));
        });
        return items;
      })),
    };
  },
});
</script>

<style lang="scss">
$column-width: 75px;

.combined-timetable-grid {
  overflow: auto;
  height: 100%;

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

    .combined-timetable-grid__weekday {

    }

    .combined-timetable-grid__date {
      text-align: right;
    }
  }

  .combined-timetable-grid__header-classes {
    display: flex;
    flex-direction: row;

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
    display: grid;
    grid-template-rows: v-bind(rows);
    grid-auto-columns: $column-width;
  }

  .combined-timetable-grid__grid-item {
    margin: 0 2px;
  }
}
</style>
