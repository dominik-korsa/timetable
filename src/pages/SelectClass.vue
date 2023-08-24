<template>
  <q-page
    padding
    class="column content-center justify-center"
  >
    <q-spinner
      v-if="data === null"
      color="primary"
      size="64px"
    />
    <div
      v-else
      class="select-class__items-wrapper"
    >
      <div class="select-class__items">
        <class-list
          :items="data.classes"
        />
        <q-btn
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width"
          :to="combinedRoute"
        >
          Zestawienie klas
        </q-btn>
        <q-btn
          v-if="data?.teachers"
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width"
          @click="teacherDialogVisible = true"
        >
          Nauczyciele
        </q-btn>
        <q-btn
          v-if="data?.rooms"
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width"
          @click="roomDialogVisible = true"
        >
          Sale
        </q-btn>
        <q-btn
          v-if="isVlo"
          no-caps
          :outline="!$q.dark.isActive"
          :color="$q.dark.isActive ? 'indigo-9' : 'primary'"
          class="full-width"
          :to="selectRoomRoute"
        >
          Mapa pomieszczeń
        </q-btn>
        <push-banner v-if="isVlo" />
      </div>
    </div>
  </q-page>
  <q-dialog
    v-if="data?.teachers"
    v-model="teacherDialogVisible"
  >
    <unit-list
      unit-type="teacher"
      :units="data.teachers"
    />
  </q-dialog>
  <q-dialog
    v-if="data?.rooms"
    v-model="roomDialogVisible"
  >
    <unit-list
      unit-type="room"
      :units="data.rooms"
    />
  </q-dialog>
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
import UnitList from 'components/UnitList.vue';
import PushBanner from 'components/PushBanner.vue';
import { routeNames } from 'src/router/route-constants';
import ClassList from 'components/lists/ClassList.vue';

interface Data {
  classes: UnitListItem[];
  teachers?: UnitListItem[];
  rooms?: UnitListItem[];
}

export default defineComponent({
  name: 'SelectClass',
  components: { ClassList, PushBanner, UnitList },
  setup: () => {
    const quasar = useQuasar();
    const config = useConfigStore();
    const clientRef = useClientRef();
    const route = useRoute();

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
      teacherDialogVisible: ref(false),
      roomDialogVisible: ref(false),
    };
  },
});
</script>

<style lang="scss">
.select-class__items-wrapper {
  width: 100%;
  max-width: 600px;

  .select-class__items {
    margin: 0 auto;
    width: fit-content;

    > .q-btn:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}
</style>
