<template>
  <q-page
    padding
    class="column q-mx-auto justify-center"
  >
    <div class="col-shrink overflow-auto">
      <class-list
        :items="data?.classes ?? []"
      />
    </div>
    <q-btn
      no-caps
      :outline="!$q.dark.isActive"
      :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
      class="full-width q-mt-md"
      :to="combinedRoute"
    >
      Zestawienie klas
    </q-btn>
    <push-banner
      v-if="isVLo"
      class="q-mt-md"
    />
  </q-page>
</template>
<script setup lang="ts">
import PushBanner from 'components/PushBanner.vue';
import ClassList from 'components/lists/ClassList.vue';
import { computed } from 'vue';
import { routeNames } from 'src/router/route-constants';
import type { Data } from 'layouts/SchoolLayout.vue';
import { useRoute } from 'vue-router';

defineProps<{
  data: Data | null;
  isVLo: boolean;
}>();

const route = useRoute();

const combinedRoute = computed(() => ({
  name: routeNames.combinedTimetable,
  params: route.params,
}));
</script>
