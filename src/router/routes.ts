import { RouteRecordRaw } from 'vue-router';

const timetableRoutes = [
  {
    name: 'SelectClass',
    path: '',
    component: () => import('pages/SelectClass.vue'),
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
    ],
  },
  {
    path: '/timetable/v-lo',
    component: () => import('layouts/TimetableLayout.vue'),
    children: [
      ...timetableRoutes.map((route) => ({
        ...route,
        name: route.name ? `VLo/${route.name}` : undefined,
      })),
    ],
  },
  {
    path: '/timetable/optivum/:url',
    component: () => import('layouts/TimetableLayout.vue'),
    children: [
      ...timetableRoutes.map((route) => ({
        ...route,
        name: route.name ? `Optivum/${route.name}` : undefined,
      })),
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
