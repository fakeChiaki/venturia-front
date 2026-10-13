<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { projectService } from '@/services/project.service'
import { applicationService } from '@/services/application.service'
import { projectStatusLabels } from '@/data/mockData'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const isCreator = computed(() => authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'creator')
const isDeveloper = computed(() => authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'developer')

const activeTab = ref('owned')
const deleteConfirmId = ref(null)
const expandedRolesId = ref(null)
const loading = ref(true)
const ownedProjects = ref([])
const memberProjects = ref([])

function toggleRoles(projectId) {
  expandedRolesId.value = expandedRolesId.value === projectId ? null : projectId
}
function closeRoles() { expandedRolesId.value = null }
onUnmounted(() => document.removeEventListener('click', closeRoles))

const fetchProjects = async () => {
  loading.value = true
  try {
    if (isDeveloper.value) {
      // Developer: solo proyectos donde fue aceptado
      const res = await applicationService.getMyApplications()
      const apps = Array.isArray(res.data) ? res.data : res.data.data || []
      memberProjects.value = apps
        .filter(a => a.status === 'accepted' && a.project)
        .map(a => ({ ...a.project, myRole: a.role?.name }))
      activeTab.value = 'member'
    } else if (isCreator.value) {
      // Creator: sus proyectos creados
      const response = await projectService.findAll()
      ownedProjects.value = Array.isArray(response.data) ? response.data : response.data.data || []
      activeTab.value = 'owned'
    }
  } catch (error) {
    console.error('Error al cargar proyectos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
  document.addEventListener('click', closeRoles)
})

const statusColors = {
  draft:        'bg-gray-100 text-gray-700',
  open:         'bg-green-100 text-green-800',
  negotiating:  'bg-yellow-100 text-yellow-800',
  funded:       'bg-emerald-100 text-emerald-800',
  seeking_team: 'bg-purple-100 text-purple-800',
  in_progress:  'bg-blue-100 text-blue-800',
  cancelled:    'bg-red-100 text-red-800',
  finished:     'bg-gray-100 text-gray-800',
}

const handleDeleteProject = async () => {
  if (!deleteConfirmId.value) return
  try {
    await projectService.remove(deleteConfirmId.value)
    ownedProjects.value = ownedProjects.value.filter(p => p.id !== deleteConfirmId.value)
    deleteConfirmId.value = null
  } catch (error) {
    console.error('Error al eliminar', error)
    deleteConfirmId.value = null
  }
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-[#1C1917]">
          {{ isDeveloper ? 'Mis Proyectos' : 'Mis Proyectos' }}
        </h1>
        <p class="text-gray-500 mt-1">
          {{ isDeveloper
            ? 'Proyectos en los que participas como miembro del equipo'
            : 'Gestiona tus proyectos creados' }}
        </p>
      </div>
      <router-link v-if="isCreator" to="/projects/new">
        <BaseButton>
          <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Crear Proyecto
        </BaseButton>
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>

    <template v-else>
      <!-- ===== CREATOR: sus proyectos ===== -->
      <template v-if="isCreator">
        <div v-if="ownedProjects.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="project in ownedProjects" :key="project.id"
            class="group rounded-2xl border border-[#E5E0D8] bg-white flex flex-col shadow-sm">
            <div class="relative aspect-video overflow-hidden rounded-t-2xl">
              <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center bg-[#FAF8F5]">
                <span class="text-4xl font-bold text-gray-300">{{ project.name.charAt(0) }}</span>
              </div>
              <div class="absolute left-2 top-2">
                <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[project.status]]">
                  {{ projectStatusLabels[project.status] }}
                </span>
              </div>
            </div>
            <div class="p-4 pb-2 flex-1">
              <h3 class="line-clamp-1 font-semibold text-[#1C1917]">{{ project.name }}</h3>
              <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ project.description }}</p>
              <div class="mt-3 flex flex-wrap gap-1 items-center">
                <span v-for="rr in (project.roleRequirements || []).slice(0, 2)" :key="rr.roleId"
                  class="inline-flex items-center rounded-md bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
                  {{ rr.role?.name || rr.roleId }}
                </span>
                <div v-if="(project.roleRequirements || []).length > 2" class="relative">
                  <button @click.stop="toggleRoles(project.id)"
                    class="inline-flex items-center rounded-md bg-gray-200 text-gray-600 px-2 py-0.5 text-xs font-medium hover:bg-gray-300 transition-colors">
                    +{{ project.roleRequirements.length - 2 }}
                  </button>
                  <div v-if="expandedRolesId === project.id"
                    class="absolute left-0 top-6 z-10 bg-white border rounded-lg shadow-lg p-2 min-w-max">
                    <p v-for="rr in project.roleRequirements" :key="rr.roleId"
                      class="px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded">
                      {{ rr.role?.name || rr.roleId }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-auto flex gap-2 border-t border-[#E5E0D8] p-4 pt-3">
              <router-link :to="`/projects/${project.id}`" class="flex-1">
                <BaseButton variant="outline" class="w-full" size="sm">
                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Ver
                </BaseButton>
              </router-link>
              <router-link :to="`/projects/${project.id}/manage`">
                <BaseButton variant="outline" size="sm" title="Gestionar">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </BaseButton>
              </router-link>
              <BaseButton variant="outline" size="sm" class="text-destructive hover:text-destructive"
                @click="deleteConfirmId = project.id" title="Eliminar">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E0D8] py-20 text-center">
          <p class="text-lg font-medium text-[#1C1917]">No tienes proyectos creados</p>
          <p class="mb-6 text-sm text-gray-500">Crea tu primer proyecto para empezar</p>
          <router-link to="/projects/new">
            <BaseButton>
              <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Crear Proyecto
            </BaseButton>
          </router-link>
        </div>
      </template>

      <!-- ===== DEVELOPER: proyectos donde participa ===== -->
      <template v-else-if="isDeveloper">
        <div v-if="memberProjects.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="project in memberProjects" :key="project.id"
            class="rounded-2xl border border-[#E5E0D8] bg-white flex flex-col overflow-hidden shadow-sm">
            <div class="relative aspect-video overflow-hidden bg-[#FAF8F5]">
              <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center">
                <span class="text-4xl font-bold text-gray-300">{{ project.name?.charAt(0) }}</span>
              </div>
              <span :class="['absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[project.status]]">
                {{ projectStatusLabels[project.status] }}
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <h3 class="font-semibold text-[#1C1917] line-clamp-1">{{ project.name }}</h3>
              <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ project.description }}</p>
              <div class="mt-3">
                <span class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2.5 py-0.5 text-xs font-medium text-[#8B5A2B]">
                  {{ project.myRole }}
                </span>
              </div>
              <div class="mt-auto pt-4">
                <router-link :to="`/projects/${project.id}`" class="block">
                  <button class="w-full rounded-lg border border-[#E5E0D8] bg-white py-2 text-sm font-medium text-gray-700 hover:bg-[#FAF8F5] transition-colors">
                    Ver Proyecto
                  </button>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E0D8] py-20 text-center">
          <p class="text-lg font-medium text-[#1C1917]">No participas en ningún proyecto aún</p>
          <p class="mt-1 mb-6 text-sm text-gray-500">Cuando seas aceptado en un proyecto aparecerá aquí.</p>
          <router-link to="/feed">
            <button class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] transition-colors">
              Explorar Proyectos
            </button>
          </router-link>
        </div>
      </template>
    </template>

    <!-- Modal eliminar -->
    <div v-if="deleteConfirmId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="deleteConfirmId = null">
      <div class="w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl">
        <h2 class="text-base font-semibold mb-2">Eliminar Proyecto</h2>
        <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer. El proyecto y todos sus datos serán eliminados permanentemente.</p>
        <div class="flex justify-end gap-3">
          <button @click="deleteConfirmId = null" class="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button @click="handleDeleteProject" class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>
  </main>
</template>