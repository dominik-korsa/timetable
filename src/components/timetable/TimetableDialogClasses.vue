<template>
  <div class="timetable-dialog-classes">
    <template
      v-for="({ name, to }, i) in items"
      :key="name"
    >
      <span v-if="i > 0">, </span>
      <router-link
        v-if="to !== undefined"
        :to="to"
        :aria-label="`Klasa ${name}`"
      >
        {{ name }}
      </router-link>
      <span v-else>{{ name }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { TableLessonClass } from 'src/api/common';
import { useNavigation } from 'src/router/navigation';

const props = defineProps<{
  classes: TableLessonClass[];
}>();

const navigation = useNavigation();

const items = computed(() => props.classes.map(({
  name,
  id,
}) => ({
  name,
  to: id === undefined ? undefined : navigation.triRelative.class.id(id),
})));
</script>
