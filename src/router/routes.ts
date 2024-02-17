import { RouteRecordRaw } from 'vue-router';
import { useConfigStore } from 'stores/config';
import { paths } from 'src/router/path-builder';
import { paramNames, triParam } from './route-constants';

const getSchoolLayout = () => import('layouts/SchoolLayout.vue');

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
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          backTo: null,
        },
      },
      {
        path: 'school-map',
        component: () => import('pages/SchoolMap.vue'),
        meta: {
          backTo: paths.home,
        },
      },
      {
        path: `:${paramNames.tri}(v-lo)/map`,
        component: () => import('pages/VLoMapPage.vue'),
        meta: {
          title: 'Mapa pomieszczeń',
          backTo: paths.tri('v-lo').school,
        },
      },
      {
        path: 'super-secret-settings',
        component: () => import('pages/SuperSecretSettings.vue'),
        meta: {
          title: 'Super Secret Settings',
          backTo: paths.home,
        },
      },
    ],
  },
  {
    path: `/:${paramNames.tri}/`,
    redirect: (location) => paths
      .tri(location.params[paramNames.tri] as string)
      .class.list,
  },
  {
    path: `/:${paramNames.tri}/:${paramNames.unitType}(class|teacher|room)/`,
    component: getSchoolLayout,
  },
  {
    path: `/${triParam}/:${paramNames.unitType}(class|teacher|room)/:${paramNames.unit}`,
    component: () => import('pages/UnitTimetable.vue'),
  },
  {
    path: `/${triParam}/combined`,
    component: () => import('pages/CombinedTimetable.vue'),
  },
  {
    path: '/13c',
    alias: '/13C',
    component: () => import('pages/CampaignPage.vue'),
  },
  {
    path: '/pwa-home',
    redirect: () => {
      const config = useConfigStore();

      if (config.startupUnit === null) return paths.home;
      const base = paths.tri(config.startupUnit.tri);
      if (config.startupUnit.unitType === 'combined') return base.combined;
      return base.unitType(config.startupUnit.unitType).id(config.startupUnit.unit);
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
