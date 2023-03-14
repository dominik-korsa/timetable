<template>
  <div
    :ref="el => group = el"
    class="select-class-group"
  >
    <q-btn
      v-for="item in items"
      :key="item.unit"
      class="select-class-group__button"
      :to="item.to"
      :outline="!$q.dark.isActive"
      :unelevated="$q.dark.isActive"
      :color="$q.dark.isActive ? 'grey-9' : undefined"
      no-caps
      no-wrap
      :aria-label="`Klasa ${item.name}`"
    >
      <div class="select-class-group__button-value">
        {{ item.name }}
      </div>
      <div
        v-if="item.isFavourite"
        aria-label="Ulubiona"
        class="select-class-group__favourite"
      />
    </q-btn>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, nextTick, ref, watch,
} from 'vue';

const gapWidth = 8;
const buttonPadding = 40;

export default defineComponent({
  props: {
    items: {
      type: Array,
      required: true,
    },
    containerWidth: {
      type: Number,
      required: true,
    },
  },
  setup: (props) => {
    const group = ref<HTMLDivElement>();
    const maxWidth = ref<number>();
    watch(() => [group.value, props.items] as const, async ([groupValue]) => {
      if (groupValue === undefined) return;
      maxWidth.value = undefined;
      await nextTick();
      const widths = Array.from(groupValue.getElementsByClassName('select-class-group__button-value'))
        .map((el) => el.getBoundingClientRect().width);
      if (widths.length === 0) return;
      maxWidth.value = Math.max(...widths) + buttonPadding + gapWidth;
    }, { immediate: true });
    const columnCount = computed(() => {
      if (maxWidth.value === undefined) return 1;
      const maxItemsPerRow = Math.max(
        1,
        Math.floor((props.containerWidth + gapWidth) / maxWidth.value),
      );
      const rows = Math.ceil(props.items.length / maxItemsPerRow);
      return Math.ceil(props.items.length / rows);
    });
    return ({
      maxWidth,
      group,
      columnCount,
    });
  },
});
</script>

<style lang="scss">
.select-class-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(v-bind(columnCount), 1fr);
  grid-gap: 8px;
  margin-bottom: 20px;
  overflow-x: hidden;

  .select-class-group__button {
    position: relative;
    overflow: hidden;

    &:before {
      z-index: 1;
    }

    .select-class-group__favourite {
      position: absolute;
      top: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: linear-gradient(45deg, transparent 50%, $amber-7 50%);
    }
  }
}
</style>
