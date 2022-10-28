import { RouteLocation, RouteLocationRaw, RouteRecordRaw } from 'vue-router';
import { useConfigStore } from 'stores/config';

export type BackTo = (route: RouteLocation) => RouteLocationRaw;

const routes: RouteRecordRaw[] = [
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
        path: 'timetable/:tri',
        component: () => import('pages/SelectClass.vue'),
        meta: {
          title: 'Wybierz klasę',
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
    name: 'ClassTimetable',
    path: '/timetable/:tri/class/:class/',
    component: () => import('pages/ClassTimetable.vue'),
  },
  {
    path: '/pwa-home',
    redirect: () => {
      const config = useConfigStore();

      if (config.startupTable === null) return { name: 'Home' };
      if (config.startupTable.baseUrl === undefined) {
        return {
          name: 'VLo/ClassTimetable',
          params: { class: config.startupTable.classValue },
        };
      }
      return {
        name: 'Optivum/ClassTimetable',
        params: { url: config.startupTable.baseUrl, class: config.startupTable.classValue },
      };
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
