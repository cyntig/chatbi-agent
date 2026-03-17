import { createRouter, createWebHistory } from 'vue-router'

const ChatView = () => import('@/components/chat/ChatContainer.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChatView,
    },
    {
      path: '/chat/:sessionId',
      name: 'chat',
      component: ChatView,
    },
  ],
})

export default router
