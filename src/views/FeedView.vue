<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectDialog from '@/components/projects/ProjectDialog.vue'
import ProjectFilters from '@/components/projects/ProjectFilters.vue'
import api from '@/services/api'
const authStore = useAuthStore()
const isCreator = computed(() => authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'creator')
const isDeveloper = computed(() => authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'developer')
import { projectService } from '@/services/project.service'

const profileStore = useProfileStore()
const user = computed(() => profileStore.profile)
const rolesExpanded = ref(false)

function closeRoles() { rolesExpanded.value = false }

const filters = ref({})
const projects = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('recommended')

const isDialogOpen = ref(false)
const selectedProject = ref(null)
const selectedAffinity = ref(undefined)

const fetchProjects = async () => {
  loading.value = true
  error.value = null
  try {
    const f = filters.value
    const urlParams = new URLSearchParams()
    if (f.areaTecnica) urlParams.append('areaTecnica', f.areaTecnica)
    if (f.metodologia) urlParams.append('metodologia', f.metodologia)
    if (f.disponibilidadMin) urlParams.append('disponibilidadMin', f.disponibilidadMin)
    if (f.roleIds?.length) f.roleIds.forEach(id => urlParams.append('roleIds', id))
    if (f.interestAreaIds?.length) f.interestAreaIds.forEach(id => urlParams.append('interestAreaIds', id))

    const query = urlParams.toString()
    const response = await api.get(query ? `/feed?${query}` : '/feed')
    const items = response.data.data || []

    projects.value = items.map(item => ({
      affinity: item.affinityScore ?? undefined,
      project: {
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        status: item.status,
        methodology: item.methodology,
        weeklyHours: item.weeklyHours,
        creatorName: item.creatorName,
        technicalArea: null,
        roleRequirements: [],
        technicalAreaIds: item.technicalAreaIds || [],
      }
    }))
  } catch (err) {
    console.error('ERROR COMPLETO:', err.response?.data?.message)
    error.value = 'Error al cargar los proyectos'
  } finally {
    loading.value = false
  }
}

const isCompany = computed(() => authStore.user?.type === 'company')

const displayName = computed(() => {
  if (isCompany.value) return user.value?.companyName || 'Empresa'
  return user.value?.fullName || 'Usuario'
})

const filteredProjects = computed(() => {
  let result = projects.value
  if (activeTab.value === 'recommended' && user.value) {
    const hasAffinity = result.some(p => p.affinity !== undefined && p.affinity !== null)
    if (hasAffinity) result = result.filter(p => p.affinity > 50)
  }
  return result
})

async function openDialog(project, affinity) {
  selectedProject.value = project
  selectedAffinity.value = affinity
  isDialogOpen.value = true
  try {
    const res = await projectService.findOne(project.id)
    selectedProject.value = res.data
  } catch (e) {
    console.error('Error cargando detalle:', e)
  }
}

function closeDialog() {
  isDialogOpen.value = false
  selectedProject.value = null
}

onMounted(async () => {
  if (!profileStore.profile) profileStore.fetchProfile().catch(() => {})
   console.log('PROFILE:', JSON.stringify(profileStore.profile, null, 2))
  if (authStore.user?.type === 'natural_person') {
    try { await api.post('/affinity/compute') } catch (e) { /* silencioso */ }
  }
  fetchProjects()
  document.addEventListener('click', closeRoles)
})
onUnmounted(() => { document.removeEventListener('click', closeRoles) })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
    <div class="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
      <!-- Sidebar -->
      <div class="flex flex-col gap-6">
        <!-- Sidebar card de usuario -->
          <div class="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-[#1C1917] overflow-hidden flex items-center justify-center text-[#CDB06D] font-bold text-lg flex-shrink-0">
                <img v-if="user?.photoUrl" :src="user.photoUrl" class="h-full w-full object-cover" />
                <span v-else>{{ displayName.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-[#1C1917] truncate">{{ displayName }}</h3>
                <!-- Empresa -->
                <div v-if="isCompany" class="mt-1">
                  <span class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B]">
                    🏢 Empresa
                  </span>
                </div>
                <!-- Developer: muestra roles -->
                <div v-else-if="(user?.roles || []).length" class="relative mt-1 flex gap-1">
                  <span class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B]">
                    {{ user.roles[0].name }}
                  </span>
                  <button v-if="user.roles.length > 1" @click.stop="rolesExpanded = !rolesExpanded"
                    class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B] hover:bg-[#ead6b5]">
                    +{{ user.roles.length - 1 }}
                  </button>
                  <div v-if="rolesExpanded" class="absolute left-0 top-7 z-20 flex flex-col gap-1 rounded-lg border border-[#E5E0D8] bg-white p-2 shadow-lg" @click.stop>
                    <span v-for="role in user.roles" :key="role.id"
                      class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B] whitespace-nowrap">
                      {{ role.name }}
                    </span>
                  </div>
                </div>
                <!-- Creator -->
                <div v-else class="mt-1">
                  <span class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B]">
                    Creador de Proyecto
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ProjectFilters 
            v-model="filters" 
            :hideRoles="isCreator" 
            @change="fetchProjects" 
          />
      </div>

      <!-- Main -->
      <div class="flex flex-col gap-6">
        <h1 class="text-3xl font-bold tracking-tight text-[#1C1917]">Explorar Proyectos</h1>
        <p v-if="isDeveloper" class="text-sm text-gray-500">Ordenados por afinidad con tu perfil técnico</p>

        <div class="flex space-x-4 border-b border-[#E5E0D8]">
          <button @click="activeTab = 'recommended'"
            :class="['pb-2 text-sm font-medium transition-colors', activeTab === 'recommended' ? 'border-b-2 border-[#8B5A2B] text-[#8B5A2B]' : 'text-gray-500 hover:text-[#1C1917]']">
            Recomendados para ti
          </button>
          <button @click="activeTab = 'all'"
            :class="['pb-2 text-sm font-medium transition-colors', activeTab === 'all' ? 'border-b-2 border-[#8B5A2B] text-[#8B5A2B]' : 'text-gray-500 hover:text-[#1C1917]']">
            Todos los proyectos
          </button>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-500">Cargando proyectos de la base de datos...</div>
        <div v-else-if="error" class="text-red-600 text-center py-10">{{ error }}</div>

        <div v-else-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E0D8] py-16 text-center">
          <p class="text-lg font-medium text-[#1C1917]">
            {{ isDeveloper ? 'Aún no hay proyectos buscando equipo' : 'No hay proyectos disponibles' }}
          </p>
          <p class="mt-1 text-sm text-gray-500 max-w-md">
            {{ isDeveloper
              ? 'Los proyectos aparecen aquí cuando consiguen financiamiento y abren sus vacantes. Vuelve pronto.'
              : 'Cuando se publiquen nuevos proyectos aparecerán en este feed.' }}
          </p>
        </div>

        <TransitionGroup v-else name="card" tag="div" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <ProjectCard v-for="({ project, affinity }, i) in filteredProjects" :key="project.id"
            :project="project" :affinity="affinity" :index="i" :isCompany="isCompany" @click="openDialog(project, affinity)" />
        </TransitionGroup>
      </div>
    </div>
  </div>

  <ProjectDialog :project="selectedProject" :open="isDialogOpen" :affinity="selectedAffinity" @close="closeDialog" />
</template>