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
    class="theme-picker"
    :dense="$q.screen.lt.sm"
    @update:model-value="onSet"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useConfigStore } from 'stores/config';

export default defineComponent({
  name: 'ThemePicker',
  setup: () => {
    const config = useConfigStore();

    return ({
      value: computed(() => config.dark),
      onSet: (value: boolean | 'auto') => {
        config.setDark(value);
      },
    });
  },
});
</script>

<style lang="scss">
.theme-picker {
  border: 1px solid var(--separator-color);
}
</style>
