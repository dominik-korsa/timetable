<template>
  <q-page padding>
    <!-- TODO: Add loading indicator -->
    <template v-if="classItems !== null">
      <template
        v-for="item in classItems"
        :key="item.key"
      >
        <router-link
          :to="item.to"
        >
          {{ item.name }}
        </router-link>
        <br>
      </template>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { RouteLocationRaw, RouteParamValue, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { CacheMode } from 'src/api/requests';
import { loadOptivumClassList, loadOptivumTimetable } from 'src/api/optivum';
import { loadVLoClassList } from 'src/api/v-lo';

interface ClassItem {
  key: string;
  name: string;
  to: RouteLocationRaw;
}

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
    };
  },
});
</script>
