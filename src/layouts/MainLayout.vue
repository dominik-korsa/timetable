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
          @click="goBackClick"
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

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { pickParams, routeNames } from 'src/router/route-constants';
import ThemePickerButton from 'components/ThemePickerButton.vue';
import { goBack } from 'src/shared';

const route = useRoute();
const router = useRouter();

const elevateHeader = ref(false);
const onVScroll = (pos: number) => {
  elevateHeader.value = pos > 0;
};
const showBack = computed(() => _.last(route.matched)?.name !== routeNames.home);
const title = computed(() => _.last(route.matched)?.meta?.title);
const goBackClick = () => {
  const backTo = (route.name === routeNames.schoolHome || route.name === routeNames.superSecretSettings)
    ? { name: routeNames.home }
    : {
      name: routeNames.schoolHome,
      params: pickParams(route, 'tri'),
    };
  goBack(router, backTo);
};
</script>
