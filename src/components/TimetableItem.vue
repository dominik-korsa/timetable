<template>
  <q-card
    flat
    bordered
    class="timetable-item"
    :class="{
      'timetable-item--hidden': favourite === null
    }"
  >
    <timetable-item-single
      v-if="moment.lessons.length === 1"
      :lesson="moment.lessons[0]"
    />
    <timetable-item-multiple
      v-else
      :lessons="moment.lessons"
      :favourite="favourite"
      @set-favourite="onSetFavourite"
    />
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import TimetableItemSingle from 'components/TimetableItemSingle.vue';
import TimetableItemMultiple from 'components/TimetableItemMultiple.vue';
import { TableLessonMoment } from 'src/api/common';
import { Favourite, useConfigStore } from 'stores/config';

export default defineComponent({
  name: 'TimetableItem',
  components: { TimetableItemMultiple, TimetableItemSingle },
  props: {
    moment: {
      type: Object as PropType<TableLessonMoment>,
      required: true,
    },
  },
  setup: (props) => {
    const config = useConfigStore();
    return ({
      favourite: computed(() => config.favourites[props.moment.umid]),
      onSetFavourite: (value: Favourite | undefined) => {
        config.setFavourite(props.moment.umid, value);
      },
    });
  },
});
</script>

<style lang="scss">
.timetable-item {
  overflow: hidden;

  .timetable-item-single, .timetable-item-multiple {
    height: 100%;
  }

  &.timetable-item--hidden {
    opacity: 30%;
  }
}
</style>
