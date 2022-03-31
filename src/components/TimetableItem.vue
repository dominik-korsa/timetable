<template>
  <timetable-item-single
    v-if="lessons.length === 1"
    :lesson="lessons[0]"
  />
  <timetable-item-multiple
    v-else
    :lessons="lessons"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TableLesson from '@wulkanowy/timetable-parser/dist/lib/TableHour';
import TimetableItemSingle from 'components/TimetableItemSingle.vue';
import TimetableItemMultiple from 'components/TimetableItemMultiple.vue';

export default defineComponent({
  name: 'TimetableItem',
  components: { TimetableItemMultiple, TimetableItemSingle },
  props: {
    lessons: {
      type: Array as PropType<TableLesson[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
.timetable-item {}
</style>
