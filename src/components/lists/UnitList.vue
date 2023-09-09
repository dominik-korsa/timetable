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
    class="column"
  >
    <q-input
      v-model="searchValue"
      borderless
      class="q-px-md border-b"
      :placeholder="searchMessage"
      clearable
      @clear="searchValue = ''"
      @keydown.esc="searchValue = ''"
    >
      <template #append>
        <q-icon
          v-if="searchValue === ''"
          name="search"
        />
      </template>
    </q-input>
    <div
      v-if="filteredItems.length === 0"
      class="q-pa-md text-reduced text-center"
    >
      Brak wyników
    </div>
    <q-list
      v-else
      dense
      separator
      class="row-fill overflow-auto"
    >
      <q-item
        v-for="item in filteredItems"
        :key="item.unit"
        :to="item.to"
      >
        <q-item-section>{{ item.name }}</q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { UnitListItem } from 'src/api/client';
import { useRoute } from 'vue-router';
import { paramNames, pickParams, routeNames } from 'src/router/route-constants';
import _ from 'lodash';

const props = defineProps<{
  units: UnitListItem[];
  unitType: 'teacher' | 'room';
}>();

const searchValue = ref('');

const emptyMessage = computed(
  () => `Ta szkoła nie udostępnia planów ${props.unitType === 'teacher' ? 'nauczycieli' : 'sal'}`,
);
const searchMessage = computed(
  () => `Wyszukaj ${props.unitType === 'teacher' ? 'nauczyciela' : 'salę'}`,
);

const route = useRoute();
const items = computed(() => props.units.map((unit) => ({
  ...unit,
  to: {
    name: routeNames.unitTimetable,
    params: {
      ...pickParams(route, 'tri'),
      [paramNames.unitType]: props.unitType,
      [paramNames.unit]: unit.unit,
    },
  },
  searchText: unit.name.toLocaleLowerCase('pl').replaceAll(/\s/g, ''),
})));

const filteredItems = computed(() => {
  // TODO: Implement better search for teachers, taking into account initials
  const parts = searchValue.value
    .split(/\s/)
    .map((part) => part.toLocaleLowerCase('pl').trim())
    .filter((part) => part !== '');
  if (parts.length === 0) return items.value;
  let highestMatchCount = 1;
  return _.orderBy(
    items.value.map((item) => {
      const matchCount = parts.filter((part) => item.searchText.includes(part)).length;
      if (matchCount > highestMatchCount) highestMatchCount = matchCount;
      return ({
        ...item,
        matchCount,
      });
    }),
    ['matchCount'],
    ['desc'],
  )
    .filter(({ matchCount }) => matchCount * 2 >= highestMatchCount);
});
</script>
