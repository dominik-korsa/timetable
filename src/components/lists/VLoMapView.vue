<template>
  <div class="v-lo-map-view column no-wrap">
    <div class="col-shrink q-ma-sm">
      <v-lo-map
        class="full-height"
        :floor="floor"
        :selected-id="selectedRoom?.id"
        viewbox="centered"
        @room-click="selectRoom"
      />
    </div>
    <div class="v-lo-map-view__info-wrapper col-grow column justify-end">
      <q-card
        v-if="selectedRoom"
        class="v-lo-map-view__info q-mx-sm"
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
      class="v-lo-map-view__floor-picker q-ma-sm"
      toggle-color="primary"
      spread
      no-caps
      unelevated
      rounded
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
  FloorType, isFloor, locationDescription, vLoRooms,
} from 'src/api/v-lo-rooms';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const floor = ref<FloorType>('groundFloor');
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
}, { immediate: true });

const selectRoom = (id: string | undefined) => {
  router.replace({
    query: {
      ...route.query,
      selected: id,
    },
  });
};

const selectFloor = (value: FloorType) => {
  floor.value = value;
  if (selectedRoom.value
    && isFloor(selectedRoom.value.location)
    && selectedRoom.value.location !== value
  ) selectRoom(undefined);
};
</script>

<style lang="scss">
.v-lo-map-view {
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
