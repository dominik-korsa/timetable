<template>
  <q-btn-toggle
    :model-value="value"
    :options="[
      {label: 'Jasny', value: false},
      {label: 'Ciemny', value: true},
      {label: 'Auto', value: 'auto'}
    ]"
    toggle-color="primary"
    unelevated
    spread
    class="bordered"
    :dense="$q.screen.lt.sm"
    @update:model-value="setValue"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useConfigStore } from 'stores/config';

const config = useConfigStore();

const value = computed(() => config.dark);
const setValue = (newValue: boolean | 'auto') => {
  config.setDark(newValue);
};
</script>
