<template>
  <div
    class="timetable-item-multiple"
    :class="{
      'timetable-item-multiple--small': small,
    }"
  >
    <div
      v-if="favouriteLesson === null"
      class="timetable-item-multiple__generic"
    >
      <div
        v-if="commonSubjectShort !== undefined"
        class="timetable-item-multiple__common-subject"
        :aria-label="commonSubject ?? commonSubjectShort"
      >
        {{ commonSubjectShort }}
      </div>
      <div class="timetable-item-multiple__count">
        <b>{{ lessons.length }}</b> {{ groupsText }}
      </div>
    </div>
    <timetable-item-single
      v-else-if="small"
      :lesson="favouriteLesson"
      :unit-type="unitType"
      show-color
      small
    >
      <div
        class="timetable-item-multiple__more-small bg-page"
        :aria-label="otherGroupsLabel"
      >
        +{{ lessons.length-1 }}
      </div>
    </timetable-item-single>
    <div
      v-else
      class="timetable-item-multiple__favourite"
    >
      <timetable-item-single
        :lesson="favouriteLesson"
        :unit-type="unitType"
        show-color
      />
      <div
        class="timetable-item-multiple__more border-l"
        :aria-label="otherGroupsLabel"
      >
        +{{ lessons.length-1 }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TableLesson, UnitType } from 'src/api/common';
import { computed } from 'vue';
import { common } from 'src/utils';
import TimetableItemSingle from 'components/timetable/TimetableItemSingle.vue';
import { FavouriteLesson } from 'stores/config';
import { groupPlural, otherLessonsPlural, pluralRules } from 'src/plural';

const props = defineProps<{
  lessons: TableLesson[];
  favourite?: FavouriteLesson | null | undefined;
  small?: boolean;
  unitType: UnitType;
}>();

const groupsText = computed(() => groupPlural[pluralRules.select(props.lessons.length)]);
const otherGroupsLabel = computed(
  () => `i ${props.lessons.length - 1} ${
    otherLessonsPlural[pluralRules.select(props.lessons.length - 1)]
  }`,
);
const commonSubjectShort = computed(
  () => common(props.lessons.map((lesson) => lesson.subjectShort)),
);
const commonSubject = computed(
  () => common(props.lessons.map((lesson) => lesson.subject)),
);
const favouriteLesson = computed(() => {
  const { favourite } = props;
  if (!favourite) return null;
  return props.lessons.find(
    (lesson) => lesson.group?.key === favourite.group && lesson.subject === favourite.subject,
  ) ?? null;
});
</script>

<style lang="scss">
.timetable-item-multiple {
  .timetable-item-multiple__generic {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    line-height: 1;
    padding: 2px;
    width: 100%;
    height: 100%;
    font-size: 0.8rem;

    .timetable-item-multiple__common-subject {
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-bottom: 3px;
      font-size: 1em;
    }

    .timetable-item-multiple__count {
      font-style: italic;
      font-size: 0.9em;
    }
  }

  .timetable-item-multiple__favourite {
    display: flex;
    height: 100%;
    width: 100%;

    .timetable-item-single {
      flex-grow: 1;
    }

    .timetable-item-multiple__more {
      padding: 0 2px;
      font-size: 0.7rem;
      align-self: center;
    }
  }

  &.timetable-item-multiple--small {
    .timetable-item-multiple__generic {
      font-size: 0.7rem;

      .timetable-item-multiple__common-subject {
        font-size: 0.85em
      }
    }
  }

  .timetable-item-multiple__more-small {
    overflow: hidden;
    border: var(--separator-color) 1px;
    border-top-style: solid;
    border-left-style: solid;
    border-top-left-radius: $generic-border-radius;
    padding: 1px 1px 0;
    line-height: 1;
    margin-left: 2px;
  }
}
</style>
