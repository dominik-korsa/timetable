<template>
  <q-page
    padding
    class="select-room"
  >
    <div class="select-room__content">
      <div class="select-room__map">
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
          reduced-height
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
        <v-lo-map
          floor="secondFloor"
          class="select-room__floor select-room__floor--second"
          reduced-height
          :selected-id="selectedRoom?.id"
          @room-click="selectRoom"
        />
      </div>
      <div class="select-room__other">
        <div
          v-for="room in otherRooms"
          :key="room.id"
          tabindex="0"
          role="button"
          class="select-room__other-room"
          :class="{
            [`select-room__other-room--${room.type}`]: true,
            'select-room__other--selected': selectedRoom?.id === room.id
          }"
          @click="selectRoom(room.id)"
          @keydown.enter="selectRoom(room.id)"
          @keydown.space="selectRoom(room.id)"
        >
          {{ room.short }}
        </div>
      </div>
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
            @click="selectRoom(undefined)"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import VLoMap from 'components/VLoMap.vue';
import { otherRooms, typeDescription, vLoRooms } from 'src/api/v-lo-rooms';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  components: { VLoMap },
  setup: () => {
    const router = useRouter();
    const route = useRoute();

    return ({
      otherRooms,
      selectedRoom: computed(() => {
        const selectedRoom = vLoRooms.find((room) => room.id === route.query.selected);
        if (!selectedRoom) return undefined;
        return {
          ...selectedRoom,
          description: typeDescription[selectedRoom.type],
        };
      }),
      selectRoom: (id: string | undefined) => {
        router.replace({
          query: {
            selected: id,
          },
        });
      },
    });
  },
});
</script>

<style lang="scss">
.select-room {
  display: flex;
  align-items: center;
  justify-content: center;

  .select-room__content {
    display: grid;
    grid-template-rows: 1fr 64px;
    grid-template-columns: auto auto;
    grid-template-areas:
    "map other"
    "info info";
    grid-gap: 24px;
  }

  .select-room__map {
    grid-area: map;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

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

    & .select-room__other-room {
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

  .select-room__info {
    grid-area: info;
    display: flex;
    align-items: center;

    .select-room__info-text {
      flex-grow: 1;
    }

    & > .q-card__section {
      padding: 8px 16px;
    }
  }
}
</style>
