<template>
  <q-tab-panels
    :model-value="modelValue"
    class="school-layout__mobile"
    swipeable
    animated
    keep-alive
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-tab-panel
      name="classes"
      class="q-pa-none"
    >
      <q-page
        padding
        class="column q-mx-auto justify-center"
      >
        <class-list
          :items="data.classes"
          mobile
          :show-push-banner="isVLo"
        />
      </q-page>
    </q-tab-panel>
    <q-tab-panel
      name="teachers"
      class="q-pa-none"
    >
      <q-page
        padding
        class="column q-mx-auto justify-center"
      >
        <unit-list
          class="row-fill"
          unit-type="teacher"
          :units="data.teachers ?? []"
        />
      </q-page>
    </q-tab-panel>
    <q-tab-panel
      name="rooms"
      class="q-pa-none"
    >
      <q-page
        padding
        class="column q-mx-auto justify-center"
      >
        <v-lo-map-view
          v-if="isVLo"
          class="row-fill"
          mobile
        />
        <unit-list
          v-else
          class="row-fill"
          unit-type="room"
          :units="data.rooms ?? []"
        />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts" setup>
import VLoMapView from 'components/lists/VLoMapView.vue';
import ClassList from 'components/lists/ClassList.vue';
import UnitList from 'components/lists/UnitList.vue';
import type { Data } from 'layouts/SchoolLayout.vue';

defineProps<{
  data: Data;
  isVLo: boolean;
  modelValue: string;
}>();

defineEmits(['update:modelValue']);

</script>
