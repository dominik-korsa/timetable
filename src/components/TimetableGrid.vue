<template>
  <div
    class="timetable-grid__wrapper"
    :class="{
      'timetable-grid__wrapper--scroll-snap': config.scrollSnap,
    }"
  >
    <div
      :ref="el => daysEl = el"
      class="timetable-grid__days"
    >
      <div
        v-for="(day, i) in lessonItems"
        :key="i"
        class="timetable-grid__day"
      >
        <timetable-item
          v-for="item in day"
          :key="item.gridRow"
          :style="`grid-row: ${item.gridRow}`"
          :moment="item.moment"
        />
        <div
          v-if="markerPosition !== null && markerPosition.dayIndex === i"
          class="timetable-grid__marker"
          :style="`--offset: ${markerPosition.offset}px`"
        />
      </div>
    </div>

    <div class="timetable-grid__headers">
      <div
        v-for="(header, i) in headers"
        :key="i"
        class="timetable-grid__header row items-center bg-page text-center q-pb-xs"
      >
        <div class="timetable-grid__header-content col-grow">
          <div class="timetable-grid__header-name">
            {{ header.name }}
          </div>
          <div
            v-if="header.date !== null"
            class="timetable-grid__header-date"
          >
            {{ header.date }}
          </div>
        </div>
        <substitutions-button
          v-if="header.substitutions && header.substitutions.length > 0"
          :substitutions="header.substitutions"
        />
      </div>
    </div>

    <div class="timetable-grid__temporal-grid bg-page">
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

    <div class="timetable-grid__corner bg-page" />
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, PropType, ref,
} from 'vue';
import { TableData, TableLessonMoment } from 'src/api/common';
import { adjacentDifference, parseHour, useInterval } from 'src/utils';
import _ from 'lodash';
import TimetableItem from 'components/TimetableItem.vue';
import SubstitutionsButton from 'components/SubstitutionsButton.vue';
import { useConfigStore } from 'stores/config';
import { Temporal } from '@js-temporal/polyfill';

interface TableItem {
  moment: TableLessonMoment;
  gridRow: number;
}

export default defineComponent({
  name: 'TimetableGrid',
  components: { SubstitutionsButton, TimetableItem },
  props: {
    data: {
      type: Object as PropType<TableData>,
      required: true,
    },
    isCurrentWeek: Boolean,
  },
  setup: (props) => {
    const config = useConfigStore();

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
    const now = ref<Temporal.ZonedDateTime>(Temporal.Now.zonedDateTimeISO());
    useInterval(() => {
      now.value = Temporal.Now.zonedDateTimeISO();
    }, 5000, true);

    const hourPixels = 55;

    const dayIndex = computed(() => {
      if (!props.isCurrentWeek) return null;
      if (now.value.dayOfWeek > 5) return null;
      return now.value.dayOfWeek - 1;
    });

    const markerPosition = computed(() => {
      if (dayIndex.value === null) return null;

      const midnight = now.value.round({ smallestUnit: 'day', roundingMode: 'floor' });

      const timePosition = (now.value.epochSeconds - midnight.epochSeconds) / 60;
      if (
        timePosition < timestamps.value[0]
        || timePosition > _.last(timestamps.value)!
      ) return null;
      return {
        dayIndex: dayIndex.value,
        offset: ((timePosition - timestamps.value[0]) * hourPixels) / 60,
      };
    });

    const lessonItems = computed(() => props.data.lessons.map((day) => {
      const items: TableItem[] = [];
      day.forEach((moment, momentIndex) => {
        if (moment.lessons.length === 0) return;
        items.push({
          moment,
          gridRow: momentIndex * 2 + 2,
        });
      });
      return items;
    }));

    const weekdayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];
    const headers = computed(() => {
      const headersValue = props.data.headers;
      if (headersValue === null) return weekdayNames.map((name) => ({ name }));

      return weekdayNames.map((name, index) => {
        const header = headersValue[index];
        return ({
          name,
          date: config.iso8601
            ? header.date.toString()
            : header.date.toLocaleString(),
          substitutions: header.substitutions,
        });
      });
    });

    const daysEl = ref<HTMLDivElement>();

    onMounted(() => {
      if (!daysEl.value || dayIndex.value === null) return;
      const dayItems = daysEl.value.getElementsByClassName('timetable-grid__day');
      if (!dayItems) return;
      const item = dayItems[dayIndex.value];
      item?.scrollIntoView({
        inline: 'start',
      });
    });

    return {
      config: useConfigStore(),
      daysEl,
      rows: computed(
        () => adjacentDifference(timestamps.value)
          .map((v) => `${(v * hourPixels) / 60}px`)
          .join(' '),
      ),
      markerPosition,
      lessonItems,
      headers,
    };
  },
});
</script>

<style lang="scss">
$timetable-gap: 4px;

.timetable-grid__wrapper {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  overflow: auto;

  &.timetable-grid__wrapper--scroll-snap {
    scroll-snap-type: x mandatory;
  }

  --column-count: 5;
  @media (max-width: 840px) { --column-count: 4; }
  @media (max-width: 700px) { --column-count: 3; }
  @media (max-width: 525px) { --column-count: 2; }
  @media (max-width: 350px) { --column-count: 1; }

  $width: calc((100% - #{$timetable-gap}) / var(--column-count));

  .timetable-grid__temporal-wrapper {
    grid-column: 1;
    grid-row: 1/3;
    position: sticky;
    left: 0;
  }

  .timetable-grid__temporal-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: v-bind(rows);
    position: sticky;
    grid-column: 1;
    grid-row: 2;
    left: 0;
    border-right: solid var(--separator-color) 1px;

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
        justify-self: left;
        margin-right: 5px;
        font-size: 1.1rem;
        border: 1px solid var(--separator-color);
        border-radius: $generic-border-radius;
        padding: 0 2px;
        text-align: center;
      }

      .timetable-grid__temporal-start, .timetable-grid__temporal-end {
        font-size: 0.8rem;
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

      @media (max-width: 870px) {
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
          font-size: 0.9rem;
          text-align: center;
          line-height: 0;
          justify-self: center;
        }

        .timetable-grid__temporal-start, .timetable-grid__temporal-end {
          font-size: 0.7em;
          text-align: center;
        }
      }
    }
  }

  .timetable-grid__headers {
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: -1px;
    margin-top: -1px;
    display: grid;
    grid-template-columns: calc(#{$width} + #{$timetable-gap});
    grid-auto-columns: $width;
    min-width: 0;

    .timetable-grid__header {
      grid-row: 1;
      border-bottom: solid var(--separator-color) 1px;
      padding-right: $timetable-gap;
      font-size: 0.85rem;

      .timetable-grid__header-name {
        line-height: 1.4;
      }

      .timetable-grid__header-date {
        font-size: 0.9em;
        line-height: 1;
      }

      .substitutions-button {
        margin-bottom: -4px;
      }

      &:first-of-type {
        padding-left: $timetable-gap;
      }
    }
  }

  .timetable-grid__days {
    grid-column: 2;
    grid-row: 2;
    display: flex;

    .timetable-grid__day {
      width: $width;
      padding-right: $timetable-gap;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: v-bind(rows);
      flex: 0 0 $width;
      scroll-snap-align: end;
      scroll-snap-stop: normal;
      position: relative;

      &:first-of-type {
        margin-left: $timetable-gap;
      }
    }

    .timetable-grid__marker {
      $height: 2px;
      $color: $red-8;
      $triangle-size: 7px;
      height: $height;
      width: calc(100% + #{$timetable-gap});
      box-sizing: content-box;
      background: transparentize($color, 0.65);
      margin-top: - 1px;
      transform: translateY(var(--offset));
      margin-left: -$timetable-gap;
      pointer-events: none;
      position: absolute;
      display: flex;
      justify-content: space-between;

      &:before, &:after {
        display: block;
        content: '';
        border-top: $triangle-size solid transparent;
        border-bottom: $triangle-size solid transparent;

        height: 0;
        width: 0;
        margin-top: -$triangle-size + $height/2;
      }

      &:before {
        border-left: $triangle-size solid $color;
      }

      &:after {
        border-right: $triangle-size solid $color;
      }
    }
  }

  .timetable-grid__corner {
    grid-row: 1;
    grid-column: 1;
    border-bottom: solid var(--separator-color) 1px;
    position: sticky;
    top: -1px;
    margin-top: -1px;
    margin-right: -1px;
    left: 0;
  }
}
</style>
