<template>
  <div class="map3d">
    <v-lo-map
      v-for="(floorName, i) in floors"
      :key="floorName"
      :floor="floorName"
      viewbox="centered"
      :aria-hidden="floor !== floorName"
      :class="{
        [`map3d__floor-${i}`]: true,
        'map3d__floor--hidden': floor !== floorName,
      }"
      @room-click="$emit('room-click', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { floors, FloorType } from 'src/api/v-lo-rooms';
import VLoMap from 'components/lists/VLoMap.vue';
import { computed, ref } from 'vue';
import { useInterval } from 'src/utils';

defineEmits<{
  (e: 'room-click', roomId: string): void;
}>();

const props = defineProps<{
  floor: FloorType,
}>();

const floorIndex = computed(() => floors.indexOf(props.floor));

const enabled = ref(false);
useInterval(() => {
  enabled.value = !enabled.value;
}, 5000);
</script>

<style lang="scss">
.map3d {
  display: grid;
  perspective: 800px;
  perspective-origin: center 120%;

  --selected-floor: v-bind(floorIndex);
  $transition-duration: 400ms;
  $transition-delay: 100ms;

  .v-lo-map {
    grid-row: 1;
    grid-column: 1;
    transition:
      transform ($transition-duration + $transition-delay) 0ms,
      opacity $transition-duration $transition-delay;
    transform: translateZ(calc((var(--index) - var(--selected-floor)) * 140px));
  }

  .map3d__floor--hidden {
    pointer-events: none;
    transition-delay: 0ms, 0ms;
    opacity: 0;
  }

  @for $i from 0 to 4 {
    .map3d__floor-#{$i} {
      --index: #{$i};
    }
  }

  @media (prefers-reduced-motion) {
    perspective: none;

    .v-lo-map {
      transform: none;
      transition: none;
    }

    .map3d__floor--hidden {
      display: none;
    }
  }
}
</style>
