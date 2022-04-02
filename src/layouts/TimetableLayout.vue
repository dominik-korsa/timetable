<template>
  <q-layout view="hHh LpR lfr">
    <q-header
      class="text-black bg-white"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="goBack"
        />

        <q-toolbar-title>
          Title
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { BackTo } from 'src/router/routes';

export default defineComponent({
  name: 'TimetableLayout',
  setup() {
    const route = useRoute();
    const router = useRouter();

    return {
      goBack: () => {
        const backTo = (_.last(route.matched)?.meta?.backTo as BackTo | undefined)?.(route) ?? { name: 'Home' };
        const resolved = router.resolve(backTo);
        if (resolved.href === window.history.state.back) router.back();
        else router.push(backTo);
      },
    };
  },
});
</script>
