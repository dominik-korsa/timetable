<template>
  <q-card
    v-ripple
    flat
    bordered
    class="timetable-item"
    :class="{
      'timetable-item--hidden': favourite === null
    }"
    tabindex="0"
    role="button"
    @click="dialogVisible = true"
    @keyup.enter="dialogVisible = true"
    @keyup.space="dialogVisible = true"
  >
    <timetable-item-single
      v-if="moment.lessons.length === 1"
      :lesson="moment.lessons[0]"
      :show-color="favourite !== null"
      :small="small"
    />
    <timetable-item-multiple
      v-else
      :lessons="moment.lessons"
      :favourite="favourite"
      :small="small"
    />
    <q-dialog
      v-model="dialogVisible"
      class="timetable-item__dialog"
    >
      <timetable-dialog
        :moment="moment"
        :hour="hour"
        :favourite="favourite"
        @close="dialogVisible = false"
      />
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import TimetableItemSingle from 'components/TimetableItemSingle.vue';
import TimetableItemMultiple from 'components/TimetableItemMultiple.vue';
import { TableHour, TableLessonMoment } from 'src/api/common';
import { useConfigStore } from 'stores/config';
import TimetableDialog from 'components/TimetableDialog.vue';

export default defineComponent({
  name: 'TimetableItem',
  components: { TimetableDialog, TimetableItemMultiple, TimetableItemSingle },
  props: {
    moment: {
      type: Object as PropType<TableLessonMoment>,
      required: true,
    },
    small: Boolean,
    hour: {
      type: Object as PropType<TableHour>,
      required: true,
    },
  },
  setup: (props) => {
    const config = useConfigStore();
    return ({
      favourite: computed(() => config.favouriteLessons[`${props.moment.umid}|#`]),
      dialogVisible: ref(false),
    });
  },
});
</script>

<style lang="scss">
.timetable-item {
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  .timetable-item-single, .timetable-item-multiple {
    height: 100%;
  }

  &.timetable-item--hidden {
    opacity: 15%;
  }
}

.timetable-item__dialog .q-dialog__inner {
  padding: 16px 8px;
}
</style>
