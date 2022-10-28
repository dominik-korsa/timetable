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
import { RouteLocationRaw, RouteParamValue, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { CacheMode } from 'src/api/requests';
import { loadOptivumClassList, loadOptivumTimetable } from 'src/api/optivum';
import { loadVLoClassList } from 'src/api/v-lo';
import { DefaultsMap } from 'src/utils';
import _ from 'lodash';
import { useConfigStore } from 'stores/config';
import SelectClassGroup from 'components/SelectClassGroup.vue';

interface ClassItem {
  value: string;
  name: string;
  to: RouteLocationRaw;
}

const classDigitRegex = /^\d+/;
const threeGRegex = /^3\w+g$/;

export default defineComponent({
  name: 'SelectClass',
  components: { SelectClassGroup },
  setup: () => {
    const route = useRoute();
    const quasar = useQuasar();
    const config = useConfigStore();
    const containerWidth = ref(100);

    const classItems = ref<ClassItem[] | null>(null);
    watch(() => route.params.url, async (baseUrl?: string | RouteParamValue[]) => {
      if (typeof baseUrl === 'object') [baseUrl] = baseUrl;
      classItems.value = null;
      try {
        let newClassItems: ClassItem[];
        if (baseUrl === undefined) {
          const classList = await loadVLoClassList(CacheMode.LazyUpdate);
          newClassItems = classList.map((value) => ({
            value,
            name: value,
            to: {
              name: 'VLo/ClassTimetable',
              params: { class: value },
            },
          }));
        } else {
          const timetable = await loadOptivumTimetable(baseUrl, CacheMode.CacheFirst);
          config.addHistoryEntry(timetable);
          const classList = await loadOptivumClassList(timetable, CacheMode.LazyUpdate);
          newClassItems = classList.map(({ name, value }) => ({
            value,
            name,
            to: {
              name: 'Optivum/ClassTimetable',
              params: { url: baseUrl, class: value },
            },
          }));
        }
        if (baseUrl === route.params.url) classItems.value = newClassItems;
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
        let baseUrl = route.params.url;
        if (typeof baseUrl === 'object') [baseUrl] = baseUrl;
        const favourites = new Set(config.favouriteTables[baseUrl ?? 'v-lo']);
        const classItemsCopy = classItems.value.map((item) => ({
          ...item,
          isFavourite: favourites.has(item.value),
        }));
        const groups = new DefaultsMap<number, ClassItem[]>(() => []);
        // Special case for third classes in V LO
        const remaining = route.params.url === undefined
          ? _.remove(classItemsCopy, (item) => threeGRegex.test(item.name))
          : [];
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
