<template>
  <div
    class="timetable-item-single"
    :class="{
      'timetable-item-single--removed': lesson.removed,
      'timetable-item-single--small': small,
    }"
  >
    <div class="timetable-item-single__top">
      <div class="timetable-item-single__subject">
        {{ lesson.subjectShort }}
      </div>
      <div
        v-if="unitType === 'room'"
        class="timetable-item-single__class-name"
      >
        {{ classNames }}
      </div>
      <div
        v-else
        class="timetable-item-single__room"
      >
        {{ lesson.room }}
      </div>
    </div>
    <div
      v-if="small"
      class="timetable-item-single__group"
    >
      {{ lesson.group?.name }}
    </div>
    <div class="timetable-item-single__bottom">
      <div
        v-if="!small"
        class="timetable-item-single__group"
      >
        {{ lesson.group?.name }}
      </div>
      <div
        v-if="unitType === 'teacher'"
        class="timetable-item-single__class-name"
      >
        {{ classNames }}
      </div>
      <div
        v-else
        class="timetable-item-single__teacher"
      >
        {{ lesson.teacher }}
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue/dist/vue';
import { computed, defineComponent } from 'vue';
import { useConfigStore } from 'stores/config';
import { withOpacity } from 'src/utils';
import { TableLesson, UnitType } from '../api/common';

export default defineComponent({
  name: 'TimetableItemSingle',
  props: {
    lesson: {
      type: Object as PropType<TableLesson>,
      required: true,
    },
    showColor: Boolean,
    small: Boolean,
    unitType: {
      type: String as PropType<UnitType>,
      required: true,
    },
  },
  setup: (props) => {
    const config = useConfigStore();
    return ({
      classNames: computed(() => props.lesson.classes.map((e) => e.name).join(', ')),
      background: computed(
        () => (props.showColor && config.showColors && props.lesson.color
          ? withOpacity(props.lesson.color, 45)
          : 'transparent'),
      ),
    });
  },
});
</script>

<style lang="scss">
.timetable-item-single {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.75rem;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  background: v-bind(background);

  .timetable-item-single__top {
    padding-top: 4px;
    flex-grow: 1;
  }

  .timetable-item-single__bottom {
    padding-bottom: 4px;
  }

  .timetable-item-single__top, .timetable-item-single__bottom {
    display: flex;
    justify-content: space-between;
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
    padding-left: 4px;
    padding-right: 4px;
  }

  .timetable-item-single__subject {
    text-align: left;
    font-weight: 500;
    font-size: 1.2em;
    flex-grow: 1;
  }

  .timetable-item-single__room {
    text-align: right;
    margin-left: 4px;
    flex-shrink: 0;
    flex-grow: 1;
  }

  .timetable-item-single__group {
    text-align: left;
    flex-shrink: 0;
    font-style: italic;
    padding-right: 2px;
  }

  .timetable-item-single__teacher {
    text-align: right;
    padding-left: 2px;
    font-weight: 300;
  }

  .timetable-item-single__class-name {
    padding-left: 2px;
    font-size: 1.2em;
  }

  .timetable-item-single__subject, .timetable-item-single__room,
  .timetable-item-single__group, .timetable-item-single__teacher {
    overflow-x: hidden;
    overflow-y: clip;
    text-overflow: ellipsis;
  }

  &.timetable-item-single--removed {
    background: repeating-linear-gradient(
        -60deg,
        #00000009 0 10px,
        #00000018 10px 15px
    );
    color: #00000088;

    .timetable-item-single__subject {
      text-decoration: line-through 1.5px;
    }
  }

  &.timetable-item-single--small {
    font-size: 0.5rem;

    .timetable-item-single__top {
      padding-top: 2px;
      padding-left: 2px;
      padding-right: 2px;
    }

    .timetable-item-single__bottom {
      padding-left: 2px;
      padding-right: 0;
      padding-bottom: 0;
    }

    .timetable-item-single__room {
      font-size: 1.3em;
      flex-basis: fit-content;
      flex-shrink: 0;
    }

    .timetable-item-single__group {
      text-align: center;
      padding-left: 2px;
      padding-right: 2px;
    }

    .timetable-item-single__teacher {
      flex-grow: 1;
      padding-bottom: 2px;
      text-align: left;
    }
  }
}

body.body--dark .timetable-item-single.timetable-item-single--removed {
  background: repeating-linear-gradient(
    -60deg,
    #ffffff09 0 10px,
    #ffffff20 10px 15px
  );
  color: #ffffff88;
}
</style>
