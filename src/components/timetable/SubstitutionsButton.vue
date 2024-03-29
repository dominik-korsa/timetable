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
    :aria-label="`${title} - ${substitutions.length} ${changesText}`"
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
      <q-card-section>
        <div class="text-h6">
          {{ title }}
        </div>
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
            <substitution-info :info="item.info" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { LessonRange, Substitution, UnitType } from 'src/api/common';
import SubstitutionInfo from 'components/timetable/SubstitutionInfo.vue';
import { changesPlural, pluralRules } from 'src/plural';

const props = defineProps<{
  substitutions: Substitution[],
  small?: boolean;
  block?: boolean;
  unitName: string;
  unitType: UnitType;
}>();

function formatTimeSignature(range: LessonRange | null): string {
  if (range === null) return 'Cały dzień';
  if (range.first === range.last) return `${range.first}`;
  return `${range.first} - ${range.last}`;
}

const title = computed(() => `Zastępstwa ${{
  class: 'dla klasy',
  teacher: 'dla nauczyciela',
  room: 'w sali',
}[props.unitType]} ${props.unitName}`);

const dialogVisible = ref(false);

const items = computed(() => {
  const substitutions = [...props.substitutions];
  substitutions.sort((a, b) => (a.lessons?.first ?? -1) - (b.lessons?.first ?? -1));
  return substitutions.map((change) => ({
    info: change.info,
    timeSignature: formatTimeSignature(change.lessons),
  }));
});

const changesText = computed(() => (changesPlural[pluralRules.select(props.substitutions.length)]));
</script>

<style lang="scss">
.substitutions-button {
  .substitutions-button__changes {
    margin-left: 0.3em;
  }
}
</style>
