import { createRouter, createWebHistory } from 'vue-router'

import { canAccessAdminRoute } from './admin-guard.js'
import { useAdminStore } from '../stores/admin.js'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/HomeView.vue')
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
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLoginView.vue')
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: () => import('../views/admin/AdminContentView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/ProfileView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const adminStore = useAdminStore()
  const accessResult = canAccessAdminRoute(to.path, adminStore)
  return accessResult === true ? true : accessResult
})

export default router
