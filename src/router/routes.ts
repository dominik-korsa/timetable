import { RouteRecordRaw } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { paramNames } from './route-constants';

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
        name: 'Home',
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        name: 'SelectClass',
        path: `:${paramNames.tri}`,
        component: () => import('pages/SelectClass.vue'),
        meta: {
          title: 'Wybierz klasę',
        },
      },
      {
        name: 'SelectRoom',
        path: `:${paramNames.tri}(v-lo)/room`,
        component: () => import('pages/SelectRoom.vue'),
        meta: {
          title: 'Mapa pomieszczeń',
        },
      },
      {
        name: 'SuperSecretSettings',
        path: 'super-secret-settings',
        component: () => import('pages/SuperSecretSettings.vue'),
        meta: {
          title: 'Super Secret Settings',
        },
      },
    ],
  },
  {
    name: 'UnitTimetable',
    path: `/:${paramNames.tri}/:${paramNames.unitType}(class|teacher|room)/:${paramNames.unit}/`,
    component: () => import('pages/UnitTimetable.vue'),
  },
  {
    name: 'CombinedTimetable',
    path: `/:${paramNames.tri}/combined/`,
    component: () => import('pages/CombinedTimetable.vue'),
  },
  {
    name: 'Campaign',
    path: '/13c',
    alias: '/13C',
    component: () => import('pages/CampaignPage.vue'),
  },
  {
    path: '/pwa-home',
    redirect: () => {
      const config = useConfigStore();

      if (config.startupUnit === null) return { name: 'Home' };
      if (config.startupUnit.unitType === 'combined') {
        return {
          name: 'CombinedTimetable',
          params: { [paramNames.tri]: config.startupUnit.tri },
        };
      }
      return {
        name: 'UnitTimetable',
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
