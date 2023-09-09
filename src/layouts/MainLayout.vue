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
        <back-button
          v-if="backTo !== null"
          :to="backTo"
          aria-label="Wróć"
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
import { useRoute } from 'vue-router';
import _ from 'lodash';
import ThemePickerButton from 'components/ThemePickerButton.vue';
import BackButton from 'components/BackButton.vue';
import { Path } from 'src/router/path-builder';

const route = useRoute();

const elevateHeader = ref(false);
const onVScroll = (pos: number) => {
  elevateHeader.value = pos > 0;
};
const title = computed(() => _.last(route.matched)?.meta?.title);
const backTo = computed(() => (_.last(route.matched)?.meta?.backTo ?? null) as Path | null);
</script>
