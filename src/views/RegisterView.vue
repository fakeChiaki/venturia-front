<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const accountType = ref('natural')
const userType = ref('developer') // 'developer' | 'creator'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const fullName = ref('')
const cvFile = ref(null)
const cvFileName = ref('Ningún archivo seleccionado')

const companyName = ref('')
const address = ref('')
const phone = ref('')

// Misma base que axios: en prod '/api' (relativo, via nginx), en dev localhost:3000
const googleAuthUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/google'

function onCvChange(e) {
  const file = e.target.files[0]
  if (file) {
    cvFile.value = file
    cvFileName.value = file.name
  } else {
    cvFile.value = null
    cvFileName.value = 'Ningún archivo seleccionado'
  }
}

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  if (accountType.value === 'natural' && !cvFile.value) {
    error.value = 'El currículum es obligatorio'
    return
  }

  try {
    loading.value = true
    error.value = ''

    if (accountType.value === 'company') {
      await authStore.register('/auth/register/company', {
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
        companyName: companyName.value,
        address: address.value,
        phone: phone.value,
      })
      router.push('/feed')
    } else {
      const formData = new FormData()
      formData.append('email', email.value)
      formData.append('password', password.value)
      formData.append('confirmPassword', confirmPassword.value)
      formData.append('fullName', fullName.value)
      formData.append('cv', cvFile.value)
      // TU BASE DE DATOS ESPERA 'subtype'
      formData.append('subtype', userType.value)

      await authStore.registerPerson(formData)

      if (userType.value === 'creator') {
        router.push('/feed')
      } else {
        router.push('/onboarding')
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-start justify-center px-4 py-10">
    <div class="w-full max-w-[460px] bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#E5E0D8]">
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-2 text-[#1C1917]">Crear Cuenta</h1>
        <p class="text-sm text-gray-500">Regístrate para encontrar proyectos que coincidan con tu perfil</p>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-semibold mb-3 text-[#1C1917]">Tipo de Cuenta</label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" @click="accountType = 'natural'"
            :class="['border rounded-xl p-4 flex flex-col items-center gap-2 transition-all', accountType === 'natural' ? 'border-[#8B5A2B] bg-[#FAF8F5] ring-1 ring-[#8B5A2B]' : 'border-[#E5E0D8] hover:bg-gray-50']">
            <span class="text-2xl">👤</span>
            <span class="text-sm font-medium">Persona Natural</span>
          </button>
          <button type="button" @click="accountType = 'company'"
            :class="['border rounded-xl p-4 flex flex-col items-center gap-2 transition-all', accountType === 'company' ? 'border-[#8B5A2B] bg-[#FAF8F5] ring-1 ring-[#8B5A2B]' : 'border-[#E5E0D8] hover:bg-gray-50']">
            <span class="text-2xl">🏢</span>
            <span class="text-sm font-medium">Empresa</span>
          </button>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <template v-if="accountType === 'natural'">
          <div>
            <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Nombre Completo</label>
            <input v-model="fullName" type="text" placeholder="Juan Pérez" required
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-3 text-[#1C1917]">Tipo de perfil</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" @click="userType = 'developer'"
                :class="['border rounded-lg py-2 text-sm font-medium transition-all', userType === 'developer' ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
                Desarrollador
              </button>
              <button type="button" @click="userType = 'creator'"
                :class="['border rounded-lg py-2 text-sm font-medium transition-all', userType === 'creator' ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
                Creador de Proyectos
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Currículum Vitae (PDF)</label>
            <div class="flex items-center gap-3">
              <label class="cursor-pointer inline-flex">
                <span class="bg-[#8B5A2B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#6B4423] transition-colors">Seleccionar archivo</span>
                <input type="file" accept="application/pdf" @change="onCvChange" class="hidden" />
              </label>
              <span class="text-xs text-gray-500 truncate max-w-[180px]">{{ cvFileName }}</span>
            </div>
          </div>
        </template>

        <template v-if="accountType === 'company'">
          <div>
            <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Nombre de la Empresa</label>
            <input v-model="companyName" type="text" placeholder="Venturia SPA" required
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Dirección</label>
            <input v-model="address" type="text" placeholder="Av. Las Condes 4567" required
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Teléfono</label>
            <input v-model="phone" type="text" placeholder="+56 2 2345 6789" required
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
        </template>

        <div>
          <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Correo electrónico</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Contraseña</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Mínimo 8 caracteres" required minlength="8"
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B5A2B] transition-colors">
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1.5 text-[#1C1917]">Confirmar Contraseña</label>
          <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="Repite tu contraseña" required
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-[#8B5A2B] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors shadow-sm">
          {{ loading ? 'Cargando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <p v-if="error" class="text-red-600 text-sm mt-4 text-center font-medium">{{ error }}</p>

      <template v-if="accountType === 'natural'">
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-[#E5E0D8]" />
          <span class="text-xs text-gray-400">o</span>
          <div class="flex-1 h-px bg-[#E5E0D8]" />
        </div>

        <a :href="googleAuthUrl"
          class="flex items-center justify-center gap-3 w-full border border-[#E5E0D8] bg-white rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-[#FAF8F5] transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </a>
      </template>

      <p class="text-center text-sm text-gray-600 mt-6">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="font-bold text-[#1C1917] underline hover:text-[#8B5A2B] transition-colors">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>