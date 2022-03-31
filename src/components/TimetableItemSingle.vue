<template>
  <q-card
    class="timetable-item timetable-item--single"
    bordered
    flat
  >
    <div class="timetable-item__top">
      <div class="timetable-item__subject">
        {{ lesson.subjectShort }}
      </div>
      <div class="timetable-item__room">
        {{ lesson.room }}
      </div>
    </div>
    <div class="timetable-item__bottom">
      <div class="timetable-item__group">
        {{ lesson.group }}
      </div>
      <div class="timetable-item__teacher">
        {{ lesson.teacher }}
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { PropType } from 'vue/dist/vue';
import { defineComponent } from 'vue';
import { TableLesson } from '../api/common';

export default defineComponent({
  name: 'TimetableItemSingle',
  props: {
    lesson: {
      type: Object as PropType<TableLesson>,
      required: true,
    },
  },
  setup: () => ({}),
});
</script>

<style lang="scss">
.timetable-item--single {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px;
  font-size: 0.75rem;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;

  .timetable-item__top, .timetable-item__bottom {
    display: flex;
    justify-content: space-between;
    overflow-x: hidden;
    width: 100%;
  }

  .timetable-item__subject {
    text-align: left;
    font-weight: 500;
    font-size: 1.2em;
    flex-grow: 1;
  }

  .timetable-item__room {
    text-align: right;
    margin-left: 1px;
    flex-shrink: 0;
    flex-grow: 1;
  }

  .timetable-item__group {
    text-align: left;
    flex-shrink: 0;
  }

  .timetable-item__teacher {
    text-align: right;
    margin-left: 5px;
    font-weight: 300;
  }

  .timetable-item__subject, .timetable-item__room,
  .timetable-item__group, .timetable-item__teacher {
    overflow-x: hidden;
    overflow-y: clip;
    text-overflow: ellipsis;
  }
}
</style>
