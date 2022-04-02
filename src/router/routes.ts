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
    path: '/timetable/',
    component: () => import('layouts/TimetableLayout.vue'),
    children: [
      {
        name: 'VLo/ClassTimetable',
        path: 'v-lo/class/:class/',
        component: () => import('pages/ClassTimetable.vue'),
        meta: {
          backTo: (route: RouteLocation): RouteLocationRaw => ({
            name: 'VLo/SelectClass',
            params: route.params,
          }),
        },
      },
      {
        name: 'Optivum/ClassTimetable',
        path: 'optivum/:url/class/:class/',
        component: () => import('pages/ClassTimetable.vue'),
        meta: {
          backTo: (route: RouteLocation): RouteLocationRaw => ({
            name: 'Optivum/SelectClass',
            params: route.params,
          }),
        },
      },
    ],
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
