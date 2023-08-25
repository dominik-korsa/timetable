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
          v-if="isVlo"
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
        <q-card
          v-if="isVlo"
          flat
          bordered
          class="row-fill"
        >
          <v-lo-map-view class="full-height" />
        </q-card>
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

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { CacheMode } from 'src/api/requests';
import { useConfigStore } from 'stores/config';
import { UnitListItem, useClientRef } from 'src/api/client';
import { OptivumUnitLists } from 'src/api/optivum';
import { routeNames } from 'src/router/route-constants';
import PushBanner from 'components/PushBanner.vue';
import VLoMapView from 'components/lists/VLoMapView.vue';
import ClassList from 'components/lists/ClassList.vue';
import UnitList from 'components/UnitList.vue';

interface Data {
  teachers?: UnitListItem[];
  classes?: UnitListItem[];
  rooms?: UnitListItem[];
}

export default defineComponent({
  name: 'SelectClass',
  components: {
    UnitList,
    ClassList,
    VLoMapView,
    PushBanner,
  },
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();
    const clientRef = useClientRef();
    const route = useRoute();

    const containerWidth = ref(100);

    const data = ref<Data | null>(null);
    watch(() => clientRef.value, async (client) => {
      data.value = null;
      if (client === undefined) return;
      try {
        const unitLists = await client.getUnitLists(CacheMode.LazyUpdate);
        data.value = {
          classes: unitLists.classes,
          teachers: unitLists.teachers,
          rooms: unitLists.rooms,
        };
        if (client.type === 'optivum') {
          config.addHistoryEntry({
            title: await client.getTitle(CacheMode.CacheFirst),
            baseUrl: client.baseUrl,
            listPath: client.listPath,
          }, (unitLists as OptivumUnitLists).logoSrc);
        }
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
      containerWidth,
      data,
      isVlo: computed(() => clientRef.value?.type === 'v-lo'),
      combinedRoute: computed(() => ({
        name: routeNames.combinedTimetable,
        params: route.params,
      })),
      selectRoomRoute: computed(() => ({
        name: routeNames.selectRoom,
        params: route.params,
      })),
      styleFn: (topMargin: number, height: number) => ({ height: `${height - topMargin}px` }),
    };
  },
});
</script>

<style lang="scss">
.school-home__content {
  width: 100%;
  max-width: 1100px;
}

.school-home__row {
  gap: 16px;
}
</style>
