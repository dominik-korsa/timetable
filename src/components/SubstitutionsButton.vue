<template>
  <q-btn
    :round="!block"
    :rounded="block"
    color="amber-8"
    :size="small ? 'xs' : 'sm'"
    outline
    class="substitutions-button"
    no-caps
    :dense="block"
    :aria-label="`Zastępstwa - ${substitutions.length} ${changesText}`"
    @click="dialogVisible = true"
  >
    {{ substitutions.length }}
    <span
      v-if="block && $q.screen.width > 300"
      class="substitutions-button__changes"
    >{{ changesText }}</span>
    <q-tooltip>Zastępstwa</q-tooltip>
  </q-btn>
  <q-dialog v-model="dialogVisible">
    <q-card>
      <q-card-section class="text-h6">
        Zastępstwa
      </q-card-section>
      <q-separator />
      <q-list separator>
        <q-item
          v-for="(item, i) in items"
          :key="i"
        >
          <q-item-section
            avatar
            :aria-label="`Lekcja ${item.timeSignature}`"
          >
            {{ item.timeSignature }}
          </q-item-section>
          <q-item-section>
            {{ item.info }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { LessonRange, Substitution } from 'src/api/common.js';

function formatTimeSignature(range: LessonRange | null): string {
  if (range === null) return 'Cały dzień';
  if (range.first === range.last) return `${range.first}`;
  return `${range.first} - ${range.last}`;
}

export default defineComponent({
  props: {
    substitutions: {
      type: Array as PropType<Substitution[]>,
      required: true,
    },
    small: Boolean,
    block: Boolean,
  },
  setup: (props) => ({
    dialogVisible: ref(false),
    items: computed(() => {
      const substitutions = [...props.substitutions];
      substitutions.sort((a, b) => (a.lessons?.first ?? -1) - (b.lessons?.first ?? -1));
      return substitutions.map((change) => ({
        info: change.info,
        timeSignature: formatTimeSignature(change.lessons),
      }));
    }),
    changesText: computed(() => ({
      zero: 'zmiany',
      one: 'zmiana',
      two: 'zmiany',
      few: 'zmiany',
      many: 'zmian',
      other: 'zmian',
    }[new Intl.PluralRules('pl-PL').select(props.substitutions.length)])),
  }),
});
</script>

<style lang="scss">
.substitutions-button {
  .substitutions-button__changes {
    margin-left: 0.3em;
  }
}
</style>
