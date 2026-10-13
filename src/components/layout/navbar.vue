<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useProfileStore } from '../../stores/profile'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const isLoggedIn = computed(() => !!authStore.user)
const userType = computed(() => authStore.user?.type)
const userSubtype = computed(() => profileStore.profile?.subtype)

const isCreator = computed(() => userType.value === 'natural_person' && userSubtype.value === 'creator')
const isDeveloper = computed(() => userType.value === 'natural_person' && userSubtype.value === 'developer')
const isCompany = computed(() => userType.value === 'company')

const minimalRoutes = ['login', 'register', 'onboarding', 'auth-callback']
const isMinimal = computed(() => minimalRoutes.includes(route.name))

function logout() {
  authStore.logout()
  router.replace('/')
}
</script>

<template>
  <!-- MODO MINIMAL -->
  <header v-if="isMinimal" class="bg-[#FAF8F5] border-b border-[#E5E0D8]">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center">
      <router-link to="/" class="flex items-center gap-2 font-bold text-lg tracking-tight text-[#1C1917]">
        <div class="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center text-xs font-bold">V</div>
        VENTURIA
      </router-link>
    </div>
  </header>

  <!-- MODO COMPLETO -->
  <header v-else class="bg-[#FAF8F5] border-b border-[#E5E0D8]">
    <div class="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center relative">
      <!-- Logo (izquierda) -->
      <router-link :to="isLoggedIn ? '/feed' : '/'" class="flex items-center gap-2 font-bold text-lg tracking-tight text-[#1C1917] z-10">
        <div class="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center text-xs font-bold">V</div>
        <span v-if="!isLoggedIn">VENTURIA</span>
        <span v-else>Venturia</span>
      </router-link>

      <nav v-if="isLoggedIn" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
        
        <!-- Todos ven el feed -->
        <router-link to="/feed" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
          Explorar
        </router-link>

        <!-- Creator: ve sus proyectos, no postulaciones -->
        <template v-if="isCreator">
          <router-link to="/projects" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mis Proyectos
          </router-link>
          <router-link to="/applications" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Postulaciones
          </router-link>
          <router-link to="/profile" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mi Perfil
          </router-link>
        </template>

        <template v-else-if="isDeveloper">
          <router-link to="/projects" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mis Proyectos
          </router-link>
          <router-link to="/applications" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mis Postulaciones
          </router-link>
          <router-link to="/profile" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mi Perfil
          </router-link>
        </template>

        <!-- Empresa: solo feed y perfil, sin postulaciones -->
        <template v-else-if="isCompany">
          <router-link to="/profile" active-class="text-[#1C1917] font-semibold" class="hover:text-[#8B5A2B] transition-colors">
            Mi Perfil
          </router-link>
        </template>

      </nav>

      <!-- Centro: navegación pública -->
      <nav v-else class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
      </nav>

      <!-- Derecha: acciones -->
      <div class="ml-auto flex items-center gap-4 z-10">
        <template v-if="isLoggedIn">
          <button @click="logout" class="inline-flex items-center justify-center rounded-lg border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#F3E9D3] hover:text-[#8B5A2B] transition-colors shadow-sm">
            Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <router-link
            v-if="route.name !== 'login'"
            to="/login"
            class="text-sm font-medium text-gray-600 hover:text-[#8B5A2B] transition-colors"
          >
            Iniciar Sesión
          </router-link>
          <router-link
            v-if="route.name !== 'register'"
            to="/register"
            class="inline-flex items-center justify-center rounded-lg bg-[#8B5A2B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6B4423] transition-colors"
          >
            Crear cuenta
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>