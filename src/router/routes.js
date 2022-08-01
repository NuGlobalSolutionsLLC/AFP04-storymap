
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MainMap.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: 'login/', component: () => import('pages/BaseLogin.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
