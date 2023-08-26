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
      <q-page
        v-if="data === null"
        padding
        class="column content-center justify-center"
      >
        <template v-if="errorMessage !== null">
          <div class="text-center">
            {{ errorMessage }}
          </div>
        </template>
        <q-spinner
          v-else
          color="primary"
          size="64px"
        />
      </q-page>
      <school-home-desktop
        v-else-if="!mobile"
        :data="data"
        :is-v-lo="isVLo"
      />
      <school-home-mobile
        v-else
        v-model="tab"
        :data="data"
        :is-v-lo="isVLo"
      />
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
import SchoolHomeMobile from 'pages/school-home/SchoolHomeMobile.vue';

const quasar = useQuasar();
const config = useConfigStore();
const clientRef = useClientRef();
const router = useRouter();

const mobile = computed(() => quasar.screen.width < 900);
const tab = ref('classes');

export interface Data {
  classes: UnitListItem[];
  teachers?: UnitListItem[];
  rooms?: UnitListItem[];
}

const errorMessage = ref<string | null>(null);
const data = ref<Data | null>(null);
watch(() => clientRef.value, async (client) => {
  data.value = null;
  if (client === undefined) return;
  errorMessage.value = null;
  try {
    // TODO: When new API is implemented, the failure to load a timetable version
    // should still allow to display school info
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
    errorMessage.value = 'Nie udało się wczytać listy klas';
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
