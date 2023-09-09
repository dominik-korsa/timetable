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
          aria-label="Wróć do wyboru klasy"
          @click="goBackClick"
        />

        <q-toolbar-title class="col-grow">
          <q-skeleton
            v-if="title === null"
            type="text"
            width="35px"
          />
          <template v-else>
            {{ title }}
          </template>
        </q-toolbar-title>

        <template v-if="!offset.const">
          <q-btn
            ref="offsetDownButton"
            icon="navigate_before"
            flat
            round
            :color="offset.decreaseDisabled ? 'grey' : 'primary'"
            :disable="offset.decreaseDisabled"
            :dense="$q.screen.lt.sm"
            aria-label="Poprzedni tydzień"
            @click="changeOffset(-1)"
          />
          <q-btn
            :color="offset.isCurrentWeek ? 'grey' : 'primary'"
            outline
            class="q-mx-xs"
            :disable="offset.isCurrentWeek"
            :dense="$q.screen.lt.sm"
            aria-label="Dzisiaj - przywróć obecny tydzień"
            @click="offset.reset()"
          >
            Dzisiaj
          </q-btn>
          <q-btn
            ref="offsetUpButton"
            icon="navigate_next"
            flat
            round
            :color="offset.increaseDisabled ? 'grey' : 'primary'"
            :disable="offset.increaseDisabled"
            :dense="$q.screen.lt.sm"
            aria-label="Następny tydzień"
            @click="changeOffset(1)"
          />
        </template>
        <q-btn
          icon="more_vert"
          flat
          round
          class="q-ml-xs"
          :dense="$q.screen.lt.sm"
          aria-label="Więcej opcji"
        >
          <q-menu>
            <q-card class="timetable-layout__menu">
              <q-list>
                <slot name="menu" />
                <q-item
                  clickable
                  class="non-selectable standalone"
                  @click="$emit('startupToggle')"
                >
                  <q-item-section side>
                    <q-icon
                      name="bolt"
                      :color="isStartup ? 'primary' : undefined"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Otwieraj przy starcie</q-item-label>
                    <q-item-label
                      v-if="isStartup"
                      caption
                      class="text-primary"
                    >
                      Włączono
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  class="non-selectable"
                  @click="onColorsToggle"
                >
                  <q-item-section side>
                    <q-icon
                      :name="showColors ? 'palette' : 'o_palette'"
                      :color="showColors ? 'primary' : undefined"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ showColors ? 'Wyłącz kolory' : 'Włącz kolory' }}
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
      <div>
        <slot name="tabs" />
      </div>
    </q-header>

    <q-page-container>
      <q-page
        v-if="!hasData"
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
            @click="$emit('retryLoad')"
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
        <slot :change-offset="changeOffset" />
      </q-page>
      <q-linear-progress
        v-if="isLoading"
        indeterminate
        color="primary"
        class="timetable-layout__progress"
      />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { goBack, Offset, shake } from 'src/shared';
import { useRoute, useRouter } from 'vue-router';
import { QBtn } from 'quasar';
import { useConfigStore } from 'stores/config';
import ThemePicker from 'components/ThemePicker.vue';
import { pickParams, routeNames } from 'src/router/route-constants';

const props = withDefaults(defineProps<{
  title?: string | null;
  hasData?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  offset: Offset;
  isStartup?: boolean;
}>(), {
  title: null,
  errorMessage: null,
});

defineEmits(['retryLoad', 'startupToggle']);

export type ChangeOffsetFn = (change: -1|1) => boolean;

const router = useRouter();
const route = useRoute();
const config = useConfigStore();

const offsetDownButton = ref<QBtn>();
const offsetUpButton = ref<QBtn>();

const changeOffset = (direction: -1|1) => {
  if (props.offset === null) return false;
  if (!props.offset.change(direction)) return false;
  if (direction === -1 && offsetDownButton.value) shake(offsetDownButton.value.$el, false);
  if (direction === 1 && offsetUpButton.value) shake(offsetUpButton.value.$el, true);
  return false;
};

const goBackClick = () => {
  const backTo = route.name === routeNames.combinedTimetable ? {
    name: routeNames.schoolHome,
    params: pickParams(route, 'tri'),
  } : {
    name: routeNames.schoolUnitList,
    params: pickParams(route, 'tri', 'unitType'),
  };
  goBack(router, backTo);
};
const onOffsetSwipe = (event: { direction: 'left' | 'right' }) => {
  if (event.direction === 'right') changeOffset(-1);
  if (event.direction === 'left') changeOffset(1);
};
const styleFn = (topMargin: number, height: number) => ({ height: `${height - topMargin}px` });
const showColors = computed(() => config.showColors);
const onColorsToggle = () => {
  config.toggleColors();
};
</script>

<style lang="scss">
.timetable-layout__menu {
  min-width: 220px;
}

.timetable-layout__progress {
  position: fixed;
  bottom: 0;
  z-index: 50;
}
</style>
