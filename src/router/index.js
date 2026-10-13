import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/auth/callback', name: 'auth-callback', component: () => import('../views/AuthCallbackView.vue') },
  { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue'), meta: { requiresAuth: true } },
  { path: '/onboarding/subtype', name: 'onboarding-subtype', component: () => import('../views/OnboardingSubtypeView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
  { path: '/feed', component: () => import('@/views/FeedView.vue'), meta: { requiresAuth: true } },
  { path: '/projects', component: () => import('@/views/ProjectsView.vue'), meta: { requiresAuth: true } },
  { path: '/projects/new', component: () => import('@/views/CreateProjectView.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id', component: () => import('@/views/ProjectDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id/manage', component: () => import('@/views/ManageProjectView.vue'), meta: { requiresAuth: true } },
  { path: '/applications', component: () => import('@/views/ApplicationsView.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id/funding', component: () => import('@/views/ProjectFundingView.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id/offer', component: () => import('@/views/FundingOfferView.vue'), meta: { requiresAuth: true } },
  ]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore() 
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('access_token')
    if (!token) return '/login'

    try {
      if (!authStore.user) await authStore.fetchProfile()
      if (!profileStore.profile) await profileStore.fetchProfile()
    } catch {
      authStore.logout()
      return '/login'
    }
  }
})

export default router