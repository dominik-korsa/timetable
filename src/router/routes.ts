import { RouteLocation, RouteLocationRaw, RouteRecordRaw } from 'vue-router';

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
        name: 'VLo/SelectClass',
        path: 'timetable/v-lo/',
        component: () => import('pages/SelectClass.vue'),
        meta: {
          title: 'Wybierz klasę',
        },
      },
      {
        name: 'Optivum/SelectClass',
        path: 'timetable/optivum/:url/',
        component: () => import('pages/SelectClass.vue'),
        meta: {
          title: 'Wybierz klasę',
        },
      },
    ],
  },
  {
    name: 'VLo/ClassTimetable',
    path: '/timetable/v-lo/class/:class/',
    component: () => import('pages/ClassTimetable.vue'),
  },
  {
    name: 'Optivum/ClassTimetable',
    path: '/timetable/optivum/:url/class/:class/',
    component: () => import('pages/ClassTimetable.vue'),
  },
  {
    path: '/pwa-home',
    redirect: '/',
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
