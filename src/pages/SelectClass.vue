<template>
  <q-page
    padding
    class="column content-center justify-center"
  >
    <q-spinner
      v-if="classGroups === null"
      color="primary"
      size="64px"
    />
    <div
      v-else
      class="select-class__items-wrapper"
    >
      <q-resize-observer @resize="containerWidth = $event.width" />
      <div class="select-class__items">
        <select-class-group
          v-for="(items, i) in classGroups"
          :key="i"
          :items="items"
          :container-width="containerWidth"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useQuasar } from 'quasar';
import { CacheMode } from 'src/api/requests';
import { DefaultsMap } from 'src/utils';
import _ from 'lodash';
import { useConfigStore } from 'stores/config';
import SelectClassGroup from 'components/SelectClassGroup.vue';
import { useClientRef } from 'src/api/client';

interface ClassItem {
  value: string;
  name: string;
  to: RouteLocationRaw;
}

const classDigitRegex = /^\d+/;

export default defineComponent({
  name: 'SelectClass',
  components: { SelectClassGroup },
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();
    const containerWidth = ref(100);
    const clientRef = useClientRef();

    const classItems = ref<ClassItem[] | null>(null);
    watch(() => clientRef.value, async (client) => {
      classItems.value = null;
      if (client === undefined) return;
      try {
        const newClassItems = await client.getClassList(CacheMode.LazyUpdate);
        classItems.value = newClassItems.map((item) => ({
          ...item,
          to: {
            name: 'UnitTimetable',
            params: {
              tri: client.tri,
              unitType: 'class',
              unit: item.value,
            },
          },
        }));
        if (client.type === 'optivum') {
          config.addHistoryEntry({
            title: await client.getTitle(CacheMode.CacheFirst),
            baseUrl: client.baseUrl,
            listPath: client.listPath,
          });
        }
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: 'Nie udało się wczytać listy klas',
        });
      }
    }, {
      immediate: true,
    });

    return {
      containerWidth,
      classItems,
      classGroups: computed(() => {
        if (classItems.value === null) return null;
        const favourites = clientRef.value === undefined
          ? new Set()
          : new Set(config.favouriteUnits[clientRef.value.tri]?.map(({ unitType, unit }) => `${unitType}|${unit}`) ?? []);
        const classItemsCopy = classItems.value.map((item) => ({
          ...item,
          isFavourite: favourites.has(`class|${item.value}`),
        }));
        const groups = new DefaultsMap<number, ClassItem[]>(() => []);
        const remaining: ClassItem[] = [];
        classItemsCopy.forEach((item) => {
          const result = classDigitRegex.exec(item.name);
          if (result === null) remaining.push(item);
          else groups.get(parseInt(result[0], 10)).push(item);
        });
        const groupArray = _.sortBy(Array.from(groups.entries()), 0).map(([, v]) => v);
        return [
          ...groupArray,
          remaining,
        ];
      }),
    };
  },
});
</script>

<style lang="scss">
.select-class__items-wrapper {
  width: 100%;
  max-width: 600px;

  .select-class__items {
    margin: 0 auto;
    width: fit-content;
  }
}
</style>
