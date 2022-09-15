<template>
  <q-btn
    round
    color="amber-8"
    size="sm"
    outline
    @click="dialogVisible = true"
  >
    {{ substitutions.length }}
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
          <q-item-section avatar>
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
import { Substitution, LessonRange } from '@wulkanowy/asc-timetable-parser';

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
  }),
});
</script>
