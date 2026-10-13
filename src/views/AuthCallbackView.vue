<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const errorMsg = ref('')

onMounted(async () => {
  const token = route.query.token
  const error = route.query.error

  // Si el backend redirige con ?error=...
  if (error) {
    errorMsg.value = decodeURIComponent(error)
    return
  }

  if (!token) {
    errorMsg.value = 'No se recibió token de autenticación.'
    return
  }

  try {
    await authStore.loginWithToken(token)
    const profile = await profileStore.fetchProfile()

    if (!profile?.subtype) {
      router.push('/onboarding/subtype')
      return
    }

    if (profile.subtype === 'creator') {
      router.push('/feed')
      return
    }

    router.push(profile?.onboardingCompleted ? '/feed' : '/onboarding')
  } catch {
    errorMsg.value = 'Error al iniciar sesión. Intenta de nuevo.'
  }
})
</script>

<template>
  <div class="flex items-center justify-center px-4 py-12">
    <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-10 py-12 max-w-sm w-full text-center">
      <div class="flex items-center justify-center gap-2 mb-6">
        <div class="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center text-sm font-bold">V</div>
        <span class="font-bold text-lg">VENTURIA</span>
      </div>

      <!-- Error -->
      <template v-if="errorMsg">
        <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-50">
          <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h2 class="font-bold text-lg mb-2 text-red-600">Error al iniciar sesión</h2>
        <p class="text-sm text-gray-500 mb-6">{{ errorMsg }}</p>
        <router-link to="/login"
          class="inline-block w-full bg-[#1C1917] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#8B5A2B] transition-colors">
          Volver al inicio de sesión
        </router-link>
      </template>

      <!-- Cargando -->
      <template v-else>
        <div class="relative w-12 h-12 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-[#E5E0D8]" />
          <div class="absolute inset-0 rounded-full border-4 border-[#8B5A2B] border-t-transparent animate-spin" />
        </div>
        <h2 class="font-bold text-lg mb-2">Iniciando sesión con Google</h2>
        <p class="text-sm text-gray-500">Verificando tus credenciales y preparando tu perfil.</p>
        <div class="mt-6 flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#CDB06D] animate-pulse" />
          <span class="w-2 h-2 rounded-full bg-[#CDB06D] animate-pulse delay-150" />
          <span class="w-2 h-2 rounded-full bg-[#CDB06D] animate-pulse delay-300" />
        </div>
      </template>
    </div>
  </div>
</template>