<template>
  <div
    v-memo="groups"
    class="class-list"
  >
    <q-card
      v-for="group in groups"
      :key="group.key"
      class="class-list__group overflow-hidden"
      bordered
      flat
    >
      <div
        v-for="(row, i) in group.rows"
        :key="i"
        class="class-list__row row"
      >
        <q-btn
          v-for="item in row"
          :key="item.unit"
          stretch
          flat
          size="md"
          class="class-list__button col-fill"
          :to="item.to"
          no-caps
          :aria-label="`Klasa ${item.name}`"
        >
          {{ item.name }}
          <div
            v-if="item.isFavourite"
            aria-label="Ulubiona"
            class="class-list__favourite"
          />
        </q-btn>
      </div>
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { UnitListItem } from 'src/api/client';
import { computed } from 'vue';
import { chunkBalanced, DefaultsMap } from 'src/utils';
import _ from 'lodash';
import { useIsFavourite } from 'src/shared';
import { routeNames } from 'src/router/route-constants';

const props = defineProps<{
  items: UnitListItem[];
}>();

const classDigitRegex = /^\d+/;

const isFavourite = useIsFavourite();

const groups = computed(() => {
  const classItems = props.items.map((item) => ({
    ...item,
    isFavourite: isFavourite.value('class', item.unit),
    to: {
      name: routeNames.unitTimetable,
      params: {
        unitType: 'class',
        unit: item.unit,
      },
    },
  }));
  const groupMap = new DefaultsMap<number, UnitListItem[]>(() => []);
  const remaining: UnitListItem[] = [];
  classItems.forEach((item) => {
    const result = classDigitRegex.exec(item.name);
    if (result === null) remaining.push(item);
    else groupMap.get(parseInt(result[0], 10)).push(item);
  });
  const groupArray = _.sortBy([...groupMap.entries()], 0);
  if (remaining.length > 0) groupArray.push([-1, remaining]);
  return groupArray.map(([key, items]) => ({
    key,
    rows: chunkBalanced(items, 5),
  }));
});
</script>

<style lang="scss">
.class-list {
  .class-list__group:not(:last-child) {
    margin-bottom: 16px;
  }

  .class-list__row {
    &:not(:last-child) {
      border-bottom: 1px solid var(--separator-color);
    }
  }

  .class-list__button {
    position: relative;
    overflow: hidden;

    &:not(:last-child) {
      border-right: 1px solid var(--separator-color);
    }

    &:before {
      z-index: 1;
    }

    .class-list__favourite {
      position: absolute;
      top: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: linear-gradient(45deg, transparent 50%, $amber-7 50%);
    }
  }
}
</style>
