<template>
  <q-card
    class="timetable-item timetable-item--multiple"
    bordered
    flat
  >
    <div
      v-if="commonSubject !== undefined"
      class="timetable-item__common-subject"
    >
      {{ commonSubject }}
    </div>
    <div class="timetable-item__count">
      <b>{{ lessons.length }}</b> {{ groupsText }}
    </div>
  </q-card>
</template>

<script lang="ts">
import { TableLesson } from 'src/api/common';
import { computed, defineComponent, PropType } from 'vue';
import { common } from 'src/utils';

const plurarRules = new Intl.PluralRules('pl-PL');

export default defineComponent({
  name: 'TimetableItemMultiple',
  props: {
    lessons: {
      type: Array as PropType<TableLesson[]>,
      required: true,
    },
  },
  setup: (props) => ({
    groupsText: computed(() => ({
      zero: 'grup',
      one: 'grupa',
      two: 'grupy',
      few: 'grupy',
      many: 'grup',
      other: 'grupy',
    }[plurarRules.select(props.lessons.length)])),
    commonSubject: computed(() => common(props.lessons.map((lesson) => lesson.subjectShort))),
  }),
});
</script>

<style lang="scss">
.timetable-item--multiple {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .timetable-item__common-subject {
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .timetable-item__count {
    font-style: italic;
    font-size: 0.75rem;
  }
}
</style>
