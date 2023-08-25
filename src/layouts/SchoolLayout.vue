<template>
  <q-layout
    view="hHh lpR fFf"
    class="school-layout"
  >
    <q-header
      v-if="mobile"
      class="bg-page text-page"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          icon="arrow_back"
          aria-label="Wróć do ekranu głównego"
          @click="goBackClick"
        />

        <q-space />

        <theme-picker-button />
      </q-toolbar>
    </q-header>
    <template v-else>
      <q-btn
        class="fixed z-top school-layout__back"
        flat
        round
        icon="arrow_back"
        aria-label="Wróć do ekranu głównego"
        @click="goBackClick"
      />
      <theme-picker-button class="fixed z-top school-layout__theme" />
    </template>

    <q-page-container>
      <school-home-desktop
        v-if="!mobile"
        :data="data"
        :is-v-lo="isVLo"
      />
      <q-tab-panels
        v-else
        v-model="tab"
        class="school-layout__mobile"
        swipeable
        animated
      >
        <q-tab-panel
          name="classes"
          class="q-pa-none"
        >
          <q-page
            padding
            class="column q-mx-auto justify-center"
          >
            <class-list
              :items="data?.classes ?? []"
              mobile
              :show-push-banner="isVLo"
            />
          </q-page>
        </q-tab-panel>
        <q-tab-panel
          name="teachers"
          class="q-pa-none"
        >
          <q-page
            padding
            class="column q-mx-auto justify-center"
          >
            <unit-list
              class="row-fill"
              unit-type="teacher"
              :units="data?.teachers ?? []"
            />
          </q-page>
        </q-tab-panel>
        <q-tab-panel
          name="rooms"
          class="q-pa-none"
        >
          <q-page
            padding
            class="column q-mx-auto justify-center"
          >
            <v-lo-map-view
              v-if="isVLo"
              class="row-fill"
              mobile
            />
            <unit-list
              v-else
              class="row-fill"
              unit-type="room"
              :units="data?.rooms ?? []"
            />
          </q-page>
        </q-tab-panel>
      </q-tab-panels>
    </q-page-container>

    <q-footer
      v-if="mobile"
      bordered
      class="bg-page text-page"
    >
      <q-tabs
        v-model="tab"
        active-color="primary"
        dense
      >
        <!--        <q-tab-->
        <!--          label="Szkoła"-->
        <!--          no-caps-->
        <!--          icon="domain"-->
        <!--          name="school"-->
        <!--        />-->
        <q-tab
          label="Klasy"
          no-caps
          icon="school"
          name="classes"
        />
        <q-tab
          label="Nauczyciele"
          no-caps
          icon="person"
          name="teachers"
        />
        <q-tab
          label="Sale"
          no-caps
          icon="meeting_room"
          name="rooms"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import SchoolHomeDesktop from 'pages/school-home/SchoolHomeDesktop.vue';
import { goBack } from 'src/shared';
import { useRouter } from 'vue-router';
import { routeNames } from 'src/router/route-constants';
import ThemePickerButton from 'components/ThemePickerButton.vue';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { UnitListItem, useClientRef } from 'src/api/client';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/api/requests';
import { OptivumUnitLists } from 'src/api/optivum';
import ClassList from 'components/lists/ClassList.vue';
import UnitList from 'components/lists/UnitList.vue';
import VLoMapView from 'components/lists/VLoMapView.vue';

const quasar = useQuasar();
const config = useConfigStore();
const clientRef = useClientRef();
const router = useRouter();

const mobile = computed(() => quasar.screen.width < 900);
const tab = ref('classes');

export interface Data {
  teachers?: UnitListItem[];
  classes?: UnitListItem[];
  rooms?: UnitListItem[];
}

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

const isVLo = computed(() => clientRef.value?.type === 'v-lo');

const goBackClick = () => {
  goBack(router, {
    name: routeNames.home,
  });
};
</script>

<style lang="scss">
.school-layout {
  .school-layout__back {
    left: 12px;
    top: 4px;
  }

  .school-layout__theme {
    right: 12px;
    top: 4px;
  }

  .school-layout__mobile .q-page {
    max-width: 500px;
  }
}
</style>
