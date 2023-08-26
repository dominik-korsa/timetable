<template>
  <q-layout
    v-scroll="onVScroll"
    view="hHh LpR lfr"
  >
    <q-header
      class="bg-page text-page"
      :bordered="elevateHeader"
    >
      <q-toolbar>
        <q-btn
          v-if="showBack"
          flat
          round
          icon="arrow_back"
          aria-label="Wróć"
          @click="goBack"
        />

        <q-toolbar-title
          v-if="title"
          class="col-grow"
        >
          {{ title }}
        </q-toolbar-title>
        <q-space v-else />

        <theme-picker-button />
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
import { pickParams, routeNames } from 'src/router/route-constants';
import ThemePickerButton from 'components/ThemePickerButton.vue';
import { goBack } from 'src/shared';

export default defineComponent({
  name: 'MainLayout',
  components: { ThemePickerButton },
  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const elevateHeader = ref(false);
    return {
      onVScroll: (pos: number) => {
        elevateHeader.value = pos > 0;
      },
      showBack: computed(() => _.last(route.matched)?.name !== routeNames.home),
      title: computed(() => _.last(route.matched)?.meta?.title),
      goBack: () => {
        const backTo = (route.name === routeNames.schoolHome || route.name === routeNames.superSecretSettings)
          ? { name: routeNames.home }
          : {
            name: routeNames.schoolHome,
            params: pickParams(route, 'tri'),
          };
        goBack(router, backTo);
      },
      elevateHeader,
    };
  },
});
</script>
