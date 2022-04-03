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

        <div
          v-if="showOffsetPicker"
          v-touch-swipe.horizontal="onOffsetSwipe"
          class="row items-center self-stretch"
        >
          <q-btn
            icon="navigate_before"
            flat
            round
            :color="offsetChangeDisabled.down ? 'grey' : 'primary'"
            :disable="offsetChangeDisabled.down"
            :dense="$q.screen.lt.sm"
            @click="vLoOffset -= 1"
          />
          <q-btn
            :color="vLoOffset === todayOffset ? 'grey' : 'primary'"
            outline
            class="q-mx-xs"
            :disable="vLoOffset === todayOffset"
            :dense="$q.screen.lt.sm"
            @click="vLoOffset = todayOffset"
          >
            Dzisiaj
          </q-btn>
          <q-btn
            icon="navigate_next"
            flat
            round
            :color="offsetChangeDisabled.up ? 'grey' : 'primary'"
            :disable="offsetChangeDisabled.up"
            :dense="$q.screen.lt.sm"
            @click="vLoOffset += 1"
          />
        </div>
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

    const todayOffset = computed(() => ([0, 6].includes(new Date().getDay()) ? 1 : 0));
    const vLoOffset = ref(todayOffset.value);
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

    const offsetChangeDisabled = computed(() => ({
      down: vLoOffset.value <= -5,
      up: vLoOffset.value >= 5,
    }));
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
      todayOffset,
      showOffsetPicker: computed(() => route.params.url === undefined),
      offsetChangeDisabled,
      onOffsetSwipe: (event: { direction: 'left' | 'right' }) => {
        if (event.direction === 'left' && !offsetChangeDisabled.value.down) vLoOffset.value -= 1;
        if (event.direction === 'right' && !offsetChangeDisabled.value.up) vLoOffset.value += 1;
      },
    });
  },
});
</script>
