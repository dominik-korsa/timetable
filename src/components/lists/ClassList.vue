<template>
  <div
    v-memo="groups"
    class="q-gutter-md"
  >
    <q-card
      v-for="[key, group] in groups"
      :key="key"
      class="overflow-hidden"
      bordered
      flat
    >
      <button-grid
        :max-items="5"
        :buttons="group"
        balance
        favourite-aria-label="Ulubiona"
      />
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { UnitListItem } from 'src/api/client';
import { computed } from 'vue';
import { DefaultsMap } from 'src/utils';
import _ from 'lodash';
import { useIsFavourite } from 'src/shared';
import { routeNames } from 'src/router/route-constants';
import ButtonGrid, { Button } from 'components/ButtonGrid.vue';

const props = defineProps<{
  items: UnitListItem[];
}>();

const classDigitRegex = /^\d+/;

const isFavourite = useIsFavourite();

const groups = computed(() => {
  const classItems = props.items.map((item): Button => ({
    key: item.unit,
    name: item.name,
    ariaLabel: `Klasa ${item.name}`,
    isFavourite: isFavourite.value('class', item.unit),
    to: {
      name: routeNames.unitTimetable,
      params: {
        unitType: 'class',
        unit: item.unit,
      },
    },
  }));
  const groupMap = new DefaultsMap<number, Button[]>(() => []);
  const remaining: Button[] = [];
  classItems.forEach((item) => {
    const result = classDigitRegex.exec(item.name);
    if (result === null) remaining.push(item);
    else groupMap.get(parseInt(result[0], 10)).push(item);
  });
  const groupArray = _.sortBy([...groupMap.entries()], 0);
  if (remaining.length > 0) groupArray.push([-1, remaining]);
  return groupArray;
  // return groupArray.map(([key, items]) => ({
  //   key,
  //   rows: chunkBalanced(items, 5),
  // }));
});
</script>
