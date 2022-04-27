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
          v-for="(item, i) in substitutions"
          :key="i"
        >
          <q-item-section avatar>
            {{ item.time_signature }}
          </q-item-section>
          <q-item-section>
            {{ item.comment }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { VLoSubstitution } from 'src/api/v-lo';

export default defineComponent({
  props: {
    substitutions: {
      type: Array as PropType<VLoSubstitution[]>,
      required: true,
    },
  },
  setup: () => ({
    dialogVisible: ref(false),
  }),
});
</script>
