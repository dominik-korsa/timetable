<template>
  <q-page
    padding
    class="index-page column content-center"
  >
    <q-card
      flat
      bordered
      class="index-page__optivum-picker"
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
            Wczytaj plan
          </q-btn>
        </q-card-actions>
      </q-form>
      <template v-if="historyItems.length > 0">
        <q-separator />
        <q-item-label header>
          Ostatnio używane
        </q-item-label>
        <q-list>
          <q-item
            v-for="(item, i) in historyItems"
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
            <q-item-section side>
              <q-btn
                icon="remove_circle_outline"
                round
                flat
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
            @click="increaseHistoryLimit"
          >
            Pokaż więcej
          </q-btn>
        </q-card-actions>
      </template>
    </q-card>

    <router-link
      :to="{ name: 'VLo/SelectClass' }"
      class="index-page__v-lo-link q-mt-md"
    >
      <q-card
        v-ripple
        class="index-page__v-lo"
        outlined
        dark
        flat
      >
        <q-card-section horizontal>
          <img
            src="~assets/v-lo.png"
            alt="Logo V LO"
            class="index-page__v-lo-logo"
          >
          <q-separator
            vertical
            dark
          />
          <q-card-section class="column justify-center index-page__v-lo-section">
            <div class="text-h6 index-page__v-lo-name text-center">
              V&nbsp;LO
              <span class="index-page__v-lo-patron">im. Augusta Witkowskiego</span>
              w&nbsp;Krakowie
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>
    </router-link>
    <div class="text-caption q-mt-xs text-center">
      <q-icon
        name="favorite"
        class="q-mr-xs"
        color="red"
      />
      <a href="https://github.com/cloud11665/vlo.rocks-api">API planu V LO</a>
      by <a href="https://github.com/cloud11665">cloud11665</a>
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import isUrl from 'is-url-superb';
import { useRouter } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/api/requests';
import { useQuasar } from 'quasar';
import { loadOptivumTimetable } from 'src/api/optivum';

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
            url: timetableInfo.baseUrl,
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

    const historyLimit = ref(3);
    watch(() => configStore.history.length, (value) => {
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
        configStore.removeHistoryEntry(index);
      });
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
      removeHistoryEntry,
    };
  },
});
</script>

<style lang="scss">
  .index-page {
    .index-page__optivum-picker {
      width: 100%;
      max-width: 600px;
    }

    .index-page__v-lo-link {
      text-decoration: none;
      color: inherit;

      .index-page__v-lo {
        background-color: #852439;

        .index-page__v-lo-logo {
          height: 110px;
          max-height: 20vw;
          aspect-ratio: 1;
          align-self: center;
        }

        .index-page__v-lo-section {
          flex: 1;
        }

        @media (max-width: $breakpoint-xs-max) {
          .index-page__v-lo-name {
            font-size: 1rem;
          }
        }

        @media (max-width: 350px) {
          .index-page__v-lo-patron {
            display: none;
          }
        }
      }
    }
  }
</style>
