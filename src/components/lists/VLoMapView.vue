<template>
  <div
    v-touch-swipe.vertical="onSwipe"
    class="v-lo-map-view column no-wrap"
  >
    <q-space v-if="floor === 'other' && mobile" />
    <v-lo-other-rooms
      v-if="floor === 'other'"
      @room-click="selectRoom"
    />
    <component
      :is="mobile ? 'div' : 'q-card'"
      v-else
      flat
      bordered
      class="q-pa-sm row justify-center overflow-hidden"
      :class="mobile ? 'row-fill items-center' : 'col-shrink'"
    >
      <v-lo-map-three-d
        :floor="floor"
        class="v-lo-map-view__map"
        @room-click="selectRoom"
      />
    </component>
    <q-space v-if="floor === 'other' || !mobile" />
    <div class="v-lo-map-view__info-wrapper column justify-end">
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
      :dense="denseButtons"
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
import { computed, ref, watch } from 'vue';
import {
  FloorType, isFloor, locationDescription, vLoRooms, floors,
} from 'src/api/v-lo-rooms';
import { useRoute, useRouter } from 'vue-router';
import VLoOtherRooms from 'components/lists/VLoOtherRooms.vue';
import { useQuasar } from 'quasar';
import VLoMapThreeD from 'components/lists/VLoMap3d.vue';

defineProps<{
  mobile?: boolean,
}>();

type FloorSelection = FloorType | 'other';

const router = useRouter();
const route = useRoute();
const quasar = useQuasar();

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

const denseButtons = computed(() => quasar.screen.width < 300);
</script>

<style lang="scss">
.v-lo-map-view {
  touch-action: none;

  .v-lo-map-view__map {
    max-width: 350px;
  }

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
