<template>
  <div>
    <q-card
      bordered
      flat
    >
      <div class="text-subtitle1 text-center q-py-sm">
        Instytut austriacki
      </div>
      <button-grid
        class="border-t"
        :max-items="4"
        :buttons="instituteButtons"
      />
    </q-card>
    <q-card
      flat
      bordered
      class="row q-mt-md"
    >
      <div class="col-fill">
        <div class="text-subtitle1 text-center q-py-sm">
          Dom Harcerza
        </div>
        <button-grid
          class="border-t"
          :max-items="2"
          :buttons="dhButtons"
        />
      </div>
      <div class="col-fill border-l">
        <div class="text-subtitle1 text-center q-py-sm">
          Kampus UJ
        </div>
        <button-grid
          class="border-t"
          :max-items="2"
          :buttons="ujButtons"
        />
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import ButtonGrid, { Button } from 'components/ButtonGrid.vue';
import { otherRooms } from 'src/api/v-lo-rooms';

const emit = defineEmits<{
  (e: 'room-click', roomId: string): void;
}>();

const instituteButtons = otherRooms.institute.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full} w Instytucie Austriackim`,
  color: 'institute',
  onClick: () => emit('room-click', room.id),
}));
const dhButtons = otherRooms.dh.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full}`,
  color: 'dh',
  onClick: () => emit('room-click', room.id),
}));
const ujButtons = otherRooms.uj.map((room): Button => ({
  key: room.id,
  name: room.short,
  ariaLabel: `Sala ${room.full}`,
  color: 'uj',
  onClick: () => emit('room-click', room.id),
}));
</script>
