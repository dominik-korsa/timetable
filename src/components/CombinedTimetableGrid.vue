<template>
  <div class="combined-timetable-grid">
    <div class="combined-timetable-grid__header">
      <div class="combined-timetable-grid__header-top">
        <div class="combined-timetable-grid__weekday">
          {{ weekday.name }}
        </div>
        <div class="combined-timetable-grid__date">
          29.10.2022
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
    <div style="height: 500px" />
  </div>
</template>

<script lang="ts">
import { Weekday } from 'src/pages/CombinedTimetable.vue';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'CombinedTimetableGrid',
  props: {
    weekday: {
      type: Object as PropType<Weekday>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
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
      width: 100px;
      min-width: 100px;
    }
  }
}
</style>
