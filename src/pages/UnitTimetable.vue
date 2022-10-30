<template>
  <timetable-layout
    :title="data?.unitName ?? null"
    :has-data="data !== null"
    :is-loading="isLoading"
    :offset="offset"
    :error-message="errorMessage"
    @retry-load="retryLoad"
  >
    <template #default="{ changeOffset }">
      <timetable-grid
        :data="data"
        :is-current-week="offset?.isCurrentWeek ?? true"
        :change-offset="changeOffset"
      />
    </template>
    <template #menu>
      <q-item
        clickable
        class="non-selectable"
        @click="onFavouriteToggle"
      >
        <q-item-section side>
          <q-icon
            :name="isFavourite ? 'star' : 'star_border'"
            :color="isFavourite ? 'amber' : undefined"
          />
        </q-item-section>
        <q-item-section>
          {{ isFavourite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych' }}
        </q-item-section>
      </q-item>
      <q-item
        clickable
        class="non-selectable standalone"
        @click="onStartupToggle"
      >
        <q-item-section side>
          <q-icon
            name="bolt"
            :color="isStartupTable ? 'primary' : undefined"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Otwieraj przy starcie</q-item-label>
          <q-item-label
            v-if="isStartupTable"
            caption
            class="text-primary"
          >
            Włączono
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </timetable-layout>
</template>

<script lang="ts">
import { TableDataWithHours, UnitType } from 'src/api/common';
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { NotInCacheError } from 'src/api/requests';
import TimetableGrid from 'components/TimetableGrid.vue';
import { useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';
import { Client, useClientRef } from 'src/api/client';
import { useOffset } from 'src/shared';
import TimetableLayout from 'layouts/TimetableLayout.vue';

interface TableRef {
  client: Client;
  offset: number;
  unitType: UnitType;
  unit: string;
}

export default defineComponent({
  name: 'UnitTimetable',
  components: { TimetableLayout, TimetableGrid },
  setup: () => {
    const route = useRoute();
    const quasar = useQuasar();
    const config = useConfigStore();
    const clientRef = useClientRef();

    const data = ref<TableDataWithHours | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);

    let refreshId = 0;

    const offset = computed(() => {
      if (clientRef.value !== undefined && clientRef.value.supportsOffsets) return useOffset();
      return null;
    });
    onBeforeRouteLeave(() => { offset.value?.reset(); });

    const tableRef = computed<TableRef | null>(() => {
      if (
        clientRef.value === undefined
        || route.params.unitType === undefined
        || route.params.unit === undefined
      ) return null;
      return ({
        client: clientRef.value,
        offset: offset.value?.current ?? 0,
        unitType: route.params.unitType as UnitType,
        unit: route.params.unit as string,
      });
    });

    const attemptLoad = async (
      loadedTableRef: TableRef,
      fromCache: boolean,
    ): Promise<TableDataWithHours> => loadedTableRef.client.getLessons(
      fromCache,
      loadedTableRef.unitType,
      loadedTableRef.unit,
      loadedTableRef.offset,
    );

    watch(
      tableRef,
      async (value) => {
        if (value === null) return;

        isLoading.value = true;
        refreshId += 1;
        const currId = refreshId;
        const clearTimeoutId = setTimeout(() => {
          if (currId !== refreshId) return;
          data.value = null;
        }, 750);
        errorMessage.value = null;

        let cacheFailed = false;
        try {
          const cachedData = await attemptLoad(value, true);
          if (currId !== refreshId) return;
          data.value = cachedData;
          clearTimeout(clearTimeoutId);
        } catch (error) {
          cacheFailed = true;
          if (!(error instanceof NotInCacheError)) console.warn(error);
        }

        try {
          const networkData = await attemptLoad(value, false);
          if (currId !== refreshId) return;
          clearTimeout(clearTimeoutId);
          data.value = networkData;
        } catch (error) {
          console.error(error);
          clearTimeout(clearTimeoutId);
          if (currId !== refreshId) return;
          if (cacheFailed) errorMessage.value = 'Nie udało się wczytać planu lekcji';
          else {
            quasar.notify({
              type: 'negative',
              message: 'Nie udało się wczytać aktualnego planu lekcji, wyświetlanie zapisanej wersji',
            });
          }
        }
        isLoading.value = false;
      },
      { immediate: true },
    );

    const retryLoad = async () => {
      if (tableRef.value === null) return;
      data.value = null;
      errorMessage.value = null;
      try {
        data.value = await attemptLoad(tableRef.value, false);
      } catch (error) {
        console.error(error);
        errorMessage.value = 'Nie udało się wczytać planu lekcji';
      }
    };

    const isFavourite = computed(() => {
      if (tableRef.value === null) return false;
      const { client, unitType, unit } = tableRef.value;
      return config.favouriteUnits[client.tri]
        ?.some((item) => item.unitType === unitType && item.unit === unit)
        ?? false;
    });
    const isStartupTable = computed(
      () => config.startupUnit !== null
        && tableRef.value !== null
        && config.startupUnit.tri === tableRef.value?.client.tri
        && config.startupUnit.unitType === tableRef.value.unitType
        && config.startupUnit.unit === tableRef.value.unit,
    );

    return {
      data,
      errorMessage,
      retryLoad,
      offset,
      isFavourite,
      onFavouriteToggle: () => {
        if (!tableRef.value) return;
        if (isFavourite.value) {
          config.removeFavouriteTable(
            tableRef.value.client.tri,
            tableRef.value.unitType,
            tableRef.value.unit,
          );
        } else {
          config.addFavouriteTable(
            tableRef.value.client.tri,
            tableRef.value.unitType,
            tableRef.value.unit,
          );
        }
      },
      isStartupTable,
      onStartupToggle: () => {
        if (!tableRef.value) return;
        config.setStartupTable(isStartupTable.value ? null : {
          tri: tableRef.value.client.tri,
          unitType: tableRef.value.unitType,
          unit: tableRef.value.unit,
        });
      },
      isLoading,
    };
  },
});
</script>