<template>
  <q-layout view="hHh LpR lfr">
    <q-header
      v-touch-swipe.horizontal="onOffsetSwipe"
      class="bg-page text-page"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="goBack"
        />

        <q-toolbar-title class="col-grow">
          <q-skeleton
            v-if="data === null"
            type="text"
            width="35px"
          />
          <template v-else>
            {{ data.className }}
          </template>
        </q-toolbar-title>

        <template v-if="showOffsetPicker">
          <q-btn
            ref="offsetDownButton"
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
            ref="offsetUpButton"
            icon="navigate_next"
            flat
            round
            :color="offsetChangeDisabled.up ? 'grey' : 'primary'"
            :disable="offsetChangeDisabled.up"
            :dense="$q.screen.lt.sm"
            @click="vLoOffset += 1"
          />
        </template>
        <q-btn
          icon="more_vert"
          flat
          round
          class="q-ml-xs"
          :dense="$q.screen.lt.sm"
        >
          <q-menu>
            <q-card class="class-timetable__menu">
              <q-list>
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
                <q-separator />
                <q-item>
                  <q-item-section>
                    <theme-picker />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-menu>
        </q-btn>
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
          :is-current-week="isCurrentWeek"
          :is-loading="isLoading"
        />
      </q-page>
      <q-linear-progress
        v-if="isLoading"
        indeterminate
        color="primary"
        class="class-timetable__progress"
      />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { TableData } from 'src/api/common';
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { loadVLoHours, loadVLoLessons, loadVLoSubstitutions } from 'src/api/v-lo';
import { CacheMode, NotInCacheError } from 'src/api/requests';
import TimetableGrid from 'components/TimetableGrid.vue';
import { loadOptivumTable } from 'src/api/optivum';
import { QBtn, useQuasar } from 'quasar';
import { useConfigStore } from 'stores/config';
import ThemePicker from 'components/ThemePicker.vue';
import { mondayOf } from 'src/date-utils';
import { getDayOffsetSession } from 'src/session';
import { Temporal } from '@js-temporal/polyfill';

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

const shake = (el: Element, reverse: boolean) => {
  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-7px)' },
    { transform: 'translateX(7px)' },
    { transform: 'translateX(0)' },
  ];
  if (reverse) keyframes.reverse();
  el.animate(keyframes, {
    duration: 250,
  });
};

export default defineComponent({
  name: 'ClassTimetable',
  components: { ThemePicker, TimetableGrid },
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const quasar = useQuasar();
    const config = useConfigStore();

    const data = ref<TableData | null>(null);
    const errorMessage = ref<string | null>(null);
    const isLoading = ref(true);

    let refreshId = 0;

    const todayOffset = computed(
      () => ([6, 7].includes(Temporal.Now.plainDateISO().dayOfWeek) ? 1 : 0),
    );
    const vLoOffset = getDayOffsetSession(todayOffset.value);
    onBeforeRouteLeave(() => {
      vLoOffset.value = todayOffset.value;
    });
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
        const monday = mondayOf(Temporal.Now.plainDateISO()).add({ weeks: loadedTableRef.offset });
        const [hours, days, substitutionDays] = await Promise.all([
          loadVLoHours(cacheMode),
          loadVLoLessons(cacheMode, loadedTableRef.classValue, loadedTableRef.offset),
          Promise.all([0, 1, 2, 3, 4].map((value) => loadVLoSubstitutions(
            cacheMode,
            loadedTableRef.classValue,
            monday.add({ days: value }),
          ))),
        ]);
        return {
          hours,
          lessons: days.map((day) => day.moments),
          className: loadedTableRef.classValue,
          headers: days.map((day, dayIndex) => ({
            date: day.date,
            substitutions: substitutionDays[dayIndex],
          })),
        };
      }
      return loadOptivumTable(loadedTableRef.baseUrl, loadedTableRef.classValue, cacheMode);
    };

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
    const showOffsetPicker = computed(() => route.params.url === undefined);
    const offsetDownButton = ref<QBtn>();
    const offsetUpButton = ref<QBtn>();

    const isFavourite = computed(
      () => config.favouriteTables[(route.params.url as string | undefined) ?? 'v-lo']
        ?.includes(route.params.class as string) ?? false,
    );
    const isStartupTable = computed(
      () => config.startupTable !== null
      && config.startupTable.baseUrl === route.params.url
      && config.startupTable.classValue === route.params.class,
    );

    return {
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
      showOffsetPicker,
      offsetChangeDisabled,
      onOffsetSwipe: (event: { direction: 'left' | 'right' }) => {
        if (!showOffsetPicker.value) return;
        if (event.direction === 'right' && !offsetChangeDisabled.value.down) {
          vLoOffset.value -= 1;
          if (offsetDownButton.value) shake(offsetDownButton.value.$el, false);
        }
        if (event.direction === 'left' && !offsetChangeDisabled.value.up) {
          vLoOffset.value += 1;
          if (offsetUpButton.value) shake(offsetUpButton.value.$el, true);
        }
      },
      isFavourite,
      onFavouriteToggle: () => {
        if (isFavourite.value) {
          config.removeFavouriteTable(
            route.params.url as string | undefined,
            route.params.class as string,
          );
        } else {
          config.addFavouriteTable(
            route.params.url as string | undefined,
            route.params.class as string,
          );
        }
      },
      isStartupTable,
      onStartupToggle: () => {
        config.setStartupTable(isStartupTable.value ? null : {
          baseUrl: route.params.url as string | undefined,
          classValue: route.params.class as string,
        });
      },
      offsetDownButton,
      offsetUpButton,
      isCurrentWeek: computed(
        () => !showOffsetPicker.value || vLoOffset.value === todayOffset.value,
      ),
      isLoading,
    };
  },
});
</script>

<style lang="scss">
.class-timetable__menu {
  min-width: 220px;
}

.class-timetable__progress {
  position: fixed;
  bottom: 0;
  z-index: 50;
}
</style>
