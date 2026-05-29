import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wishes',
    name: 'Wishes',
    component: () => import('@/views/Wishes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/send-wish',
    name: 'SendWish',
    component: () => import('@/views/SendWish.vue'),
    meta: { requiresAuth: true, femaleOnly: true }
  },
  {
    path: '/mood',
    name: 'Mood',
    component: () => import('@/views/Mood.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/modify-request/:id',
    name: 'ModifyRequest',
    component: () => import('@/views/ModifyRequest.vue'),
    meta: { requiresAuth: true, femaleOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && authStore.isLoggedIn) {
    next('/home')
  } else if (to.meta.femaleOnly && authStore.isMale) {
    next('/home')
  } else if (to.meta.maleOnly && authStore.isFemale) {
    next('/home')
  } else {
    next()
  }
})

export default router
