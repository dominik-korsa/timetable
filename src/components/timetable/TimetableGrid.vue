<template>
  <div
    ref="gridWrapper"
    class="timetable-grid__wrapper"
    :class="{
      'timetable-grid__wrapper--scroll-snap': config.scrollSnap,
      'timetable-grid__wrapper--dense': dense,
    }"
  >
    <ul
      :ref="el => headersEl = el"
      class="timetable-grid__headers"
      aria-label="Dni tygodnia"
    >
      <li
        v-for="(header, i) in headers"
        :key="i"
        class="timetable-grid__header bg-page border-b"
        :class="{
          'timetable-grid__header--dense': gridHeaderDense
        }"
      >
        <div class="timetable-grid__header-inner q-pb-xs">
          <div
            class="timetable-grid__header-content col-grow"
            tabindex="-1"
            :aria-label="header.label"
          >
            <div
              class="timetable-grid__header-name"
              aria-hidden="true"
            >
              {{ header.name }}
            </div>
            <div
              v-if="header.date !== null"
              class="timetable-grid__header-date"
              aria-hidden="true"
            >
              {{ header.date }}
            </div>
          </div>
          <substitutions-button
            v-if="header.substitutions !== null && header.substitutions.length > 0"
            :substitutions="header.substitutions"
            :block="gridHeaderDense"
            :small="gridHeaderDense && $q.screen.lt.sm"
            :unit-type="data.unitType"
            :unit-name="data.unitName"
          />
        </div>
        <div
          class="timetable-grid__header-jump tab-navigation bg-page"
          tabindex="0"
          role="button"
          @click="focusLesson(i)"
          @keyup.space="focusLesson(i)"
          @keyup.enter="focusLesson(i)"
        >
          Skocz do lekcji
        </div>
      </li>
    </ul>

    <time-slot-markers
      class="timetable-grid__time-slots"
      :time-slots="data.timeSlots"
      :rows="rows"
    />

    <div
      :ref="el => daysEl = el"
      class="timetable-grid__days"
      aria-label="Siatka planu lekcji"
      role="region"
    >
      <div
        v-for="(day, i) in lessonItems"
        :key="i"
        class="timetable-grid__day"
      >
        <div
          class="timetable-grid__day-jump tab-navigation"
          tabindex="0"
          role="button"
          @click="focusHeader(i)"
          @keyup.space="focusHeader(i)"
          @keyup.enter="focusHeader(i)"
        >
          Skocz do nagłówka
        </div>
        <timetable-item
          v-for="item in day"
          :key="item.gridRow"
          :style="`grid-row: ${item.gridRow}`"
          :moment="item.moment"
          :time-slot="item.timeSlot"
          :unit-type="data.unitType"
          :small="dense"
        />
        <div
          v-if="markerPosition !== null && markerPosition.dayIndex === i"
          class="time-marker timetable-grid__marker"
        />
      </div>
    </div>

    <div class="timetable-grid__corner bg-page border-b" />
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, PropType, ref,
} from 'vue';
import {
  calculateRows, calculateTimestamps, TableDataWithTimeSlots, TableTimeSlot, TableLessonMoment, Substitution,
} from 'src/api/common';
import { useDocumentListener, useNow } from 'src/utils';
import _ from 'lodash';
import TimetableItem from 'components/timetable/TimetableItem.vue';
import SubstitutionsButton from 'components/timetable/SubstitutionsButton.vue';
import { useConfigStore } from 'stores/config';
import { ChangeOffsetFn } from 'layouts/TimetableLayout.vue';
import { weekdayNames, weekdayNamesShort } from 'src/shared';
import { useQuasar } from 'quasar';
import TimeSlotMarkers from 'components/timetable/TimeSlotMarkers.vue';
import { useFormatter } from 'src/composables/formatter';

interface TableItem {
  moment: TableLessonMoment;
  timeSlot: TableTimeSlot;
  gridRow: number;
}

interface Header {
  name: string;
  date: string | null;
  label: string;
  substitutions: Substitution[] | null;
}

export default defineComponent({
  name: 'TimetableGrid',
  components: {
    TimeSlotMarkers, SubstitutionsButton, TimetableItem,
  },
  props: {
    data: {
      type: Object as PropType<TableDataWithTimeSlots>,
      required: true,
    },
    isCurrentWeek: Boolean,
    changeOffset: {
      type: Function as PropType<ChangeOffsetFn>,
      required: true,
    },
    dense: Boolean,
  },
  setup: (props) => {
    const config = useConfigStore();
    const formatter = useFormatter();
    const quasar = useQuasar();

    const timestamps = computed(() => calculateTimestamps(props.data.timeSlots, 30));
    const now = useNow(5000);

    const hourPixels = computed(() => (props.dense ? 50 : 55));

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
        offset: ((timePosition - timestamps.value[0]) * hourPixels.value) / 60,
      };
    });

    const lessonItems = computed(() => props.data.lessons.map((day) => {
      const items: TableItem[] = [];
      day.forEach((moment, momentIndex) => {
        if (moment.lessons.length === 0) return;
        items.push({
          moment,
          timeSlot: props.data.timeSlots[momentIndex],
          gridRow: momentIndex * 2 + 2,
        });
      });
      return items;
    }));

    const headers = computed<Header[]>(() => {
      const headersValue = props.data.headers;
      const adequateWeekdayNames = (props.dense && quasar.screen.width <= 500) ? weekdayNamesShort : weekdayNames;
      if (headersValue === null) {
        return adequateWeekdayNames.map((name) => ({
          name,
          date: null,
          label: name,
          substitutions: null,
        }));
      }

      return adequateWeekdayNames.map((name, index) => {
        const header = headersValue[index];
        return ({
          name,
          date: formatter.formatDisplay(header.date),
          label: `${name}, ${formatter.formatLabel(header.date)}`,
          substitutions: header.substitutions,
        });
      });
    });

    const daysEl = ref<HTMLDivElement>();
    const headersEl = ref<HTMLDivElement>();

    onMounted(() => {
      if (!daysEl.value || dayIndex.value === null) return;
      const dayItems = daysEl.value.getElementsByClassName('timetable-grid__day');
      if (!dayItems) return;
      const item = dayItems[dayIndex.value];
      item?.scrollIntoView({
        inline: 'start',
      });
    });

    const wrapper = ref<HTMLDivElement>();
    useDocumentListener('keydown', (event) => {
      if (!wrapper.value) return;

      if (event.code === 'Home') {
        event.preventDefault();
        wrapper.value.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (event.code === 'End') {
        event.preventDefault();
        wrapper.value.scrollTo({ left: wrapper.value.scrollWidth, behavior: 'smooth' });
        return;
      }

      const mode: readonly [-1|1, boolean] | undefined = ({
        BracketLeft: [-1, true],
        BracketRight: [1, true],
        PageDown: [-1, true],
        PageUp: [1, true],
        ArrowLeft: [-1, event.ctrlKey],
        ArrowRight: [1, event.ctrlKey],
      } as const)[event.code];

      if (mode === undefined) return;
      event.preventDefault();
      const [direction, skip] = mode;
      const maxScroll = wrapper.value.scrollWidth - wrapper.value.clientWidth;
      if (skip
        || (direction === 1 && wrapper.value.scrollLeft >= maxScroll - 3)
        || (direction === -1 && wrapper.value.scrollLeft <= 3)
      ) {
        if (!props.changeOffset(direction)) return;
        if (!skip && direction === 1) {
          wrapper.value.scrollTo({ left: 0, behavior: 'smooth' });
        }
        if (!skip && direction === -1) {
          wrapper.value.scrollTo({ left: wrapper.value.scrollWidth, behavior: 'smooth' });
        }
        return;
      }

      const gridDays = wrapper.value.querySelector('.timetable-grid__days') as HTMLDivElement;
      const gridDaysBoundingBox = gridDays.getBoundingClientRect();
      const columnCount = parseInt(getComputedStyle(wrapper.value).getPropertyValue('--column-count'), 10);
      const columnWidth = gridDaysBoundingBox.width / columnCount;
      const dayPos = wrapper.value.scrollLeft / columnWidth + direction * 0.05;
      const newDayPos = (direction === -1) ? Math.floor(dayPos) : Math.ceil(dayPos);
      wrapper.value.scrollTo({ left: newDayPos * columnWidth, behavior: 'smooth' });
    });

    const focusLesson = (weekday: number) => {
      const day = daysEl.value?.getElementsByClassName('timetable-grid__day')[weekday];
      if (!day) return;
      ((day.querySelector('.timetable-item') ?? day) as HTMLElement).focus();
    };

    const focusHeader = (weekday: number) => {
      (
        headersEl.value
          ?.querySelectorAll('.timetable-grid__header .timetable-grid__header-content')
          ?.[weekday] as HTMLElement | undefined
      )?.focus();
    };

    return {
      config,
      daysEl,
      headersEl,
      rows: computed(() => calculateRows(timestamps.value, hourPixels.value)),
      markerPosition,
      markerOffsetPx: computed(() => `${markerPosition.value?.offset ?? 0}px`),
      lessonItems,
      headers,
      gridWrapper: wrapper,
      gridHeaderDense: computed(() => props.dense && quasar.screen.width < 650),
      focusLesson,
      focusHeader,
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

  --column-width: calc((100% - #{$timetable-gap}) / var(--column-count));

  .timetable-grid__temporal-wrapper {
    grid-column: 1;
    grid-row: 1/3;
    position: sticky;
    left: 0;
  }

  .timetable-grid__time-slots {
    grid-column: 1;
    grid-row: 2;
    position: sticky;
    left: 0;
    z-index: 1;
  }

  .timetable-grid__headers {
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: -1px;
    padding: 0;
    margin: -1px 0 0;
    display: grid;
    grid-template-columns: calc(var(--column-width) + #{$timetable-gap});
    grid-auto-columns: var(--column-width);
    min-width: 0;
    z-index: 1;
    list-style: none;

    .timetable-grid__header {
      grid-row: 1;
      padding-right: $timetable-gap;
      font-size: 0.85rem;
      text-align: center;

      .timetable-grid__header-inner {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
      }

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

      .timetable-grid__header-jump {
        height: 15px;
        line-height: 15px;
        margin: 0 8px -16px;
        border-bottom-left-radius: $generic-border-radius;
        border-bottom-right-radius: $generic-border-radius;
        border: solid var(--separator-color) 1px;
        border-top: none;
      }

      &:first-of-type {
        padding-left: $timetable-gap;
      }

      &.timetable-grid__header--dense .timetable-grid__header-inner {
        display: block;

        .substitutions-button {
          width: 100%;
          margin-bottom: -2px;
          margin-top: 2px;
        }
      }
    }
  }

  .timetable-grid__days {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    min-width: 0;

    .timetable-grid__day-jump {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 4px 8px;
    }

    .timetable-grid__day {
      width: var(--column-width);
      padding-right: $timetable-gap;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: v-bind(rows);
      flex: 0 0 var(--column-width);
      scroll-snap-align: end;
      scroll-snap-stop: normal;
      position: relative;

      &:first-of-type {
        margin-left: $timetable-gap;
      }
    }

    .timetable-grid__marker {
      transform: translateY(v-bind(markerOffsetPx));
      position: absolute;
      width: calc(100% + #{$timetable-gap});
      margin-left: -$timetable-gap;
    }
  }

  .timetable-grid__corner {
    grid-row: 1;
    grid-column: 1;
    position: sticky;
    top: -1px;
    margin-top: -1px;
    margin-right: -1px;
    left: 0;
    z-index: 1;
  }

  &.timetable-grid__wrapper--dense {
    --column-count: 5;

    .timetable-grid__header-date {
      font-size: min(calc((100vw - 32px) * 0.03), 0.9em) !important;
    }
  }
}
</style>
