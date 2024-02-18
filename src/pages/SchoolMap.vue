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
import { getSchoolListByTeryt, voivodeshipTerytCodes } from 'src/api/tapi';

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

  Promise.all(voivodeshipTerytCodes.map(async (teryt) => {
    const schools = await getSchoolListByTeryt(teryt);
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
    });
    map.addLayer(markers);
    markers.addLayers(schools.map((school) => {
      const marker = L.marker([school.geo_lat, school.geo_long], {
        icon: schoolIcon,
      });
      let addressLine1 = `${school.address_street} ${school.address_building_number}`;
      if (school.address_apartament_number !== '') addressLine1 += `/${school.address_apartament_number}`;
      const addressLine2 = `${school.address_zip_code} ${school.address_town}`;
      marker.bindTooltip(`[${school.rspo_id}] ${school.name}<br>${addressLine1}<br>${addressLine2}`);
      return marker;
    }));
  }));
});
</script>

<style lang="scss">

</style>
