// Vue Router configuration

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/chat',
    children: [
      {
        path: '/chat',
        name: 'chat',
        component: () => import('@/views/ChatView.vue'),
        meta: {
          title: 'Chat',
        },
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: {
          title: 'Settings',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/chat',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  const title = to.meta.title as string
  document.title = title ? `${title} - ChatBI Agent` : 'ChatBI Agent'

  next()
})

export default router
