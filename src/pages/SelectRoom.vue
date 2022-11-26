<template>
  <q-page
    padding
    class="column content-center justify-center select-room"
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
      />
      <v-lo-map
        floor="secondFloor"
        class="select-room__floor select-room__floor--second"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VLoMap from 'components/VLoMap.vue';

export default defineComponent({
  components: { VLoMap },
});
</script>

<style lang="scss">
.select-room {
  .select-room__floors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
