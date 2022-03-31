<template>
  <div
    class="timetable-item-multiple"
    @click="dialogVisible = true"
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
  <q-dialog v-model="dialogVisible">
    <q-card>
      <q-list
        class="timetable-item-multiple__dialog"
        separator
      >
        <q-item
          v-for="(lesson, i) in items"
          :key="i"
          class="q-px-sm"
        >
          <q-item-section
            side
            class="q-pr-xs"
          >
            <q-btn
              :icon="lesson.isFavourite ? 'star' : 'star_border'"
              :color="lesson.isFavourite ? 'amber' : undefined"
              flat
              round
              @click="lesson.favouriteClick"
            />
          </q-item-section>
          <q-item-section>
            <timetable-item-single
              :lesson="lesson"
              class="timetable-item-multiple__dialog-item"
              full-subject
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator />
      <q-item
        class="q-px-sm"
      >
        <q-item-section
          side
          class="q-pr-sm"
        >
          <q-btn
            :icon="favourite === null ? 'visibility_off' : 'visibility'"
            flat
            round
            :color="favourite === null ? 'primary' : undefined"
            @click="favouriteClick(null)"
          />
        </q-item-section>
        <q-item-section>
          {{ favourite === null ? 'Lekcja ukryta' : 'Lekcja widoczna' }}
        </q-item-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { TableLesson } from 'src/api/common';
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { common, getTypeValidator } from 'src/utils';
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
  emits: {
    setFavourite: getTypeValidator<[value: Favourite | undefined]>(),
  },
  setup: (props, { emit }) => {
    const favouriteClick = (value: Favourite) => {
      if (props.favourite === value) {
        emit('setFavourite', undefined);
      } else {
        emit('setFavourite', value);
      }
    };
    return ({
      dialogVisible: ref(false),
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
      favouriteClick,
      items: computed(() => props.lessons.map((lesson) => ({
        ...lesson,
        isFavourite: props.favourite
          && props.favourite.group === lesson.group
          && props.favourite.subject === lesson.subject,
        favouriteClick: () => favouriteClick({
          subject: lesson.subject,
          group: lesson.group,
        }),
      }))),
    });
  },
});
</script>

<style lang="scss">
.timetable-item-multiple {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  line-height: 1;
  padding: 2px;

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

.timetable-item-multiple__dialog {
  width: 300px;
  max-width: 100%;

  .timetable-item-multiple__dialog-item {
    min-height: 40px;
  }
}
</style>
