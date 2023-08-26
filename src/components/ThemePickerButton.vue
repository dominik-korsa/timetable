<template>
  <q-btn
    flat
    round
    aria-label="Wybierz motyw"
    :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
  >
    <q-menu>
      <q-card>
        <q-card-section>
          <theme-picker />
        </q-card-section>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import ThemePicker from 'components/ThemePicker.vue';
</script>
