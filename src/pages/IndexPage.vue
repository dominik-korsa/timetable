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
      <optivum-timetable-picker />
    </q-card>

    <home-school />

    <q-card
      v-if="favouriteUnits !== null && favouriteUnits.length > 0"
      flat
      bordered
      class="full-width q-mb-md"
      role="region"
    >
      <q-card-section
        class="text-h6 q-pb-sm"
        role="heading"
      >
        Ulubione
      </q-card-section>
      <q-list separator>
        <q-item
          v-for="table in favouriteUnits"
          :key="table.tri"
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
            <div class="index-page__favourite-units q-mt-sm">
              <q-btn
                v-for="item in table.items"
                :key="item.key"
                :to="item.to"
                outline
                no-caps
                color="amber-9"
                :aria-label="item.label"
              >
                {{ item.name }}
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- TODO: Restore -->
    <!-- Removed to avoid new installs on old domain -->
    <!-- <pwa-banner class="q-mb-md" />-->

    <build-info />
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { CacheMode } from 'src/api/requests';
import BuildInfo from 'components/BuildInfo.vue';
import { getClient } from 'src/api/client';
import OptivumTimetablePicker from 'components/OptivumTimetablePicker.vue';
import { paramNames, routeNames } from 'src/router/route-constants';
import HomeSchool from 'components/HomeSchool.vue';

interface UnitItem {
  key: string;
  name: string;
  label: string;
  to: RouteLocationRaw;
}

interface FavouriteUnitItem {
  tri: string;
  title: string;
  subtitle: string | null;
  items: UnitItem[];
}

const configStore = useConfigStore();

const favouriteUnits = ref<FavouriteUnitItem[] | null>(null);

onMounted(async () => {
  favouriteUnits.value = await Promise.all(
    Object.entries(configStore.favouriteUnits)
      .map(async ([tri, units]) => {
        const client = getClient(tri);
        const [getUnitName, title] = await Promise.all([
          client.getUnitNameMapper(CacheMode.CacheFirst),
          client.getTitle(CacheMode.CacheFirst),
        ]);
        return ({
          tri,
          title,
          subtitle: client.type === 'optivum' ? client.baseUrl : null,
          items: units.map(({ unitType, unit }) => {
            const unitName = getUnitName(unitType, unit);
            return ({
              key: `${unitType}|${unit}`,
              name: unitName,
              label: `Plan lekcji ${{
                class: 'klasy',
                room: 'sali',
                teacher: 'nauczyciela',
              }[unitType]} ${unitName}`,
              to: {
                name: routeNames.unitTimetable,
                params: {
                  [paramNames.tri]: tri,
                  [paramNames.unitType]: unitType,
                  [paramNames.unit]: unit,
                },
              },
            });
          }).sort((lhs, rhs) => lhs.name.localeCompare(rhs.name)),
        });
      }),
  );
});
</script>

<style lang="scss">
  .index-page {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .index-page__favourite-units {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: right;
    }

    .index-page__optivum-picker {
      width: 100%;
    }
  }
</style>
