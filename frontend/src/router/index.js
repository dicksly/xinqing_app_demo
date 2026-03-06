import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/emotion'
  },
  {
    path: '/emotion',
    name: 'Emotion',
    component: () => import('../views/emotion/EmotionView.vue')
  },
  {
    path: '/mindfulness',
    name: 'Mindfulness',
    component: () => import('../views/mindfulness/MindfulnessView.vue')
  },
  {
    path: '/treehole',
    name: 'Treehole',
    component: () => import('../views/treehole/TreeholeView.vue')
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('../views/knowledge/KnowledgeView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/emotion'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
