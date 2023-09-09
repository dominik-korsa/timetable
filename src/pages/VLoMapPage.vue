<template>
  <q-page
    padding
    class="select-room"
    :style-fn="styleFn"
  >
    <div class="select-room__content">
      <div class="select-room__map-single">
        <v-lo-map
          :floor="floor"
          :selected-id="selectedRoom?.id"
          viewbox="centered"
          @room-click="selectRoom"
        />
        <q-btn-toggle
          :model-value="floor"
          class="select-room__floor-picker bordered"
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
          ]"
          @update:model-value="selectFloor"
        />
      </div>
      <div class="select-room__map-grid">
        <v-lo-map
          floor="dungeons"
          class="select-room__floor select-room__floor--dungeons"
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
        <v-lo-map
          floor="groundFloor"
          class="select-room__floor select-room__floor--ground"
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
        <v-lo-map
          floor="firstFloor"
          class="select-room__floor select-room__floor--first"
          viewbox="reduced-height"
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
        <v-lo-map
          floor="secondFloor"
          class="select-room__floor select-room__floor--second"
          viewbox="reduced-height"
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
      </div>
      <div class="select-room__other">
        <div
          v-for="room in otherRoomList"
          :key="room.id"
          tabindex="0"
          role="button"
          class="select-room__other-room"
          :class="{
            [`select-room__other-room--${room.location}`]: true,
            'select-room__other--selected': selectedRoom?.id === room.id
          }"
          :aria-label="room.full"
          @click="selectRoom(room.id)"
          @keydown.enter="selectRoom(room.id)"
          @keydown.space="selectRoom(room.id)"
        >
          {{ room.short }}
        </div>
      </div>
      <div class="select-room__info-wrapper">
        <q-card
          v-if="selectedRoom"
          class="select-room__info"
          bordered
          flat
        >
          <q-card-section class="select-room__info-text">
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
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import VLoMap from 'components/lists/VLoMap.vue';
import {
  FloorType, locationDescription, vLoRooms, isFloor, otherRoomList,
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
const styleFn = (topMargin: number, height: number) => ({ height: `${height - topMargin}px` });
</script>

<style lang="scss">
.select-room {
  display: flex;
  align-items: center;
  justify-content: center;

  .select-room__content {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr auto;
    grid-template-areas:
    "map other"
    "info info";
    grid-gap: 24px;
    height: 100%;
  }

  .select-room__map-single {
    display: none;
    overflow: hidden;
    flex-shrink: 1;
    flex-grow: 1;
  }

  .select-room__map-grid {
    overflow: hidden;
    grid-area: map;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    align-self: center;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: (2*296)/(288+242);

    .select-room__floor {
      &.select-room__floor--first, &.select-room__floor--second {
        margin-top: 4px;
      }
    }
  }

  .select-room__other {
    grid-area: other;
    display: flex;
    flex-direction: column;
    gap: 3px;
    justify-content: center;
    overflow: auto;

    .select-room__other-room {
      color: white;
      padding: 2px 4px;
      text-align: center;
      border: 2px solid black;
      user-select: none;
      cursor: pointer;
      background: var(--base-color);
      transition: 200ms background-color;

      --base-color:     #{$primary};
      --selected-color: #{lighten($primary, 30%)};
      --hover-color:    #{lighten($primary, 15%)};

      &.select-room__other-room--institute {
        --base-color:  #{$v-lo-institute};
        --selected-color: #{lighten($v-lo-institute, 40%)};
        --hover-color: #{lighten($v-lo-institute, 20%)};
      }

      &.select-room__other-room--dh {
        --base-color:  #{$v-lo-dh};
        --selected-color: #{lighten($v-lo-dh, 20%)};
        --hover-color: #{lighten($v-lo-dh, 10%)};
      }

      &:hover, &.select-room__other--selected {
        background: var(--hover-color);
      }

      &.select-room__other--selected {
        animation: selected ease-in-out alternate infinite 800ms;

        @keyframes selected {
          to {
            background: var(--selected-color);
          }
        }
      }

      &:focus-visible {
        outline: solid black;
        outline-offset: 2px;
      }
    }
  }

  .select-room__floor-picker {
    margin-top: 24px;
  }

  .select-room__info-wrapper {
    grid-area: info;
    min-height: 64px;
  }

  .select-room__info {
    display: flex;
    align-items: center;

    .select-room__info-text {
      flex-grow: 1;
    }

    & > .q-card__section {
      padding: 8px 16px;
    }
  }

  @media (max-width: 500px), (max-height: 650px) {
    .select-room__content {
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      justify-content: flex-end;

      .select-room__other {
        flex-direction: row;
        flex-shrink: 0;
        gap: 6px;
        justify-content: start;

        .select-room__other-room {
          padding: 6px 10px;
        }
      }

      .select-room__map-single {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;

        .v-lo-map {
          max-width: 350px;
        }
      }

      .select-room__map-grid {
        display: none;
      }

      .select-room__info {
        flex-shrink: 0;
      }
    }
  }
}
</style>
