<template>
  <q-card
    v-if="items.length === 0"
    flat
    bordered
    class="column items-center justify-center text-center"
  >
    <div class="q-pa-md text-reduced">
      {{ emptyMessage }}
    </div>
  </q-card>
  <q-card
    v-else
    flat
    bordered
    class="overflow-auto"
  >
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

<script lang="ts" setup>
import { computed } from 'vue';
import { UnitListItem } from 'src/api/client';
import { useRoute } from 'vue-router';
import { paramNames, routeNames } from 'src/router/route-constants';

const props = defineProps<{
  units: UnitListItem[];
  unitType: 'teacher' | 'room';
}>();

const emptyMessage = computed(
  () => `Ta szkoła nie udostępnia planów ${props.unitType === 'teacher' ? 'naczycieli' : 'sal'}`,
);

const route = useRoute();
const items = computed(() => props.units.map((unit) => ({
  ...unit,
  to: {
    name: routeNames.unitTimetable,
    params: {
      ...route.params,
      [paramNames.unitType]: props.unitType,
      [paramNames.unit]: unit.unit,
    },
  },
})));
</script>
