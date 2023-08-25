<template>
  <q-page
    v-if="data === null"
    padding
    class="column content-center justify-center"
  >
    <q-spinner
      color="primary"
      size="64px"
    />
  </q-page>
  <q-page
    v-else
    padding
    class="school-home__content q-mx-auto column no-wrap"
    :style-fn="styleFn"
  >
    <!--    <q-card-->
    <!--      bordered-->
    <!--      flat-->
    <!--      class="q-mb-md"-->
    <!--    >-->
    <!--      <div style="height: 96px" />-->
    <!--    </q-card>-->
    <div class="row school-home__row row-fill">
      <div class="col-fill full-height column no-wrap">
        <h2 class="text-h5 text-center q-mt-none q-mb-md">
          Klasy
        </h2>
        <div class="col-shrink overflow-auto">
          <class-list
            :items="data.classes ?? []"
          />
        </div>
        <q-space />
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
      </div>
      <div class="col-fill full-height column no-wrap">
        <h2 class="text-h5 text-center q-mt-none q-mb-md">
          Nauczyciele
        </h2>
        <unit-list
          class="row-fill"
          unit-type="teacher"
          :units="data?.teachers ?? []"
        />
      </div>
      <div class="col-fill full-height column no-wrap">
        <h2 class="text-h5 text-center q-mt-none q-mb-md">
          Sale
        </h2>
        <div
          v-if="isVLo"
          class="row-fill"
        >
          <v-lo-map-view class="full-height" />
        </div>
        <unit-list
          v-else
          class="row-fill"
          unit-type="room"
          :units="data?.rooms ?? []"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { routeNames } from 'src/router/route-constants';
import PushBanner from 'components/PushBanner.vue';
import VLoMapView from 'components/lists/VLoMapView.vue';
import ClassList from 'components/lists/ClassList.vue';
import UnitList from 'components/lists/UnitList.vue';
import type { Data } from 'layouts/SchoolLayout.vue';

const route = useRoute();

defineProps<{
  data: Data | null;
  isVLo: boolean;
}>();

const combinedRoute = computed(() => ({
  name: routeNames.combinedTimetable,
  params: route.params,
}));
const selectRoomRoute = computed(() => ({
  name: routeNames.selectRoom,
  params: route.params,
}));
const styleFn = (topMargin: number, height: number) => ({ height: `${height - topMargin}px` });
</script>

<style lang="scss">
.school-home__content {
  width: 100%;
  max-width: 1100px;
}

.school-home__row {
  gap: 24px;
}
</style>
