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
    <q-card
      v-if="info.type === 'change' && info.groups.length > 1"
      bordered
      flat
      class="q-mb-xs"
    >
      <q-expansion-item dense>
        <template #header>
          <q-item-section class="substitution-info__group-count">
            <div><b>{{ info.groups.length }}</b> {{ getGroupsText(info.groups.length) }}</div>
          </q-item-section>
        </template>
        <ul class="substitution-info__group-list">
          <li
            v-for="(group, i) in info.groups"
            :key="i"
          >
            {{ group.subject }}
            <span
              v-if="group.group !== null"
              class="substitution-info__group"
            > ({{ group.group }})</span>
            <span v-if="group.teacher !== null"> - {{ group.teacher }}</span>
          </li>
        </ul>
      </q-expansion-item>
    </q-card>
    <div
      v-else-if="info.type === 'cancellation'"
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
    <div v-else-if="info.type === 'change'">
      {{ info.groups[0].subject }}
      <span
        v-if="info.groups[0].group !== null"
        class="substitution-info__group"
      > ({{ info.groups[0].group }})</span>
      <span v-if="info.groups[0].teacher !== null"> - {{ info.groups[0].teacher }}</span>
    </div>
    <div
      v-else-if="info.type === 'substitution'"
    >
      <template v-if="info.subjectBefore !== null">
        <span class="text-strike">{{ info.subjectBefore }}</span>
        <q-icon
          name="arrow_right_alt"
          class="q-mx-xs"
          size="xs"
        />
      </template>
      <span
        :class="{
          'substitution-info__change': info.subjectBefore !== null,
        }"
      >{{ info.subject }}</span>
      <span
        v-if="info.group !== null"
        class="substitution-info__group"
      > ({{ info.group }})</span>
      <br>
      <template v-if="info.teacherBefore !== null">
        <span class="text-strike">{{ info.teacherBefore }}</span>
        <q-icon
          name="arrow_right_alt"
          class="q-mx-xs"
          size="xs"
        />
      </template>
      <span
        :class="{
          'substitution-info__change': info.teacherBefore !== null,
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
import { groupPlural, pluralRules } from 'src/plural';

export default defineComponent({
  props: {
    info: {
      type: Object as PropType<SubstitutionInfo>,
      required: true,
    },
  },
  setup: () => ({
    getGroupsText: (count: number) => groupPlural[pluralRules.select(count)],
  }),
});
</script>

<style lang="scss">
.substitution-info__group, .substitution-info__group-count {
  font-style: italic;
}

.substitution-info__comment, .substitution-info__change {
  font-weight: 500;
}

.substitution-info__group-list {
  margin: 0;
  padding: 4px 8px;
  list-style: none;

  & > li:not(:last-child) {
    margin-bottom: 6px;
  }
}
</style>
