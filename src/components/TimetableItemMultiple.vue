<template>
  <div
    class="timetable-item-multiple"
    @click="dialogVisible = true"
  >
    <div
      v-if="favouriteLesson !== null"
      class="timetable-item-multiple__favourite"
    >
      <timetable-item-single :lesson="favouriteLesson" />
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
            @click="hideClick"
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
  setup: (props, { emit }) => ({
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
    hideClick: () => {
      emit('setFavourite', props.favourite === null ? undefined : null);
    },
    items: computed(() => props.lessons.map((lesson) => {
      const isFavourite = props.favourite
          && props.favourite.group === lesson.group
          && props.favourite.subject === lesson.subject;
      return ({
        ...lesson,
        isFavourite,
        favouriteClick: isFavourite ? () => {
          emit('setFavourite', undefined);
        } : () => {
          emit('setFavourite', {
            subject: lesson.subject,
            group: lesson.group,
          });
        },
      });
    })),
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

.timetable-item-multiple__dialog {
  min-width: 300px;
  max-width: 100%;

  .timetable-item-multiple__dialog-item {
    min-height: 40px;
  }
}
</style>
