<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const selected = ref(null)
const loading = ref(false)
const error = ref('')

const options = [
  {
    value: 'creator',
    title: 'Creador de Proyecto',
    description: 'Tengo una idea y busco financiamiento de empresas y un equipo que la haga realidad.',
    bullets: ['Publica tus proyectos', 'Negocia ofertas de financiamiento', 'Arma tu equipo de desarrollo'],
  },
  {
    value: 'developer',
    title: 'Desarrollador',
    description: 'Quiero unirme a proyectos financiados y aportar mis habilidades técnicas.',
    bullets: ['Explora proyectos buscando equipo', 'Postula a roles según tu perfil', 'Forma parte de equipos reales'],
  },
]

async function confirm() {
  if (!selected.value) {
    error.value = 'Selecciona una opción para continuar'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.patch('/auth/subtype', { subtype: selected.value })
    // El backend emite tokens nuevos con el subtype incluido
    authStore.token = data.accessToken
    localStorage.setItem('access_token', data.accessToken)
    await profileStore.fetchProfile()

    if (selected.value === 'creator') {
      router.push('/feed')
    } else {
      router.push('/onboarding')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar tu elección. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-2xl">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center text-sm font-bold">V</div>
          <span class="font-bold text-lg">VENTURIA</span>
        </div>
        <h1 class="text-2xl font-bold text-[#1C1917]">¿Cómo quieres participar?</h1>
        <p class="mt-2 text-sm text-gray-500">Elige tu rol en la plataforma. Esta elección define tu experiencia en Venturia.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          @click="selected = opt.value"
          :class="['text-left rounded-2xl border-2 bg-white p-6 transition-all',
            selected === opt.value
              ? 'border-[#8B5A2B] shadow-[0_4px_20px_-4px_rgba(139,90,43,0.25)]'
              : 'border-[#E5E0D8] hover:border-[#CDB06D]']"
        >
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-bold text-[#1C1917]">{{ opt.title }}</h2>
            <div :class="['h-5 w-5 rounded-full border-2 flex items-center justify-center',
              selected === opt.value ? 'border-[#8B5A2B] bg-[#8B5A2B]' : 'border-[#E5E0D8]']">
              <svg v-if="selected === opt.value" class="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-500 mb-4">{{ opt.description }}</p>
          <ul class="space-y-1.5">
            <li v-for="b in opt.bullets" :key="b" class="flex items-center gap-2 text-xs text-gray-600">
              <span class="h-1.5 w-1.5 rounded-full bg-[#CDB06D] flex-shrink-0" />
              {{ b }}
            </li>
          </ul>
        </button>
      </div>

      <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>

      <button
        @click="confirm"
        :disabled="loading"
        class="mt-6 w-full bg-[#1C1917] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#8B5A2B] transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Guardando...' : 'Continuar' }}
      </button>
    </div>
  </div>
</template>
