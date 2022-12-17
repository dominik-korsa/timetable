<template>
  <div class="hour-markers bg-page">
    <div
      v-for="(hour, i) in hours"
      :key="i"
      class="hour-marker"
      :style="`grid-row: ${i*2+2}`"
    >
      <div class="hour-marker__number">
        {{ hour.display }}
      </div>
      <div class="hour-marker__start">
        {{ hour.begin }}
      </div>
      <div class="hour-marker__end">
        {{ hour.end }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TableHour } from 'src/api/common';

export default defineComponent({
  props: {
    hours: {
      type: Array as PropType<TableHour[]>,
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
.hour-markers {
  grid-template-rows: v-bind(rows);
  display: grid;
  grid-template-columns: 1fr;
  border-right: solid var(--separator-color) 1px;

  .hour-marker {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr auto;
    padding: 2px 5px;
    grid-template-areas:
          "number start"
          "number end";

    .hour-marker__number {
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

    .hour-marker__start, .hour-marker__end {
      font-size: 0.8rem;
      line-height: 1;
      text-align: right;
    }

    .hour-marker__start {
      grid-area: start;
      align-self: start;
    }

    .hour-marker__end {
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

      .hour-marker__number {
        margin: 0;
        padding: 0;
        border: none;
        font-size: 0.9rem;
        text-align: center;
        line-height: 0;
        justify-self: center;
      }

      .hour-marker__start, .hour-marker__end {
        font-size: 0.7em;
        text-align: center;
      }
    }
  }
}
</style>
