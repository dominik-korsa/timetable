<template>
  <q-page
    padding
    class="column content-center justify-center"
  >
    <q-list
      bordered
      class="super-secret-settings-list"
    >
      <q-item
        v-for="(setting, i) in settings"
        :key="i"
      >
        <q-item-section>
          <q-item-label>{{ setting.label }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="setting.value.value"
            @update:model-value="setting.set"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useConfigStore } from 'stores/config';

export default defineComponent({
  setup: () => {
    const config = useConfigStore();

    return ({
      settings: [
        {
          label: 'Scroll snap',
          value: computed(() => config.scrollSnap),
          set: config.setScrollSnap,
        },
        {
          label: 'Używaj formatu ISO8601',
          value: computed(() => config.iso8601),
          set: config.setISO8601,
        },
        {
          label: 'Przycisk Super Secret Settings',
          value: computed(() => config.superSecretSettingsEnabled),
          set: config.setSuperSecretSettings,
        },
      ],
    });
  },
});
</script>

<style lang="scss">
.super-secret-settings-list {
  width: 400px;
  max-width: 100%;
}
</style>
