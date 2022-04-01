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
      class="select-class__items"
    >
      <div
        v-for="(items, i) in classGroups"
        :key="i"
        class="select-class__items-group"
      >
        <q-btn
          v-for="item in items"
          :key="item.key"
          :to="item.to"
          outline
          no-caps
        >
          {{ item.name }}
        </q-btn>
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

interface ClassItem {
  key: string;
  name: string;
  to: RouteLocationRaw;
}

const classDigitRegex = /^\d+/;
const threeGRegex = /^3\w+g$/;

export default defineComponent({
  name: 'SelectClass',
  setup: () => {
    const route = useRoute();
    const quasar = useQuasar();

    const classItems = ref<ClassItem[] | null>(null);
    watch(() => route.params.url, async (baseUrl?: string | RouteParamValue[]) => {
      if (typeof baseUrl === 'object') [baseUrl] = baseUrl;
      classItems.value = null;
      try {
        let newClassItems: ClassItem[];
        if (baseUrl === undefined) {
          const classList = await loadVLoClassList(CacheMode.LazyUpdate);
          newClassItems = classList.map((value) => ({
            key: value,
            name: value,
            to: {
              name: 'VLo/ClassTimetable',
              params: { class: value },
            },
          }));
        } else {
          const timetable = await loadOptivumTimetable(baseUrl, CacheMode.CacheFirst);
          const classList = await loadOptivumClassList(timetable, CacheMode.LazyUpdate);
          newClassItems = classList.map(({ name, value }) => ({
            key: value,
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
      classItems,
      classGroups: computed(() => {
        if (classItems.value === null) return null;
        const classItemsCopy = [...classItems.value];
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
.select-class__items {
  .select-class__items-group {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;

    .q-btn {
      flex: 1;
    }
  }
}
</style>
