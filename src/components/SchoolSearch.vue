<template>
  <q-card
    flat
    bordered
    class="q-mb-md school-search"
  >
    <q-card-section
      class="text-h6"
      role="heading"
    >
      Dodaj swoją szkołę
    </q-card-section>
    <q-card-section class="q-pt-none q-sm-xs">
      <q-input
        filled
        label="Wyszukaj szkołę&hellip;"
        hide-bottom-space
      />
    </q-card-section>
    <q-separator />
    <q-card-section class="school-search__buttons q-pa-none">
      <q-btn
        color="primary"
        label="Mapa szkół"
        stretch
        flat
        no-caps
        class="q-py-sm"
        icon="o_map"
        :to="paths.schoolMap"
      />
      <q-separator
        vertical
        class="q-my-sm"
      />
      <!--      <q-btn-->
      <!--        color="primary"-->
      <!--        label="W pobliżu"-->
      <!--        stretch-->
      <!--        flat-->
      <!--        no-caps-->
      <!--        class="q-py-sm"-->
      <!--        icon="o_near_me"-->
      <!--      />-->
      <!--      <q-separator-->
      <!--        vertical-->
      <!--        class="q-my-sm"-->
      <!--      />-->
      <q-btn
        color="primary"
        label="Z adresu URL"
        stretch
        flat
        no-caps
        class="q-py-sm"
        icon="link"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { paths } from 'src/router/path-builder';
</script>

<style lang="scss">
.school-search {
  .school-search__buttons {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-columns: auto 1fr;

    > * {
      grid-row: 1;
    }
  }
}
</style>
