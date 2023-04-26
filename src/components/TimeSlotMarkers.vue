<template>
  <ul
    class="time-slot-markers bg-page"
    aria-label="Godziny lekcji"
  >
    <li
      v-for="(timeSlot, i) in timeSlots"
      :key="i"
      class="time-slot-marker"
      :style="`grid-row: ${i*2+2}`"
      :aria-label="`Lekcja numer ${timeSlot.display}. Od godziny ${timeSlot.begin} do ${timeSlot.end}`"
    >
      <div
        class="time-slot-marker__number"
        aria-hidden="true"
      >
        {{ timeSlot.display }}
      </div>
      <div
        class="time-slot-marker__start"
        aria-hidden="true"
      >
        {{ timeSlot.begin }}
      </div>
      <div
        class="time-slot-marker__end"
        aria-hidden="true"
      >
        {{ timeSlot.end }}
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TableTimeSlot } from 'src/api/common';

export default defineComponent({
  props: {
    timeSlots: {
      type: Array as PropType<TableTimeSlot[]>,
      required: true,
    },
    rows: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss">
.time-slot-markers {
  grid-template-rows: v-bind(rows);
  display: grid;
  grid-template-columns: 1fr;
  border-right: solid var(--separator-color) 1px;
  margin: 0;
  padding: 0;
  list-style: none;

  .time-slot-marker {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr auto;
    padding: 2px 5px;
    grid-template-areas:
          "number start"
          "number end";

    .time-slot-marker__number {
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

    .time-slot-marker__start, .time-slot-marker__end {
      font-size: 0.8rem;
      line-height: 1;
      text-align: right;
    }

    .time-slot-marker__start {
      grid-area: start;
      align-self: start;
    }

    .time-slot-marker__end {
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

      .time-slot-marker__number {
        margin: 0;
        padding: 0;
        border: none;
        font-size: 0.9rem;
        text-align: center;
        line-height: 0;
        justify-self: center;
      }

      .time-slot-marker__start, .time-slot-marker__end {
        font-size: 0.7em;
        text-align: center;
      }
    }
  }
}
</style>
