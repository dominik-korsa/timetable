<template>
  <q-card class="timetable-dialog">
    <div
      class="timetable-dialog__list"
      role="list"
    >
      <div
        v-for="(items, subject) in groups"
        :key="subject"
      >
        <div
          class="timetable-dialog__list-header"
          role="heading"
        >
          {{ subject }}
        </div>
        <q-item
          v-for="(lesson, i) in items"
          :key="i"
          class="q-px-sm q-py-none timetable-dialog__item"
          role="listitem"
        >
          <q-item-section
            v-if="many || lesson.isFavourite"
            side
            class="q-pr-xs"
          >
            <q-btn
              :icon="lesson.isFavourite ? 'star' : 'star_border'"
              :color="lesson.isFavourite ? 'amber' : undefined"
              :aria-label="lesson.isFavourite ? 'Usuń lekcję z ulubionych' : 'Dodaj lekcję do ulubionych'"
              flat
              round
              @click="lesson.favouriteClick"
            />
          </q-item-section>
          <q-item-section class="timetable-dialog__item-content q-py-xs">
            <div class="timetable-dialog__item-top">
              <div
                v-if="!lesson.teacher"
                class="timetable-dialog__item-teacher timetable-dialog__item-teacher--empty"
              >
                (brak nauczyciela)
              </div>
              <router-link
                v-else-if="lesson.teacherTo"
                class="timetable-dialog__item-teacher"
                :to="lesson.teacherTo"
                :aria-label="`Nauczyciel ${lesson.teacher}`"
              >
                {{ lesson.teacher }}
              </router-link>
              <div
                v-else
                class="timetable-dialog__item-teacher"
                :aria-label="`Nauczyciel ${lesson.teacher}`"
              >
                {{ lesson.teacher }}
              </div>
              <div class="timetable-dialog__item-top-right">
                <router-link
                  v-if="lesson.roomTo !== undefined"
                  class="timetable-dialog__item-room"
                  :to="lesson.roomTo"
                  :aria-label="`Sala ${lesson.room}`"
                >
                  {{ lesson.room }}
                </router-link>
                <div
                  v-else
                  class="timetable-dialog__item-room"
                  :aria-label="`Sala ${lesson.room}`"
                >
                  {{ lesson.room }}
                </div>
                <timetable-dialog-classes
                  v-if="!lesson.group"
                  :classes="lesson.classes"
                />
              </div>
            </div>
            <div
              v-if="lesson.group"
              class="timetable-dialog__item-bottom"
            >
              <div
                class="timetable-dialog__item-group"
                :aria-label="lesson.group.name"
              >
                {{ lesson.group.name }}
                <span
                  v-if="lesson.group.name !== lesson.group.key"
                  class="timetable-dialog__item-group-alt"
                >({{ lesson.group.key }})</span>
              </div>
              <timetable-dialog-classes :classes="lesson.classes" />
            </div>
          </q-item-section>
        </q-item>
      </div>
    </div>
    <q-separator />
    <div class="q-px-md q-pt-sm row items-baseline justify-between full-width text-caption">
      <div
        class="q-mr-sm"
        :aria-label="timeSlotLabel"
      >
        Lekcja {{ timeSlot.display }}, {{ timeSlot.begin }} - {{ timeSlot.end }}
      </div>
      <div :aria-label="date.display">
        {{ date.display }}
      </div>
    </div>
    <q-item class="q-px-sm q-pt-xs">
      <q-item-section
        side
        class="q-pr-sm"
      >
        <q-btn
          :icon="favourite === null ? 'visibility_off' : 'visibility'"
          flat
          round
          :color="favourite === null ? 'negative' : undefined"
          :aria-label="favourite === null ? 'Pokaż lekcję' : 'Ukryj lekcję'"
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
import { TableTimeSlot, TableLesson, TableLessonMoment } from 'src/api/common';
import { weekdayNames } from 'src/shared';
import TimetableDialogClasses from 'components/TimetableDialogClasses.vue';
import { RouteLocationRaw, useRoute } from 'vue-router';
import { paramNames, pickParams, routeNames } from 'src/router/route-constants';
import { useFormatter } from 'src/composables/formatter';

interface LessonItem extends TableLesson {
  isFavourite: boolean | null | undefined;
  favouriteClick: () => void;
  roomTo: RouteLocationRaw | undefined;
  teacherTo: RouteLocationRaw | undefined;
}

export default defineComponent({
  name: 'TimetableDialog',
  components: { TimetableDialogClasses },
  props: {
    moment: {
      type: Object as PropType<TableLessonMoment>,
      required: true,
    },
    timeSlot: {
      type: Object as PropType<TableTimeSlot>,
      required: true,
    },
    favourite: {
      type: [Object] as PropType<FavouriteLesson | null | undefined>,
      required: false,
      default: undefined,
    },
    isVLo: Boolean,
  },
  emits: ['close'],
  setup: (props, { emit }) => {
    const config = useConfigStore();
    const formatter = useFormatter();
    const route = useRoute();

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
            roomTo: lesson.roomId === undefined ? undefined
              : route.params[paramNames.tri] === 'v-lo' ? {
                name: routeNames.schoolUnitList,
                params: {
                  ...pickParams(route, 'tri'),
                  [paramNames.unitType]: 'room',
                },
                query: { selected: lesson.roomId },
              } : {
                name: routeNames.unitTimetable,
                params: {
                  ...pickParams(route, 'tri'),
                  [paramNames.unitType]: 'room',
                  [paramNames.unit]: lesson.roomId,
                },
              },
            teacherTo: lesson.teacherId === undefined ? undefined : {
              name: routeNames.unitTimetable,
              params: {
                ...pickParams(route, 'tri'),
                [paramNames.unitType]: 'teacher',
                [paramNames.unit]: lesson.teacherId,
              },
            },
          });
        });
        return groups;
      }),
      timeSlotLabel: computed(() => formatter.formatTimeSlotLabel(props.timeSlot)),
      date: computed(() => {
        const weekdayName = weekdayNames[props.moment.weekday];
        if (!props.moment.date) {
          return {
            display: weekdayName,
            label: weekdayName,
          };
        }
        return {
          display: `${weekdayName}, ${formatter.formatDisplay(props.moment.date)}`,
          label: `${weekdayName}, ${formatter.formatLabel(props.moment.date)}`,
        };
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
      align-items: center;
      justify-content: space-between;

      .timetable-dialog__item-teacher--empty {
        opacity: 0.7;
      }

      .timetable-dialog__item-top-right {
        margin-left: 6px;
        text-align: right;

        .timetable-dialog-classes {
          font-size: 0.8em;
        }
      }
    }

    .timetable-dialog__item-bottom {
      display: flex;
      align-items: baseline;
      font-size: 0.8em;
      justify-content: space-between;

      .timetable-dialog__item-group {
        font-style: italic;
        padding-right: 2px;

        .timetable-dialog__item-group-alt {
          font-weight: 300;
          opacity: 0.7;
        }
      }

      .timetable-dialog-classes {
        text-align: right;
        margin-left: auto;
      }
    }
  }
}
</style>
