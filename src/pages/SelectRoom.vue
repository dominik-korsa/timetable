<template>
  <q-page
    padding
    class="select-room"
  >
    <div class="select-room__floors">
      <v-lo-map
        floor="dungeons"
        class="select-room__floor select-room__floor--dungeons"
      />
      <v-lo-map
        floor="groundFloor"
        class="select-room__floor select-room__floor--ground"
        campaign
      />
      <v-lo-map
        floor="firstFloor"
        class="select-room__floor select-room__floor--first"
        reduced-height
      />
      <v-lo-map
        floor="secondFloor"
        class="select-room__floor select-room__floor--second"
        reduced-height
      />
    </div>
    <div class="select-room__other">
      <div
        v-for="room in instituteRooms"
        :key="room"
        class="select-room__other-room select-room__other-room--institute"
      >
        {{ room }}
      </div>
      <div
        v-for="room in dhRooms"
        :key="room"
        class="select-room__other-room select-room__other-room--dh"
      >
        {{ room }}
      </div>
      <div
        v-for="room in otherRooms"
        :key="room"
        class="select-room__other-room"
      >
        {{ room }}
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VLoMap from 'components/VLoMap.vue';
import vLoRooms from 'src/assets/v-lo-rooms.json';

export default defineComponent({
  components: { VLoMap },
  setup: () => ({
    instituteRooms: vLoRooms.institute,
    dhRooms: vLoRooms.dh,
    otherRooms: vLoRooms.other,
  }),
});
</script>

<style lang="scss">
.select-room {
  display: flex;
  align-items: center;
  justify-content: center;

  .select-room__floors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    .select-room__floor {
      &.select-room__floor--first, &.select-room__floor--second {
        margin-top: 4px;
      }
    }
  }

  .select-room__other {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-left: 24px;

    & .select-room__other-room {
      color: white;
      padding: 2px 4px;
      text-align: center;
      border: 2px solid black;
      user-select: none;
      cursor: pointer;
      background: var(--base-color);
      transition: 200ms background-color;

      --base-color:  #{$primary};
      --hover-color: #{lighten($primary, 15%)};

      &.select-room__other-room--institute {
        --base-color:  #{$v-lo-institute};
        --hover-color: #{lighten($v-lo-institute, 10%)};
      }

      &.select-room__other-room--dh {
        --base-color:  #{$v-lo-dh};
        --hover-color: #{lighten($v-lo-dh, 10%)};
      }

      &:hover {
        background: var(--hover-color);
      }
    }
  }
}
</style>
