<template>
  <q-layout view="hHh LpR lfr">
    <q-header
      class="text-black bg-white"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="goBack"
        />

        <q-toolbar-title>
          <q-skeleton
            v-if="data === null"
            type="text"
            width="35px"
          />
          <template v-else>
            {{ data.className }}
          </template>
        </q-toolbar-title>

        <q-space />

        <template v-if="showOffsetPicker">
          <q-btn
            icon="navigate_before"
            flat
            round
            :disable="vLoOffset <= -5"
            @click="vLoOffset -= 1"
          />
          <q-btn
            color="primary"
            outline
            class="q-mx-xs"
            :disable="vLoOffset === 0"
            @click="vLoOffset = 0"
          >
            Dzisiaj
          </q-btn>
          <q-btn
            icon="navigate_next"
            flat
            round
            :disable="vLoOffset >= 5"
            @click="vLoOffset += 1"
          />
        </template>
      </q-toolbar>
    </q-header>

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
          <q-btn
            color="primary"
            class="q-mt-md"
            @click="retryLoad"
          >
            Spróbuj ponownie
          </q-btn>
        </template>
        <q-spinner
          v-else
          color="primary"
          size="64px"
        />
      </q-page>
      <q-page
        v-else
        :style-fn="styleFn"
        class="overflow-hidden"
      >
        <timetable-grid
          v-if="data !== null"
          :data="data"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { TableData } from 'src/api/common';
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadVLoHours, loadVLoLessons } from 'src/api/v-lo';
import { CacheMode, NotInCacheError } from 'src/api/requests';
import TimetableGrid from 'components/TimetableGrid.vue';
import { loadOptivumTable } from 'src/api/optivum';
import { useQuasar } from 'quasar';

interface TableRefVLo {
  classValue: string;
  offset: number;
  baseUrl: undefined,
}

interface TableRefOptivum {
  classValue: string,
  baseUrl: string;
}

type TableRef = TableRefVLo | TableRefOptivum;

export default defineComponent({
  name: 'ClassTimetable',
  components: { TimetableGrid },
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const quasar = useQuasar();

    const data = ref<TableData | null>(null);
    const errorMessage = ref<string | null>(null);

    let refreshId = 0;

    const vLoOffset = ref(0);
    const tableRef = computed<TableRef | null>(() => {
      if (route.params.class === undefined) return null;
      if (route.params.url === undefined) {
        return {
          classValue: route.params.class as string,
          offset: vLoOffset.value,
        };
      }
      return {
        classValue: route.params.class as string,
        baseUrl: route.params.url as string,
      };
    });

    const attemptLoad = async (
      loadedTableRef: TableRef,
      cacheMode: CacheMode,
    ): Promise<TableData> => {
      if (loadedTableRef.baseUrl === undefined) {
        const [hours, days] = await Promise.all([
          loadVLoHours(cacheMode),
          loadVLoLessons(cacheMode, loadedTableRef.classValue, loadedTableRef.offset),
        ]);
        return {
          hours,
          lessons: days.map((day) => day.moments),
          className: loadedTableRef.classValue,
          dates: days.map((day) => day.date),
        };
      }
      return loadOptivumTable(loadedTableRef.baseUrl, loadedTableRef.classValue, cacheMode);
    };

    watch(
      tableRef,
      async (value) => {
        if (value === null) return;

        refreshId += 1;
        const currId = refreshId;
        data.value = null;
        errorMessage.value = null;

        let cacheFailed = false;
        try {
          const cachedData = await attemptLoad(value, CacheMode.CacheOnly);
          if (currId !== refreshId) return;
          data.value = cachedData;
        } catch (error) {
          cacheFailed = true;
          if (!(error instanceof NotInCacheError)) console.warn(error);
        }

        try {
          const networkData = await attemptLoad(value, CacheMode.NetworkOnly);
          if (currId !== refreshId) return;
          data.value = networkData;
        } catch (error) {
          console.error(error);
          if (cacheFailed) errorMessage.value = 'Nie udało się wczytać planu lekcji';
          else {
            quasar.notify({
              type: 'negative',
              message: 'Nie udało się wczytać planu lekcji, wyświetlanie zapisanej wersji',
            });
          }
        }
      },
      { immediate: true },
    );

    const retryLoad = async () => {
      if (tableRef.value === null) return;
      data.value = null;
      errorMessage.value = null;
      try {
        data.value = await attemptLoad(tableRef.value, CacheMode.NetworkOnly);
      } catch (error) {
        console.error(error);
        errorMessage.value = 'Nie udało się wczytać planu lekcji';
      }
    };

    return ({
      data,
      errorMessage,
      retryLoad,
      styleFn: (offset: number, height: number) => ({ height: `${height - offset}px` }),
      goBack: () => {
        const backTo = {
          name: route.params.url === undefined ? 'VLo/SelectClass' : 'Optivum/SelectClass',
          params: route.params,
        };
        const resolved = router.resolve(backTo);
        if (resolved.href === window.history.state.back) router.back();
        else router.push(backTo);
      },
      vLoOffset,
      showOffsetPicker: computed(() => route.params.url === undefined),
    });
  },
});
</script>
