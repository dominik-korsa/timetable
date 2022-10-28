<template>
  <q-card class="timetable-dialog">
    <q-list separator>
      <q-item
        v-for="(lesson, i) in items"
        :key="i"
        class="q-px-sm"
      >
        <q-item-section
          v-if="items.length > 1 || lesson.isFavourite"
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
            class="timetable-dialog__item"
            full-subject
          />
        </q-item-section>
      </q-item>
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
            :color="favourite === null ? 'negative' : undefined"
            @click="hideClick"
          />
        </q-item-section>
        <q-item-section>
          {{ favourite === null ? 'Lekcja ukryta' : 'Lekcja widoczna' }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { FavouriteLesson, useConfigStore } from 'stores/config';
import { TableLessonMoment } from 'src/api/common';
import TimetableItemSingle from 'components/TimetableItemSingle.vue';

export default defineComponent({
  name: 'TimetableDialog',
  components: { TimetableItemSingle },
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
      items: computed(() => props.moment.lessons.map((lesson) => {
        const isFavourite = props.favourite
          && props.favourite.group === lesson.group
          && props.favourite.subject === lesson.subject;
        return ({
          ...lesson,
          isFavourite,
          favouriteClick: isFavourite ? () => {
            setFavourite(undefined);
          } : () => {
            setFavourite({
              subject: lesson.subject,
              group: lesson.group,
            });
            emit('close');
          },
        });
      })),
    });
  },
});
</script>

<style lang="scss">
.timetable-dialog {
  min-width: min(300px, 100%);

  .timetable-dialog__item {
    min-height: 40px;
    width: 100%;
    border-radius: 4px;
  }
}
</style>
