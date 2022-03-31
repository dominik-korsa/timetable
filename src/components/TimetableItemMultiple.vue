<template>
  <b class="timetable-item">Wiele 😫</b>
</template>

<script lang="ts">
import { TableLesson } from 'src/api/common';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'TimetableItemMultiple',
  props: {
    lessons: {
      type: Array as PropType<TableLesson[]>,
      required: true,
    },
  },
  setup: () => ({}),
});
</script>
