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
          @click="goBack"
        />

        <q-toolbar-title v-if="title">
          {{ title }}
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
        >
          <q-menu>
            <q-card>
              <q-card-section>
                <theme-picker />
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
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
import ThemePicker from 'components/ThemePicker.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { ThemePicker },
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
