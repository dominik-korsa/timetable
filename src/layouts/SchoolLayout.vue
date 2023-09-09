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
        <back-button
          aria-label="Wróć do ekranu głównego"
          :to="backTo"
        />

        <q-space />

        <theme-picker-button />
      </q-toolbar>
    </q-header>
    <template v-else>
      <back-button
        class="fixed z-top school-layout__back"
        aria-label="Wróć do ekranu głównego"
        :to="backTo"
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
        <q-tab
          v-for="(tabProps, i) in tabs"
          :key="i"
          v-bind="tabProps"
          no-caps
          exact
          replace
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import SchoolHomeDesktop from 'pages/school-home/SchoolHomeDesktop.vue';
import { useRouter } from 'vue-router';
import ThemePickerButton from 'components/ThemePickerButton.vue';
import { QRouteTabProps, useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { UnitListItem, useClientRef } from 'src/api/client';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/api/requests';
import { OptivumUnitLists } from 'src/api/optivum';
import SchoolHomeMobile from 'pages/school-home/SchoolHomeMobile.vue';
import { useNavigation } from 'src/router/navigation';
import { paths } from 'src/router/path-builder';
import { UnitType } from 'src/api/common';
import BackButton from 'components/BackButton.vue';

const quasar = useQuasar();
const config = useConfigStore();
const clientRef = useClientRef();
const navigation = useNavigation();
const router = useRouter();

const mobile = computed(() => quasar.screen.width < 900);
const tab = computed({
  get: () => navigation.params.unitType as UnitType,
  set: (value) => {
    if (value === navigation.params.unitType) return;
    // TODO: Use q-router-tab
    router.replace(navigation.triRelative.unitType(value).list);
  },
});

const tabs: QRouteTabProps[] = [
  // {
  //   name: 'school',
  //   label: 'Szkoła',
  //   icon: 'domain',
  // },
  {
    name: 'class',
    label: 'Klasy',
    icon: 'o_school',
  },
  {
    name: 'teacher',
    label: 'Nauczyciele',
    icon: 'o_person',
  },
  {
    name: 'room',
    label: 'Sale',
    icon: 'o_meeting_room',
  },
];

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
const backTo = paths.home;
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
