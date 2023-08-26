<template>
  <div class="column">
    <q-card
      v-for="[key, group] in groups"
      :key="key"
      class="overflow-hidden q-mb-md"
      bordered
      flat
    >
      <button-grid
        :max-items="5"
        :buttons="group"
        balance-rows
        favourite-aria-label="Ulubiona"
      />
    </q-card>
    <q-space v-if="!mobile" />
    <q-btn
      no-caps
      :outline="!$q.dark.isActive"
      :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
      class="full-width"
      :to="combinedRoute"
    >
      Zestawienie klas
    </q-btn>
    <push-banner
      v-if="showPushBanner"
      class="q-mt-md"
    />
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
import { useRoute } from 'vue-router';
import PushBanner from 'components/PushBanner.vue';

const props = defineProps<{
  items: UnitListItem[];
  mobile?: boolean;
  showPushBanner?: boolean;
}>();

const classDigitRegex = /^\d+/;

const isFavourite = useIsFavourite();
const route = useRoute();

const groups = computed(() => {
  const classItems = props.items.map((item): Button => {
    const classIsFavourite = isFavourite.value('class', item.unit);
    return ({
      key: item.unit,
      name: item.name,
      ariaLabel: classIsFavourite ? `Ulubiona klasa ${item.name}` : `Klasa ${item.name}`,
      isFavourite: classIsFavourite,
      to: {
        name: routeNames.unitTimetable,
        params: {
          unitType: 'class',
          unit: item.unit,
        },
      },
    });
  });
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

const combinedRoute = computed(() => ({
  name: routeNames.combinedTimetable,
  params: route.params,
}));
</script>
