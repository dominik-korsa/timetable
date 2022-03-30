<template>
  <q-page
    padding
    class="index-page column content-center"
  >
    <q-card
      flat
      bordered
      class="optivum-picker"
    >
      <q-form
        greedy
        @submit.prevent="submitOptivum"
      >
        <q-card-section>
          <div class="text-h6">
            Plan lekcji OPTIVUM
          </div>
        </q-card-section>
        <q-card-section class="q-py-none">
          <q-input
            v-model="url"
            type="url"
            filled
            label="URL Planu"
            :rules="urlRules"
            :readonly="optivumLoading"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="primary"
            type="submit"
            :loading="optivumLoading"
          >
            Połącz się
          </q-btn>
        </q-card-actions>
      </q-form>
      <template v-if="historyItems.length > 0">
        <q-separator />
        <q-item-label header>
          Ostatnie połączenia
        </q-item-label>
        <q-list>
          <q-item
            v-for="item in historyItems"
            :key="item.baseUrl"
            :to="{ name: 'Optivum/SelectClass', params: { url: item.baseUrl } }"
          >
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
          </q-item>
        </q-list>
        <q-card-actions align="center">
          <q-btn
            v-if="historyOverflow"
            color="primary"
            flat
            @click="increaseHistoryLimit"
          >
            Pokaż więcej
          </q-btn>
        </q-card-actions>
      </template>
    </q-card>

    <q-btn :to="{ name: 'VLo/SelectClass' }">
      V LO
    </q-btn>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import isUrl from 'is-url-superb';
import { loadOptivumTimetable } from 'src/api';
import { useRouter } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/requests';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'IndexPage',
  components: { },
  setup() {
    const router = useRouter();
    const quasar = useQuasar();
    const configStore = useConfigStore();

    const url = ref('');
    const optivumLoading = ref(false);
    const submitOptivum = async () => {
      optivumLoading.value = true;
      try {
        const timetableInfo = await loadOptivumTimetable(url.value, CacheMode.NetworkFirst);
        configStore.addHistoryEntry(timetableInfo);
        await router.push({
          name: 'Optivum/SelectClass',
          params: {
            url: encodeURIComponent(timetableInfo.baseUrl),
          },
        });
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: 'Nie udało się wczytać planu',
        });
      }
      optivumLoading.value = false;
    };

    const historyLimit = ref(5);
    watch(() => configStore.history.length, (value) => {
      while (historyLimit.value > value + 5) historyLimit.value -= 5;
    });
    const increaseHistoryLimit = () => {
      historyLimit.value += 5;
    };

    return {
      url,
      urlRules: [
        (v: string) => isUrl(v) || 'Podaj poprawny adres URL',
      ],
      optivumLoading,
      submitOptivum,

      historyItems: computed(() => configStore.history.slice(0, historyLimit.value)),
      historyOverflow: computed(() => configStore.history.length > historyLimit.value),
      increaseHistoryLimit,
    };
  },
});
</script>

<style lang="scss">
  .index-page {
    .optivum-picker {
      width: 100%;
      max-width: 600px;
    }
  }
</style>
