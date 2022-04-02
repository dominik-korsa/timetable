<template>
  <div class="timetable-item-multiple">
    <div
      v-if="favouriteLesson !== null"
      class="timetable-item-multiple__favourite"
    >
      <timetable-item-single
        :lesson="favouriteLesson"
        show-color
      />
      <q-separator vertical />
      <div class="timetable-item-multiple__more">
        +{{ lessons.length-1 }}
      </div>
    </div>
    <div
      v-else
      class="timetable-item-multiple__generic"
    >
      <div
        v-if="commonSubject !== undefined"
        class="timetable-item-multiple__common-subject"
      >
        {{ commonSubject }}
      </div>
      <div class="timetable-item-multiple__count">
        <b>{{ lessons.length }}</b> {{ groupsText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { TableLesson } from 'src/api/common';
import {
  computed, defineComponent, PropType,
} from 'vue';
import { common } from 'src/utils';
import TimetableItemSingle from 'components/TimetableItemSingle.vue';
import { Favourite } from 'stores/config';

const pluralRules = new Intl.PluralRules('pl-PL');

export default defineComponent({
  name: 'TimetableItemMultiple',
  components: { TimetableItemSingle },
  props: {
    lessons: {
      type: Array as PropType<TableLesson[]>,
      required: true,
    },
    favourite: {
      type: [Object] as PropType<Favourite | undefined>,
      required: false,
      default: undefined,
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
    }[pluralRules.select(props.lessons.length)])),
    commonSubject: computed(
      () => common(props.lessons.map((lesson) => lesson.subjectShort)),
    ),
    favouriteLesson: computed(() => {
      const { favourite } = props;
      if (!favourite) return null;
      return props.lessons.find(
        (lesson) => lesson.group === favourite.group && lesson.subject === favourite.subject,
      ) ?? null;
    }),
  }),
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

    .timetable-item-multiple__common-subject {
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-bottom: 3px;
    }

    .timetable-item-multiple__count {
      font-style: italic;
      font-size: 0.75rem;
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
}
</style>
