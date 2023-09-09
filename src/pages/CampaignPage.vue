<template>
  <q-layout
    view="hHh LpR lfr"
    class="campaign"
  >
    <q-page-container>
      <q-page class="campaign__page">
        <v-lo-map
          campaign13c
          viewbox="centered"
          floor="groundFloor"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import VLoMap from 'components/lists/VLoMap.vue';
</script>

<style lang="scss">
.campaign {
  .campaign__page {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;

    .v-lo-map {
      max-width: 400px;
    }
  }
}
</style>
