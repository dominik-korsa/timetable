<template>
  <q-card
    flat
    bordered
    class="v-lo-map-disabled column items-center justify-center text-center"
  >
    <div class="q-pa-md text-reduced">
      W tym miejscu zazwyczaj jest mapa szkoły,
    </div>
    <div class="q-ma-md">
      <v-lo-map
        viewbox="reduced-height"
        floor="firstFloor"
        no-text
      />
    </div>
    <div class="q-pa-md text-reduced">
      ale nie będziemy psuć zabawy pierwszakom
    </div>
  </q-card>
</template>

<script setup lang="ts">
import VLoMap from 'components/lists/VLoMap.vue';
</script>

<style lang="scss">
.v-lo-map-disabled {
  .v-lo-map {
    filter: blur(6px);
    pointer-events: none;
  }
}
</style>
