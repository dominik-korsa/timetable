<template>
  <div
    v-ripple
    class="timetable-item rounded-borders bordered relative-position"
    :class="{
      'timetable-item--hidden': favourite === null
    }"
    tabindex="0"
    role="button"
    :aria-description="description"
    @click="dialogVisible = true"
    @keyup.enter="dialogVisible = true"
    @keyup.space="dialogVisible = true"
  >
    <timetable-item-single
      v-if="moment.lessons.length === 1"
      :lesson="moment.lessons[0]"
      :unit-type="unitType"
      :show-color="favourite !== null"
      :small="small"
    />
    <timetable-item-multiple
      v-else
      :lessons="moment.lessons"
      :favourite="favourite"
      :unit-type="unitType"
      :small="small"
    />
    <q-dialog
      v-model="dialogVisible"
      class="timetable-item__dialog"
    >
      <timetable-dialog
        :moment="moment"
        :time-slot="timeSlot"
        :favourite="favourite"
        @close="dialogVisible = false"
      />
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  computed, ref,
} from 'vue';
import TimetableItemSingle from 'components/timetable/TimetableItemSingle.vue';
import TimetableItemMultiple from 'components/timetable/TimetableItemMultiple.vue';
import { TableTimeSlot, TableLessonMoment, UnitType } from 'src/api/common';
import { useConfigStore } from 'stores/config';
import TimetableDialog from 'components/timetable/TimetableDialog.vue';
import { weekdayNames } from 'src/shared';

const props = defineProps<{
  moment: TableLessonMoment,
  small?: boolean,
  timeSlot: TableTimeSlot,
  unitType: UnitType,
}>();

const config = useConfigStore();
const favourite = computed(() => config.favouriteLessons[`${props.moment.umid}|#`]);
const dialogVisible = ref(false);
const description = computed(() => {
  const text = `${weekdayNames[props.moment.weekday]}, `
      + `godzina ${props.timeSlot.begin}. `
      + `Lekcja numer ${props.timeSlot.display}.`;
  if (favourite.value === null) return `Lekcja ukryta. ${text}`;
  return text;
});
</script>

<style lang="scss">
.timetable-item {
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  .timetable-item-single, .timetable-item-multiple {
    height: 100%;
  }

  &.timetable-item--hidden {
    opacity: 15%;
  }
}

.timetable-item__dialog .q-dialog__inner {
  padding: 16px 8px;
}
</style>
