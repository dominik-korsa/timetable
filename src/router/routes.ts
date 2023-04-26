import { RouteRecordRaw } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { paramNames, routeNames } from './route-constants';

const routes: RouteRecordRaw[] = [
  {
    path: '/timetable/:catchAll(.*)*',
    redirect: (route) => {
      let parts = route.params.catchAll;
      if (typeof parts !== 'string') parts = parts.join('/');
      return ({
        path: `/${parts}`,
      });
    },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: routeNames.home,
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        name: routeNames.selectClass,
        path: `:${paramNames.tri}`,
        component: () => import('pages/SelectClass.vue'),
        meta: {
          title: 'Wybierz klasę',
        },
      },
      {
        name: routeNames.selectRoom,
        path: `:${paramNames.tri}(v-lo)/room`,
        component: () => import('pages/SelectRoom.vue'),
        meta: {
          title: 'Mapa pomieszczeń',
        },
      },
      {
        name: routeNames.superSecretSettings,
        path: 'super-secret-settings',
        component: () => import('pages/SuperSecretSettings.vue'),
        meta: {
          title: 'Super Secret Settings',
        },
      },
    ],
  },
  {
    name: routeNames.unitTimetable,
    path: `/:${paramNames.tri}/:${paramNames.unitType}(class|teacher|room)/:${paramNames.unit}/`,
    component: () => import('pages/UnitTimetable.vue'),
  },
  {
    name: routeNames.combinedTimetable,
    path: `/:${paramNames.tri}/combined/`,
    component: () => import('pages/CombinedTimetable.vue'),
  },
  {
    name: routeNames.campaign,
    path: '/13c',
    alias: '/13C',
    component: () => import('pages/CampaignPage.vue'),
  },
  {
    path: '/pwa-home',
    redirect: () => {
      const config = useConfigStore();

      if (config.startupUnit === null) return { name: routeNames.home };
      if (config.startupUnit.unitType === 'combined') {
        return {
          name: routeNames.combinedTimetable,
          params: { [paramNames.tri]: config.startupUnit.tri },
        };
      }
      return {
        name: routeNames.unitTimetable,
        params: config.startupUnit,
      };
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
