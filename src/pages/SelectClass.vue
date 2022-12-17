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
        <q-btn
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width"
          :to="combinedRoute"
        >
          Zestawienie klas
        </q-btn>
        <q-btn
          v-if="isVlo"
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width q-mt-sm"
          :to="selectRoomRoute"
        >
          <q-badge
            color="red"
            floating
          >
            Nowość!
          </q-badge>
          Mapa pomieszczeń
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { RouteLocationRaw, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { CacheMode } from 'src/api/requests';
import { DefaultsMap } from 'src/utils';
import _ from 'lodash';
import { useConfigStore } from 'stores/config';
import SelectClassGroup from 'components/SelectClassGroup.vue';
import { useClientRef } from 'src/api/client';
import { useIsFavourite } from 'src/shared';

interface ClassItem {
  unit: string;
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
    const clientRef = useClientRef();
    const route = useRoute();
    const isFavourite = useIsFavourite();

    const containerWidth = ref(100);

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
              unit: item.unit,
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
      isVlo: computed(() => clientRef.value?.type === 'v-lo'),
      classGroups: computed(() => {
        if (classItems.value === null) return null;
        const classItemsCopy = classItems.value.map((item) => ({
          ...item,
          isFavourite: isFavourite.value('class', item.unit),
        }));
        const groups = new DefaultsMap<number, ClassItem[]>(() => []);
        const remaining: ClassItem[] = [];
        classItemsCopy.forEach((item) => {
          const result = classDigitRegex.exec(item.name);
          if (result === null) remaining.push(item);
          else groups.get(parseInt(result[0], 10)).push(item);
        });
        const groupArray = _.sortBy(Array.from(groups.entries()), 0).map(([, v]) => v);
        return remaining.length > 0 ? [
          ...groupArray,
          remaining,
        ] : groupArray;
      }),
      combinedRoute: computed(() => ({
        name: 'CombinedTimetable',
        params: route.params,
      })),
      selectRoomRoute: computed(() => ({
        name: 'SelectRoom',
        params: route.params,
      })),
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
