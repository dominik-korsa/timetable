<template>
  <q-card class="timetable-dialog">
    <div class="timetable-dialog__list">
      <div
        v-for="(items, subject) in groups"
        :key="subject"
      >
        <div class="timetable-dialog__list-header">
          {{ subject }}
        </div>
        <q-item
          v-for="(lesson, i) in items"
          :key="i"
          class="q-px-sm timetable-dialog__item"
        >
          <q-item-section
            v-if="many || lesson.isFavourite"
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
          <q-item-section class="timetable-dialog__item-content">
            <div class="timetable-dialog__item-top">
              <div
                v-if="lesson.teacher"
                class="timetable-dialog__item-teacher"
              >
                {{ lesson.teacher }}
              </div>
              <div
                v-else
                class="timetable-dialog__item-teacher timetable-dialog__item-teacher--empty"
              >
                (brak nauczyciela)
              </div>
              <router-link
                v-if="lesson.roomId !== undefined"
                class="timetable-dialog__item-room"
                :to="{
                  name: 'SelectRoom',
                  params: $route.params,
                  query: { selected: lesson.roomId },
                }"
              >
                {{ lesson.room }}
              </router-link>
              <div
                v-else
                class="timetable-dialog__item-room"
              >
                {{ lesson.room }}
              </div>
            </div>
            <div
              v-if="lesson.group"
              class="timetable-dialog__item-group"
            >
              {{ lesson.group.name }}
              <span
                v-if="lesson.group.name !== lesson.group.key"
                class="timetable-dialog__item-group-alt"
              >({{ lesson.group.key }})</span>
            </div>
          </q-item-section>
        </q-item>
      </div>
    </div>
    <q-separator />
    <q-item class="q-px-sm">
      <q-item-section
        side
        class="q-pr-sm"
      >
        <q-btn
          :icon="favourite === null ? 'visibility_off' : 'visibility'"
          flat
          round
          :color="favourite === null ? 'negative' : undefined"
          @click="hideClick"
        />
      </q-item-section>
      <q-item-section>
        {{ favourite === null ? 'Lekcja ukryta' : 'Lekcja widoczna' }}
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { FavouriteLesson, useConfigStore } from 'stores/config';
import { TableLesson, TableLessonMoment } from 'src/api/common';

interface LessonItem extends TableLesson {
  isFavourite: boolean | null | undefined;
  favouriteClick: () => void;
}

export default defineComponent({
  name: 'TimetableDialog',
  props: {
    moment: {
      type: Object as PropType<TableLessonMoment>,
      required: true,
    },
    favourite: {
      type: [Object] as PropType<FavouriteLesson | null | undefined>,
      required: false,
      default: undefined,
    },
  },
  emits: ['close'],
  setup: (props, { emit }) => {
    const config = useConfigStore();

    const setFavourite = (value: FavouriteLesson | null | undefined) => {
      config.setFavourite(`${props.moment.umid}|#`, value);
    };

    return ({
      hideClick: () => {
        if (props.favourite !== null) emit('close');
        setFavourite(props.favourite === null ? undefined : null);
      },
      many: computed(() => props.moment.lessons.length > 1),
      groups: computed(() => {
        const groups: Record<string, LessonItem[]> = {};
        props.moment.lessons.forEach((lesson) => {
          const isFavourite = props.favourite
            && props.favourite.group === lesson.group?.key
            && props.favourite.subject === lesson.subject;
          if (!(lesson.subject in groups)) groups[lesson.subject] = [];
          groups[lesson.subject].push({
            ...lesson,
            isFavourite,
            favouriteClick: isFavourite ? () => {
              setFavourite(undefined);
            } : () => {
              setFavourite({
                subject: lesson.subject,
                group: lesson.group?.key,
              });
              emit('close');
            },
          });
        });
        return groups;
      }),
    });
  },
});
</script>

<style lang="scss">
.timetable-dialog {
  min-width: min(350px, 100%);
  display: flex;
  flex-direction: column;

  .timetable-dialog__list {
    position: relative;
    overflow-y: auto;
    flex-grow: 1;

    > div {
      $inset: 1px;
      margin-bottom: $inset;

      > .timetable-dialog__list-header {
        background: var(--distinct-bg-color);
        text-align: center;
        padding: 8px;
        font-weight: 500;
        font-size: 12pt;

        z-index: 1;
        position: sticky;
        top: 0;
        margin-top: -$inset;
      }

      &:not(:last-of-type) {
        border-bottom: var(--separator-color) 1px solid;
      }
    }
  }

  .timetable-dialog__item {
    &:not(:last-of-type) {
      border-bottom: var(--separator-color) 1px solid;
    }

    .timetable-dialog__item-top {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .timetable-dialog__item-teacher--empty {
        opacity: 0.7;
      }
    }

    a.timetable-dialog__item-room {
      color: $primary;
    }

    .timetable-dialog__item-group {
      font-style: italic;
      font-size: 0.8em;

      .timetable-dialog__item-group-alt {
        font-weight: 300;
        opacity: 0.7;
      }
    }
  }
}
</style>
