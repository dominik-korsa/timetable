<template>
  <div class="timetable-item-single">
    <div class="timetable-item-single__top">
      <div class="timetable-item-single__subject">
        {{ fullSubject ? lesson.subject : lesson.subjectShort }}
      </div>
      <div class="timetable-item-single__room">
        {{ lesson.room }}
      </div>
    </div>
    <div class="timetable-item-single__bottom">
      <div class="timetable-item-single__group">
        {{ lesson.group }}
      </div>
      <div class="timetable-item-single__teacher">
        {{ lesson.teacher }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue/dist/vue';
import { computed, defineComponent } from 'vue';
import { TableLesson } from '../api/common';

export default defineComponent({
  name: 'TimetableItemSingle',
  props: {
    lesson: {
      type: Object as PropType<TableLesson>,
      required: true,
    },
    fullSubject: Boolean,
    showColor: Boolean,
  },
  setup: (props) => ({
    background: computed(
      () => (props.showColor && props.lesson.color ? `${props.lesson.color}77` : 'transparent'),
    ),
  }),
});
</script>

<style lang="scss">
.timetable-item-single {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
  font-size: 0.75rem;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  background: v-bind(background);

  .timetable-item-single__top, .timetable-item-single__bottom {
    display: flex;
    justify-content: space-between;
    overflow-x: hidden;
    width: 100%;
  }

  .timetable-item-single__subject {
    text-align: left;
    font-weight: 500;
    font-size: 1.2em;
    flex-grow: 1;
  }

  .timetable-item-single__room {
    text-align: right;
    margin-left: 4px;
    flex-shrink: 0;
    flex-grow: 1;
  }

  .timetable-item-single__group {
    text-align: left;
    flex-shrink: 0;
    font-style: italic;
    padding-right: 2px;
  }

  .timetable-item-single__teacher {
    text-align: right;
    padding-left: 2px;
    font-weight: 300;
  }

  .timetable-item-single__subject, .timetable-item-single__room,
  .timetable-item-single__group, .timetable-item-single__teacher {
    overflow-x: hidden;
    overflow-y: clip;
    text-overflow: ellipsis;
  }
}
</style>
