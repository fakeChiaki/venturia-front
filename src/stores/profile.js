import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProfile() {
    try {
      loading.value = true
      error.value = null
      const { data } = await api.get('/users/me/profile')
      profile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener perfil'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateNaturalProfile(payload) {
    try {
      loading.value = true
      const { data } = await api.patch('/users/me/profile/natural', payload)
      profile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCompanyProfile(payload) {
    try {
      loading.value = true
      const { data } = await api.patch('/users/me/profile/company', payload)
      profile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOnboarding(payload) {
    try {
      loading.value = true
      const { data } = await api.patch('/users/me/onboarding', payload)
      profile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al guardar onboarding'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deactivateAccount() {
    try {
      await api.delete('/users/me')
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al desactivar'
      throw err
    }
  }

  async function uploadCv(file) {
    try {
      loading.value = true
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/users/me/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // NOTA: asumo que el backend devuelve el perfil actualizado (o al menos
      // un objeto con cvUrl). Si solo devuelve { cvUrl }, esto sigue funcionando
      // igual para el componente, pero no pisa profile.value con datos incompletos.
      if (data && typeof data === 'object' && 'subtype' in data) {
        profile.value = data
      } else if (profile.value) {
        profile.value = { ...profile.value, cvUrl: data?.cvUrl ?? data?.url ?? profile.value.cvUrl }
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al subir CV'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateNaturalProfile,
    updateCompanyProfile,
    updateOnboarding,
    deactivateAccount,
    uploadCv,
  }
})