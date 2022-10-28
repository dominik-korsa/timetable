<template>
  <q-page
    padding
    class="index-page column content-center"
  >
    <q-card
      flat
      bordered
      class="index-page__optivum-picker q-mb-md"
    >
      <q-form
        greedy
        @submit.prevent="submitOptivum"
      >
        <q-card-section class="text-h6">
          Plan lekcji OPTIVUM
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
            :to="item.to"
            class="q-pr-sm"
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
      :to="{ name: 'SelectClass', params: { tri: 'v-lo' } }"
      class="index-page__v-lo-link q-mb-md"
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
          <q-card-section class="column justify-center index-page__v-lo-section q-pr-sm">
            <div class="text-h6 index-page__v-lo-name text-center">
              V&nbsp;LO
              <span class="index-page__v-lo-patron">im. Augusta Witkowskiego</span>
              w&nbsp;Krakowie
            </div>
          </q-card-section>
          <q-card-section class="column justify-center q-pl-none">
            <q-icon
              class="index-page__v-lo-arrow"
              name="arrow_forward"
              size="sm"
            />
          </q-card-section>
        </q-card-section>
      </q-card>
    </router-link>

    <q-card
      v-if="favouriteTables !== null && favouriteTables.length > 0"
      flat
      bordered
      class="full-width q-mb-md"
    >
      <q-card-section class="text-h6 q-pb-sm">
        Ulubione
      </q-card-section>
      <q-list separator>
        <q-item
          v-for="table in favouriteTables"
          :key="table.key"
        >
          <q-item-section>
            <q-item-label lines="1">
              {{ table.title }}
            </q-item-label>
            <q-item-label
              v-if="table.subtitle !== null"
              lines="1"
              caption
            >
              {{ table.subtitle }}
            </q-item-label>
            <div class="index-page__favourites-classes q-mt-sm">
              <q-btn
                v-for="item in table.items"
                :key="item.value"
                :to="item.to"
                outline
                no-caps
                color="amber-9"
              >
                {{ item.name }}
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <pwa-banner class="q-mb-md" />

    <build-info />
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import isUrl from 'is-url-superb';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/api/requests';
import { useQuasar } from 'quasar';
import { OptivumClient } from 'src/api/optivum';
import BuildInfo from 'components/BuildInfo.vue';
import PwaBanner from 'components/PwaBanner.vue';

interface ClassItem {
  value: string;
  name: string;
  to: RouteLocationRaw;
}

interface FavouriteTableItem {
  key: string;
  title: string;
  subtitle: string | null;
  items: ClassItem[];
}

export default defineComponent({
  name: 'IndexPage',
  components: { BuildInfo, PwaBanner },
  setup() {
    const router = useRouter();
    const quasar = useQuasar();
    const configStore = useConfigStore();

    const url = ref('');
    const optivumLoading = ref(false);
    const submitOptivum = async () => {
      optivumLoading.value = true;
      try {
        const timetableInfo = await OptivumClient.attemptLoad(CacheMode.NetworkFirst, url.value);
        configStore.addHistoryEntry(timetableInfo);
        await router.push({
          name: 'SelectClass',
          params: {
            tri: OptivumClient.createTri(timetableInfo.baseUrl, timetableInfo.listPath),
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

    const favouriteTables = ref<FavouriteTableItem[] | null>(null);

    // onMounted(async () => {
    //   favouriteTables.value = await Promise.all(
    //     Object.entries(configStore.favouriteTables)
    //       .map(async ([key, classes]) => {
    //         if (key === 'v-lo') {
    //           const classList = await loadVLoClassList(CacheMode.CacheFirst);
    //           return ({
    //             key,
    //             title: 'V LO w Krakowie',
    //             subtitle: null,
    //             items: classList
    //               .map((value) => ({
    //                 value,
    //                 name: value,
    //                 to: {
    //                   name: 'VLo/ClassTimetable',
    //                   params: { class: value },
    //                 },
    //               }))
    //               .filter((item) => classes.includes(item.value)),
    //           });
    //         }
    //         const timetable = await loadOptivumTimetable(key, CacheMode.CacheFirst);
    //         const classList = await loadOptivumClassList(timetable, CacheMode.CacheFirst);
    //         return ({
    //           key,
    //           title: timetable.title,
    //           subtitle: timetable.baseUrl,
    //           items: classList.map(({ name, value }) => ({
    //             value,
    //             name,
    //             to: {
    //               name: 'Optivum/ClassTimetable',
    //               params: { url: key, class: value },
    //             },
    //           })).filter((item) => classes.includes(item.value)),
    //         });
    //       }),
    //   );
    // });

    return {
      url,
      urlRules: [
        (v: string) => isUrl(v) || 'Podaj poprawny adres URL',
      ],
      optivumLoading,
      submitOptivum,
      historyItems: computed(() => configStore.history
        .slice(0, historyLimit.value)
        .map((item) => ({
          ...item,
          to: { name: 'SelectClass', params: { tri: OptivumClient.createTri(item.baseUrl, item.listPath) } },
        }))),
      historyOverflow: computed(() => configStore.history.length > historyLimit.value),
      increaseHistoryLimit,
      removeHistoryEntry,
      favouriteTables,
    };
  },
});
</script>

<style lang="scss">
  .index-page {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .index-page__favourites-classes {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: right;
    }

    .index-page__optivum-picker {
      width: 100%;
    }

    .index-page__v-lo-link {
      text-decoration: none;
      color: inherit;

      .index-page__v-lo {
        background-color: #852439;
        border: var(--separator-color) solid 1px;

        .index-page__v-lo-logo {
          height: 110px;
          max-height: 20vw;
          aspect-ratio: 1;
          align-self: center;
        }

        .index-page__v-lo-section {
          flex: 1;
        }

        .index-page__v-lo-name {
          line-height: 1.8rem;
          font-size: 1rem;
        }

        @media (max-width: 375px) {
          .index-page__v-lo-patron {
            display: none;
          }
        }
      }
    }
  }
</style>
