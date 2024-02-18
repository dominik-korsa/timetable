<template>
  <q-page
    class="row justify-evenly"
  >
    <div
      ref="mapEl"
      class="full-width self-stretch"
    />
  </q-page>
</template>

<script lang="ts" setup>
import L from 'leaflet';
import 'leaflet.markercluster';

globalThis.L = L;

import { onMounted, ref } from 'vue';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const mapEl = ref<HTMLDivElement>();
onMounted(() => {
  if (mapEl.value === undefined) throw new Error('No map element');
  const map = L.map(mapEl.value).setView([52, 19.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Autorzy <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a>',
    detectRetina: true,
  }).addTo(map);

  const voivodeships = ['02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32'];

  Promise.all(voivodeships.map((teryt) => fetch(`https://tapi.dk-gl.eu/v1/schools?teryt=${teryt}`).then(async (response) => {
    if (!response.ok) {
      throw Error(`HTTP Request for TERYT ${teryt} failed with status code ${response.status}`);
    }
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
    });
    map.addLayer(markers);
    markers.addLayers((await response.json()).schools.map((school) => {
      const marker = L.marker([school.geo_lat, school.geo_long]);
      marker.bindTooltip(`[${school.rspo_id}] ${school.name}`);
      return marker;
    }));
  })));
});
</script>

<style lang="scss">

</style>
