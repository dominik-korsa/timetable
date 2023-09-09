<template>
  <router-link
    :to="vLoTo"
    class="home-school home-school--v-lo q-mb-md"
    aria-label="Plan Piątego Liceum imienia Augusta Witkowskiego w Krakowie"
  >
    <q-card
      v-ripple
      bordered
      dark
      flat
      aria-hidden="true"
    >
      <q-card-section horizontal>
        <img
          src="~assets/v-lo.png"
          alt="Logo V LO"
          class="home-school__logo"
        >
        <q-separator
          vertical
          dark
        />
        <q-card-section class="column justify-center col-fill q-pr-sm">
          <div class="text-h6 home-school__name text-center">
            V&nbsp;LO
            <span class="home-school__v-lo-patron">im. Augusta Witkowskiego</span>
            w&nbsp;Krakowie
          </div>
        </q-card-section>
        <q-card-section class="column justify-center q-pl-none">
          <q-icon
            name="arrow_forward"
            size="sm"
          />
        </q-card-section>
      </q-card-section>
    </q-card>
  </router-link>
</template>

<script setup lang="ts">
import { paramNames, routeNames } from 'src/router/route-constants';
import { RouteLocationRaw } from 'vue-router';

const vLoTo: RouteLocationRaw = {
  name: routeNames.schoolHome,
  params: { [paramNames.tri]: 'v-lo' },
};
</script>

<style lang="scss">
.home-school {
  text-decoration: none;
  color: inherit;

  &.home-school--v-lo > .q-card {
    background-color: $v-lo;
  }

  .home-school__logo {
    height: 110px;
    max-height: 20vw;
    aspect-ratio: 1;
    align-self: center;
  }

  .home-school__name {
    line-height: 1.8rem;
    font-size: 1rem;
  }

  @media (max-width: 375px) {
    .home-school__v-lo-patron {
      display: none;
    }
  }
}
</style>
