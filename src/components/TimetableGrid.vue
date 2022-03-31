<template>
  <div
    class="timetable-grid__temporal-grid"
  >
    <div
      v-for="(hour, i) in data.hours"
      :key="i"
      class="timetable-grid__temporal"
      :style="`grid-row: ${i*2+2}`"
    >
      <div class="timetable-grid__temporal-number">
        {{ hour.display }}
      </div>
      <div class="timetable-grid__temporal-start">
        {{ hour.begin }}
      </div>
      <div class="timetable-grid__temporal-end">
        {{ hour.end }}
      </div>
    </div>
  </div>
  <q-separator vertical />
  <div class="timetable-grid__grid">
    <div
      v-if="markerPosition !== null"
      class="timetable-grid__marker"
      :style="`grid-column: ${markerPosition.dayIndex + 1}; --offset: ${markerPosition.offset}px`"
    />
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { TableData } from 'src/api/common';
import { adjacentDifference, parseHour, useInterval } from 'src/utils';
import _ from 'lodash';

export default defineComponent({
  name: 'TimetableGrid',
  props: {
    data: {
      type: Object as PropType<TableData>,
      required: true,
    },
  },
  setup: (props) => {
    const timestamps = computed(
      () => {
        const realTimestamps = _.flatMap(
          props.data.hours,
          ({ begin, end }) => [begin, end],
        )
          .map(parseHour);
        return [
          realTimestamps[0] - 30,
          ...realTimestamps,
          _.last(realTimestamps)! + 30,
        ];
      },
    );
    const now = ref<Date>(new Date());
    useInterval(() => {
      now.value = new Date();
    }, 5000, true);

    const hourPixels = 50;

    const markerPosition = computed(() => {
      const dayIndex = now.value.getDay() - 1;
      if (dayIndex < 0 || dayIndex >= 5) return null;

      const midnight = new Date(now.value);
      midnight.setHours(0, 0, 0, 0);

      const timePosition = (now.value.getTime() - midnight.getTime()) / 1000 / 60;
      if (
        timePosition < timestamps.value[0]
        || timePosition > _.last(timestamps.value)!
      ) return null;
      return {
        dayIndex,
        offset: ((timePosition - timestamps.value[0]) * hourPixels) / 60,
      };
    });

    return {
      rows: computed(
        () => adjacentDifference(timestamps.value)
          .map((v) => `${(v * hourPixels) / 60}px`)
          .join(' '),
      ),
      markerPosition,
    };
  },
});
</script>

<style lang="scss">
.timetable-grid__temporal-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: v-bind(rows);

  .timetable-grid__temporal {
    grid-column: 1;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr auto;
    padding: 2px 5px;
    grid-template-areas:
        "number start"
        "number end";

    .timetable-grid__temporal-number {
      grid-area: number;
      align-self: center;
      margin-right: 5px;
      font-size: 1.1em;
      border: 1px solid;
      border-radius: $generic-border-radius;
      padding: 0 2px;
      text-align: center;
    }

    .timetable-grid__temporal-start, .timetable-grid__temporal-end {
      font-size: 0.8em;
      line-height: 1;
      text-align: right;
    }

    .timetable-grid__temporal-start {
      grid-area: start;
      align-self: start;
    }

    .timetable-grid__temporal-end {
      grid-area: end;
      align-self: end;
    }

    @media (max-width: 500px) {
      & {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas:
            "start"
            "number"
            "end";
        padding: 0 3px;
      }

      .timetable-grid__temporal-number {
        margin: 0;
        padding: 0;
        border: none;
        font-size: 0.9em;
        text-align: center;
        line-height: 0;
      }

      .timetable-grid__temporal-start, .timetable-grid__temporal-end {
        font-size: 0.7em;
      }
    }
  }
}

.timetable-grid__grid {
  flex-grow: 1;
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-rows: v-bind(rows);

  .timetable-grid__marker {
    height: 2px;
    background: #C1001555;
    margin-top: calc(var(--offset) - 1px);
    pointer-events: none;
  }
}
</style>
