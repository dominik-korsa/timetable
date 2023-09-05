<template>
  <q-tab-panels
    :model-value="modelValue"
    class="school-layout__mobile bg-transparent"
    swipeable
    animated
    keep-alive
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-tab-panel
      name="class"
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
      name="teacher"
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
      name="room"
      class="q-pa-none"
    >
      <q-page
        padding
        class="column q-mx-auto justify-center"
      >
        <!--        <v-lo-map-view-->
        <!--          v-if="isVLo"-->
        <!--          class="row-fill"-->
        <!--          mobile-->
        <!--        />-->
        <v-lo-map-disabled
          v-if="isVLo"
          class="row-fill"
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
import ClassList from 'components/lists/ClassList.vue';
import UnitList from 'components/lists/UnitList.vue';
import type { Data } from 'layouts/SchoolLayout.vue';
import VLoMapDisabled from 'components/lists/VLoMapDisabled.vue';

defineProps<{
  data: Data;
  isVLo: boolean;
  modelValue: string;
}>();

defineEmits(['update:modelValue']);

</script>
