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
    ],
  },
  {
    path: '/timetable/v-lo/',
    component: () => import('layouts/TimetableLayout.vue'),
    children: [
      {
        name: 'VLo/SelectClass',
        path: '',
        component: () => import('pages/SelectClass.vue'),
        meta: {
          backTo: (): RouteLocationRaw => ({
            name: 'Home',
          }),
        },
      },
      {
        name: 'VLo/ClassTimetable',
        path: 'class/:class/',
        component: () => import('pages/ClassTimetable.vue'),
        meta: {
          backTo: (route: RouteLocation): RouteLocationRaw => ({
            name: 'VLo/SelectClass',
            params: route.params,
          }),
        },
      },
    ],
  },
  {
    path: '/timetable/optivum/:url/',
    component: () => import('layouts/TimetableLayout.vue'),
    children: [
      {
        name: 'Optivum/SelectClass',
        path: '',
        component: () => import('pages/SelectClass.vue'),
        meta: {
          backTo: (): RouteLocationRaw => ({
            name: 'Home',
          }),
        },
      },
      {
        name: 'Optivum/ClassTimetable',
        path: 'class/:class/',
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
