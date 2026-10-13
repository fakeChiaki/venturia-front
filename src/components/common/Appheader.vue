<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const user = computed(() => userStore.profile)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b bg-background">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <router-link to="/feed" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary">Venturia</span>
        </router-link>
        
        <nav v-if="isLoggedIn" class="flex gap-4">
          <router-link 
            to="/feed" 
            class="text-sm font-medium text-muted-foreground hover:text-foreground" 
            active-class="text-foreground font-semibold"
          >
            Feed de Proyectos
          </router-link>
          <router-link 
            to="/projects" 
            class="text-sm font-medium text-muted-foreground hover:text-foreground" 
            active-class="text-foreground font-semibold"
          >
            Mis Proyectos
          </router-link>
          <router-link 
            to="/applications" 
            class="text-sm font-medium text-muted-foreground hover:text-foreground" 
            active-class="text-foreground font-semibold"
          >
            Mis Postulaciones
          </router-link>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <template v-if="isLoggedIn">
          <span class="hidden text-sm font-medium sm:inline-block">{{ user?.fullName }}</span>
          <BaseButton variant="outline" size="sm" @click="handleLogout">Salir</BaseButton>
        </template>
        <template v-else>
          <router-link to="/login">
            <BaseButton size="sm">Iniciar Sesión</BaseButton>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>