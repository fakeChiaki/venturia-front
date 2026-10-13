import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/user.service'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)

  const token = ref(null)
  const isLoggedIn = computed(() => !!token.value)

  const applications = ref([])
  const notifications = ref([])

  const unreadNotificationsCount = computed(
    () => notifications.value.filter((n) => !n.isRead).length
  )

  async function fetchProfile() {
    profile.value = await userService.getMe()
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('access_token', newToken)
  }

  function logout() {
    profile.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  function addApplication(application) {
    applications.value.push({ id: crypto.randomUUID(), ...application })
  }

  function addNotification(notification) {
    notifications.value.push({ id: crypto.randomUUID(), ...notification })
  }

  return {
    profile,
    token,
    isLoggedIn,
    applications,
    notifications,
    unreadNotificationsCount,
    fetchProfile,
    setToken,
    logout,
    addApplication,
    addNotification,
  }
})