<template>
  <q-page class="class-timetable">
    <!-- TODO: Add progress indicator -->
    <timetable-grid
      v-if="data !== null"
      :data="data"
    />
  </q-page>
</template>

<script lang="ts">
import { TableData } from 'src/api/common';
import {
  defineComponent, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { loadVLoHours } from 'src/api/v-lo';
import { CacheMode } from 'src/api/requests';
import TimetableGrid from 'components/TimetableGrid.vue';

export default defineComponent({
  name: 'ClassTimetable',
  components: { TimetableGrid },
  setup: () => {
    const route = useRoute();

    const data = ref<TableData | null>(null);

    let refreshId = 0;
    watch(() => ({
      url: route.params.url,
      class: route.params.class,
    } as {
      url: string | undefined,
      class: string,
    }), async ({ url, class: classCode }) => {
      refreshId += 1;
      const currId = refreshId;
      data.value = null;
      if (url === undefined) {
        const hours = await loadVLoHours(CacheMode.LazyUpdate);
        if (currId !== refreshId) return;
        data.value = {
          hours,
        };
        // TODO: Implement network
      } else {
        // TODO: Implement Optivum
      }
    }, { immediate: true });

    return ({
      data,
    });
  },
});
</script>

<style lang="scss">
.class-timetable {
  display: flex;
  flex-direction: row;
}
</style>
