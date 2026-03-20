/**
 * Vue Router Configuration
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy load components
const AppLayout = () => import('@/components/layout/AppLayout.vue')
const ChatView = () => import('@/views/ChatView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/chat/new',
      },
      {
        path: 'chat/:sessionId',
        name: 'Chat',
        component: ChatView,
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard to ensure session ID exists
router.beforeEach((to, from, next) => {
  if (to.name === 'Chat') {
    const sessionId = to.params.sessionId as string
    if (!sessionId) {
      next('/chat/new')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
