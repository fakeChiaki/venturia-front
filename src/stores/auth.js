import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useProfileStore } from './profile'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(credentials) {
    try {
      loading.value = true
      error.value = null
      useProfileStore().profile = null
      const { data } = await api.post('/auth/login', credentials)
      token.value = data.accessToken
      localStorage.setItem('access_token', token.value)
      await fetchProfile()
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(endpoint, payload) {
    try {
      loading.value = true
      error.value = null
      const { data } = await api.post(endpoint, payload)
      token.value = data.accessToken
      localStorage.setItem('access_token', token.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function registerPerson(formData) {
    try {
      loading.value = true
      error.value = null
      const { data } = await api.post('/auth/register/person', formData)
      token.value = data.accessToken
      localStorage.setItem('access_token', token.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loginWithToken(accessToken) {
    token.value = accessToken
    localStorage.setItem('access_token', accessToken)
    await fetchProfile()
  }

  async function fetchProfile() {
    const { data } = await api.get('/auth/me')
    user.value = data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    useProfileStore().profile = null
  }

  return { token, user, loading, error, isAuthenticated, login, register, registerPerson, loginWithToken, fetchProfile, logout }
})