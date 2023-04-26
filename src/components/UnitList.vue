<template>
  <q-card class="unit-list">
    <q-list
      dense
      separator
    >
      <q-item
        v-for="item in items"
        :key="item.unit"
        :to="item.to"
      >
        <q-item-section>{{ item.name }}</q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { UnitListItem } from 'src/api/client.js';
import { PropType } from 'vue/dist/vue';
import { useRoute } from 'vue-router';
import { UnitType } from 'src/api/common.js';
import { paramNames } from 'src/router/route-constants';

export default defineComponent({
  props: {
    units: {
      type: Array as PropType<UnitListItem[]>,
      required: true,
    },
    unitType: {
      type: String as PropType<UnitType>,
      required: true,
    },
  },
  setup: (props) => {
    const route = useRoute();
    return ({
      items: computed(() => props.units.map((unit) => ({
        ...unit,
        to: {
          name: 'UnitTimetable',
          params: {
            ...route.params,
            [paramNames.unitType]: props.unitType,
            [paramNames.unit]: unit.unit,
          },
        },
      }))),
    });
  },
});
</script>

<style lang="scss">
.unit-list {
  min-width: min(300px, 100%);
}
</style>
