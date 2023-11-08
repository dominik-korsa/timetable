<template>
  <q-form
    greedy
    aria-label="Formularz plan lekcji OPTIVUM"
    @submit.prevent="submit"
  >
    <q-card-section class="text-h6 row items-center justify-between">
      <div role="heading">
        Wczytaj plan lekcji OPTIVUM
      </div>
      <q-btn
        v-if="$q.screen.width > 380"
        flat
        color="primary"
        no-caps
        @click="helpDialogVisible = true"
      >
        Co to jest?
      </q-btn>
      <q-btn
        v-else
        icon="help"
        color="primary"
        flat
        round
        @click="helpDialogVisible = true"
      >
        <q-tooltip>Co to jest?</q-tooltip>
      </q-btn>
    </q-card-section>
    <q-card-section class="q-pt-none q-sm-xs">
      <q-input
        v-model="url"
        type="url"
        filled
        label="Adres URL Planu"
        :readonly="loading"
        hide-bottom-space
        :error="url !== '' && !urlValid"
      />
    </q-card-section>
    <q-slide-transition>
      <q-card-actions
        v-if="urlValidBefore"
        class="q-pt-none q-px-md"
        align="center"
      >
        <q-btn
          color="primary"
          type="submit"
          :loading="loading"
          :disable="!urlValid"
        >
          Wczytaj plan
        </q-btn>
      </q-card-actions>
    </q-slide-transition>
  </q-form>
  <section
    v-if="historyItems.length > 0"
    aria-label="Ostatnio używane plany OPTIVUM"
  >
    <q-separator aria-hidden="true" />
    <q-item-label
      header
      role="heading"
    >
      Ostatnio używane
    </q-item-label>
    <q-list>
      <q-item
        v-for="(item, i) in historyItems"
        :key="item.baseUrl"
        :to="item.to"
        class="q-pr-sm"
      >
        <q-item-section
          v-if="item.absoluteImageSrc"
          avatar
        >
          <q-avatar rounded>
            <div class="optivum-timetable-picker__school-logo">
              <img
                :src="item.absoluteImageSrc"
                alt="Logo"
                crossorigin="anonymous"
              >
            </div>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1">
            {{ item.title }}
          </q-item-label>
          <q-item-label
            lines="1"
            caption
          >
            {{ item.baseUrl }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="remove_circle_outline"
            round
            flat
            aria-label="Usuń z historii"
            @click.prevent="removeHistoryEntry(i)"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-actions align="center">
      <q-btn
        v-if="historyOverflow"
        color="primary"
        flat
        no-caps
        @click="increaseHistoryLimit"
      >
        Pokaż więcej
      </q-btn>
    </q-card-actions>
  </section>
  <q-dialog v-model="helpDialogVisible">
    <optivum-help />
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { OptivumClient } from 'src/api/optivum';
import { CacheMode } from 'src/api/requests';
import { useConfigStore } from 'stores/config';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import isUrl from 'is-url-superb';
import { toProxied } from 'src/api/common';
import OptivumHelp from 'components/OptivumHelp.vue';
import { paths } from 'src/router/path-builder';

const config = useConfigStore();
const quasar = useQuasar();
const router = useRouter();

const url = ref('');
const urlValid = computed(() => isUrl(url.value));
const urlValidBefore = ref(false);
const loading = ref(false);
const helpDialogVisible = ref(false);

watch(urlValid, (value) => {
  if (value) urlValidBefore.value = true;
}, { immediate: true });

const submit = async () => {
  if (!urlValid.value) return;
  loading.value = true;
  try {
    const timetableInfo = await OptivumClient.attemptLoad(CacheMode.NetworkFirst, url.value);
    config.addHistoryEntry(timetableInfo, null);
    await router.push(paths.tri(OptivumClient.createTri(timetableInfo.baseUrl, timetableInfo.listPath)).school);
  } catch (error) {
    console.error(error);
    quasar.notify({
      type: 'negative',
      message: 'Nie udało się wczytać planu',
    });
  }
  loading.value = false;
};

const historyLimit = ref(3);
watch(() => config.optivumHistory.length, (value) => {
  while (historyLimit.value > value + 5) historyLimit.value -= 5;
});
const increaseHistoryLimit = () => {
  historyLimit.value += 5;
};

const removeHistoryEntry = (index: number) => {
  quasar.dialog({
    title: 'Usunąć adres z historii połączeń?',
    message: 'Twoje preferencje dotyczące planu nie zostaną usunięte',
    cancel: true,
  }).onOk(() => {
    config.removeHistoryEntry(index);
  });
};

const historyItems = computed(() => config.optivumHistory
  .slice(0, historyLimit.value)
  .map((item) => ({
    ...item,
    to: paths.tri(OptivumClient.createTri(item.baseUrl, item.listPath)).school,
    absoluteImageSrc: item.logoSrc
      ? toProxied(new URL(item.logoSrc, new URL(item.listPath, item.baseUrl)).toString()).url.toString()
      : undefined,
  })));

const historyOverflow = computed(() => config.optivumHistory.length > historyLimit.value);
</script>

<style lang="scss">
.optivum-timetable-picker__school-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  img {
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }
}
</style>
