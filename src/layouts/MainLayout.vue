<template>
  <q-layout
    v-scroll="onVScroll"
    view="hHh LpR lfr"
  >
    <q-header
      class="text-black bg-white"
      :bordered="elevateHeader"
    >
      <q-toolbar>
        <q-btn
          v-if="showBack"
          flat
          round
          icon="arrow_back"
          @click="goBack"
        />

        <q-toolbar-title v-if="title">
          {{ title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';

export default defineComponent({
  name: 'MainLayout',
  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const elevateHeader = ref(false);
    return {
      onVScroll: (pos: number) => {
        elevateHeader.value = pos > 0;
      },
      showBack: computed(() => _.last(route.matched)?.name !== 'Home'),
      title: computed(() => _.last(route.matched)?.meta?.title),
      goBack: () => {
        const backTo = { name: 'Home' };
        const resolved = router.resolve(backTo);
        if (resolved.href === window.history.state.back) router.back();
        else router.push(backTo);
      },
      elevateHeader,
    };
  },
});
</script>
