<template>
  <div
    v-memo="buttons"
    class="button-grid"
  >
    <div
      v-for="(row, i) in rows"
      :key="i"
      class="button-grid__row border-b-no-last row"
    >
      <q-btn
        v-for="item in row"
        :key="item.key"
        stretch
        flat
        size="md"
        class="button-grid__button col-fill border-r-no-last"
        :to="item.to"
        no-caps
        :aria-label="item.ariaLabel"
        :color="item.color"
        @click="item.onClick"
      >
        {{ item.name }}
        <div
          v-if="item.isFavourite"
          :aria-label="favouriteAriaLabel"
          class="button-grid__favourite"
        />
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouteLocationRaw } from 'vue-router';
import { balance } from 'src/utils';
import { computed } from 'vue';
import _ from 'lodash';

export interface Button {
  name: string;
  key: string;
  ariaLabel: string;
  to?: RouteLocationRaw;
  isFavourite?: boolean;
  color?: string;
  onClick?: (event: MouseEvent) => void;
}

const props = defineProps<{
  buttons: Button[];
  favouriteAriaLabel?: string;
  maxItems: number;
  balance?: boolean;
}>();

const itemsPerRow = props.balance ? balance(props.buttons.length, props.maxItems) : props.maxItems;
const rows = computed(() => _.chunk(props.buttons, itemsPerRow));
</script>

<style lang="scss">
.button-grid {
  .button-grid__button {
    position: relative;
    overflow: hidden;

    &:before {
      z-index: 1;
      pointer-events: none;
    }

    .button-grid__favourite {
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
