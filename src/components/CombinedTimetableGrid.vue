<template>
  <div class="combined-timetable-grid">
    <div class="combined-timetable-grid__header">
      <div class="combined-timetable-grid__header-top">
        <div class="combined-timetable-grid__weekday">
          {{ weekday.name }}
        </div>
        <div class="combined-timetable-grid__date">
          DATA
        </div>
      </div>
      <div class="combined-timetable-grid__header-bottom">
        <div class="combined-timetable-grid__header-classes">
          <div
            v-for="unit in weekday.units"
            :key="`${unit.unitType},${unit.unitName}`"
            class="combined-timetable-grid__class"
          >
            Class {{ unit.unitName }}
          </div>
        </div>
        <q-separator />
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

export default defineComponent({
  name: 'CombinedTimetableGrid',
  components: { TimetableItem },
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
    const hourPixels = 55;
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
$column-width: 100px;

.combined-timetable-grid {
  .combined-timetable-grid__header {
    position: sticky;
    top: 0;
    width: 100%;
  }

  .combined-timetable-grid__header-top {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    position: relative;
    left: var(--timetable-scroll-left);
    right: 0;
    width: 100%;

    .combined-timetable-grid__weekday {

    }

    .combined-timetable-grid__date {
      text-align: right;
    }
  }

  .combined-timetable-grid__header-bottom {
    width: fit-content;
  }

  .combined-timetable-grid__header-classes {
    display: flex;
    flex-direction: row;

    .combined-timetable-grid__class {
      width: $column-width;
      min-width: $column-width;
      max-width: $column-width;
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
