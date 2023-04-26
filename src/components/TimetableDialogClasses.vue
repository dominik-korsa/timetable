<template>
  <div class="timetable-dialog-classes">
    <template
      v-for="({ name, to }, i) in items"
      :key="name"
    >
      <span v-if="i > 0">, </span>
      <router-link
        v-if="to !== undefined"
        :to="to"
      >
        {{ name }}
      </router-link>
      <span v-else>{{ name }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { PropType } from 'vue/dist/vue';
import { TableLessonClass } from 'src/api/common';
import { useRoute } from 'vue-router';
import { paramNames, routeNames } from 'src/router/route-constants';

export default defineComponent({
  props: {
    classes: {
      type: Array as PropType<TableLessonClass[]>,
      required: true,
    },
  },
  setup: (props) => {
    const route = useRoute();
    return ({
      items: computed(() => props.classes.map(({
        name,
        id,
      }) => ({
        name,
        to: id === undefined ? undefined : {
          name: routeNames.unitTimetable,
          params: {
            ...route.params,
            [paramNames.unitType]: 'class',
            [paramNames.unit]: id,
          },
        },
      }))),
    });
  },
});
</script>
