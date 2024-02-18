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
import '@maptiler/leaflet-maptilersdk';

globalThis.L = L;

import { onMounted, ref } from 'vue';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const schoolIcon = L.icon({
  iconUrl: '/leaflet-icons/marker-icon.png',
  iconRetinaUrl: '/leaflet-icons/marker-icon-2x.png',
  shadowUrl: '/leaflet-icons/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const mapEl = ref<HTMLDivElement>();
onMounted(() => {
  if (mapEl.value === undefined) throw new Error('No map element');
  const map = L.map(mapEl.value, {
    minZoom: 6,
    maxZoom: 18,
  }).setView([52, 19.5], 6);

  new L.MaptilerLayer({
    apiKey: process.env.MAPTILER_API_KEY,
    language: L.MaptilerLanguage.POLISH,
    style: L.MaptilerStyle.DATAVIZ,
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
      const marker = L.marker([school.geo_lat, school.geo_long], {
        icon: schoolIcon,
      });
      marker.bindTooltip(`[${school.rspo_id}] ${school.name}`);
      return marker;
    }));
  })));
});
</script>

<style lang="scss">

</style>
