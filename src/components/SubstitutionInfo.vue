<template>
  <div
    v-if="info.type === 'classAbsent'"
    class="text-negative"
  >
    <q-icon
      name="block"
      left
      size="sm"
    /> Klasa nieobecna
  </div>
  <div
    v-else
    class="substitution-info"
  >
    <div
      v-if="info.type === 'cancellation'"
      class="text-negative text-caption"
    >
      <q-icon
        name="block"
        left
        size="xs"
      /> Lekcja odwołana
    </div>
    <div
      v-else-if="info.type === 'substitution'"
      class="text-amber-8 text-caption"
    >
      <q-icon
        name="swap_horiz"
        left
        size="xs"
      /> Zastępstwo
    </div>
    <div
      v-if="info.type === 'cancellation' || info.type === 'change'"
      :class="{
        'text-strike': info.type === 'cancellation'
      }"
    >
      {{ info.subject }}
      <span
        v-if="info.group !== null"
        class="substitution-info__group"
      > ({{ info.group }})</span>
      <span v-if="info.teacher !== null"> - {{ info.teacher }}</span>
    </div>
    <div
      v-if="info.type === 'substitution'"
    >
      <template v-if="info.subject_before !== null">
        <span class="text-strike">{{ info.subject_before }}</span>
        <q-icon
          name="arrow_right_alt"
          class="q-mx-xs"
          size="xs"
        />
      </template>
      <span
        :class="{
          'substitution-info__change': info.subject_before !== null,
        }"
      >{{ info.subject }}</span>
      <span
        v-if="info.group !== null"
        class="substitution-info__group"
      > ({{ info.group }})</span>
      <br>
      <template v-if="info.teacher_before !== null">
        <span class="text-strike">{{ info.teacher_before }}</span>
        <q-icon
          name="arrow_right_alt"
          class="q-mx-xs"
          size="xs"
        />
      </template>
      <span
        :class="{
          'substitution-info__change': info.teacher_before !== null,
        }"
      >{{ info.teacher }}</span>
    </div>
    <div
      v-if="info.comment !== null"
      class="substitution-info__comment"
    >
      <q-icon
        name="info"
        size="xs"
      />
      {{ info.comment }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { SubstitutionInfo } from 'src/api/common.js';

export default defineComponent({
  props: {
    info: {
      type: Object as PropType<SubstitutionInfo>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
.substitution-info__group {
  font-style: italic;
}

.substitution-info__comment, .substitution-info__change {
  font-weight: 500;
}
</style>
