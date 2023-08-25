<template>
  <div
    v-touch-swipe.vertical="onSwipe"
    class="v-lo-map-view column no-wrap"
  >
    <div v-if="floor === 'other'">
      <q-card
        bordered
        flat
      >
        <div class="text-subtitle1 text-center q-py-sm">
          Instytut austriacki
        </div>
        <button-grid
          class="border-t"
          :max-items="4"
          :buttons="instituteButtons"
        />
      </q-card>
      <q-card
        flat
        bordered
        class="row q-mt-md"
      >
        <div class="col-fill">
          <div class="text-subtitle1 text-center q-py-sm">
            Dom Harcerza
          </div>
          <button-grid
            class="border-t"
            :max-items="2"
            :buttons="dhButtons"
          />
        </div>
        <div class="col-fill border-l">
          <div class="text-subtitle1 text-center q-py-sm">
            Kampus UJ
          </div>
          <button-grid
            class="border-t"
            :max-items="2"
            :buttons="ujButtons"
          />
        </div>
      </q-card>
    </div>
    <q-card
      v-else
      flat
      bordered
      class="col-shrink q-pa-sm"
    >
      <transition
        :name="`slide-${floorTransition}`"
        mode="out-in"
      >
        <v-lo-map
          :key="floor"
          :floor="floor"
          :selected-id="selectedRoom?.id"
          viewbox="centered"
          @room-click="selectRoom"
        />
      </transition>
    </q-card>
    <div class="v-lo-map-view__info-wrapper col-grow column justify-end">
      <q-card
        v-if="selectedRoom"
        class="v-lo-map-view__info q-my-sm"
        bordered
        flat
      >
        <q-card-section class="v-lo-map-view__info-text">
          <div class="text-body1">
            {{ selectedRoom.full }}
          </div>
          <div class="text-caption">
            {{ selectedRoom.description }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            flat
            round
            icon="close"
            aria-label="Odznacz pomieszczenie"
            @click="selectRoom(undefined)"
          />
        </q-card-section>
      </q-card>
    </div>
    <q-btn-toggle
      :model-value="floor"
      class="v-lo-map-view__floor-picker"
      toggle-color="primary"
      spread
      no-caps
      unelevated
      no-wrap
      :options="[
        {label: '-1', value: 'dungeons', 'aria-label': 'piwnice'},
        {label: '0', value: 'groundFloor', 'aria-label': 'parter'},
        {label: '+1', value: 'firstFloor', 'aria-label': '1. piętro'},
        {label: '+2', value: 'secondFloor', 'aria-label': '2. piętro'},
        {label: 'Inne', value: 'other', 'aria-label': 'sale w innych budynkach', class: 'border-l'},
      ]"
      @update:model-value="selectFloor"
    />
  </div>
</template>

<script setup lang="ts">
import VLoMap from 'components/lists/VLoMap.vue';
import { computed, ref, watch } from 'vue';
import {
  FloorType, isFloor, locationDescription, vLoRooms, otherRooms, floors,
} from 'src/api/v-lo-rooms';
import { useRoute, useRouter } from 'vue-router';
import ButtonGrid, { Button } from 'components/ButtonGrid.vue';

defineProps<{
  mobile?: boolean,
}>();

type FloorSelection = FloorType | 'other';

const router = useRouter();
const route = useRoute();

const floor = ref<FloorSelection>('groundFloor');
const floorTransition = ref<'up' | 'down'>('up');
watch(floor, (value, oldValue) => {
  if (value === oldValue || value === 'other' || oldValue === 'other') return;
  floorTransition.value = floors.indexOf(value) > floors.indexOf(oldValue) ? 'up' : 'down';
});
const selectedRoom = computed(() => {
  const room = vLoRooms.find((e) => e.id === route.query.selected);
  if (!room) return undefined;
  return {
    ...room,
    description: locationDescription[room.location],
  };
});

watch(() => selectedRoom.value, (value) => {
  if (!value) return;
  if (isFloor(value.location)) floor.value = value.location;
  else floor.value = 'other';
}, { immediate: true });

const selectRoom = (id: string | undefined) => {
  router.replace({
    query: {
      ...route.query,
      selected: id,
    },
  });
};

const selectFloor = (value: FloorSelection) => {
  floor.value = value;
  if (selectedRoom.value === undefined) return;
  if (isFloor(selectedRoom.value.location)
    ? selectedRoom.value.location !== value
    : value !== 'other'
  ) selectRoom(undefined);
};

const instituteButtons = otherRooms.institute.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full} w Instytucie Austriackim`,
  color: 'institute',
  onClick: () => selectRoom(room.id),
}));
const dhButtons = otherRooms.dh.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full}`,
  color: 'dh',
  onClick: () => selectRoom(room.id),
}));
const ujButtons = otherRooms.uj.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full}`,
  color: 'uj',
  onClick: () => selectRoom(room.id),
}));

const onSwipe = (event: { direction: 'down' | 'up' }) => {
  const floorMap: Record<FloorSelection, FloorSelection> = event.direction === 'down' ? {
    dungeons: 'groundFloor',
    groundFloor: 'firstFloor',
    firstFloor: 'secondFloor',
    secondFloor: 'secondFloor',
    other: 'other',
  } : {
    dungeons: 'dungeons',
    groundFloor: 'dungeons',
    firstFloor: 'groundFloor',
    secondFloor: 'firstFloor',
    other: 'other',
  };
  selectFloor(floorMap[floor.value]);
};
</script>

<style lang="scss">
.v-lo-map-view {
  touch-action: none;

  .v-lo-map-view__floor-picker {
    border: 1px solid var(--separator-color);
  }

  .v-lo-map-view__info-wrapper {
    min-height: 90px;
  }

  .v-lo-map-view__info {
    display: flex;
    align-items: center;

    .v-lo-map-view__info-text {
      flex-grow: 1;
    }

    & > .q-card__section {
      padding: 8px 16px;
    }
  }
}
</style>
