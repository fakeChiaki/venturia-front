<script setup>
import { ref, computed, onMounted } from 'vue'
import { applicationService } from '@/services/application.service'
import { projectService } from '@/services/project.service'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const isCreator = computed(() =>
  authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'creator'
)
const isDeveloper = computed(() =>
  authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'developer'
)

const activeTab = ref('sent')
const applications = ref([])
const receivedApplications = ref([])
const loading = ref(true)
const error = ref(null)

const fetchApplications = async () => {
  loading.value = true; error.value = null
  try {
    if (isCreator.value) {
      const projRes = await projectService.findAll()
      const projects = Array.isArray(projRes.data) ? projRes.data : projRes.data.data || []
      const allApps = []
      for (const project of projects) {
        try {
          const appRes = await applicationService.getProjectApplications(project.id)
          const apps = Array.isArray(appRes.data) ? appRes.data : appRes.data.data || []
          apps.forEach(a => allApps.push({ ...a, projectName: project.name, projectImage: project.imageUrl }))
        } catch (e) { /* skip */ }
      }
      receivedApplications.value = allApps
    } else {
      const response = await applicationService.getMyApplications()
      applications.value = response.data
    }
  } catch (err) {
    console.error('Error al cargar postulaciones:', err)
    error.value = 'No pudimos cargar tu historial de postulaciones.'
  } finally { loading.value = false }
}

onMounted(async () => {
  if (isCreator.value) activeTab.value = 'received'
  fetchApplications()
})

const sentApplications = computed(() => applications.value)

const statusColors = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_review: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted:  'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
}
const applicationStatusLabels = {
  pending: 'Pendiente', in_review: 'En Revisión', accepted: 'Aceptada', rejected: 'Rechazada'
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-CL')
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="flex items-center gap-3 text-3xl font-bold text-[#1C1917]">
        <span class="text-[#8B5A2B]">⏱</span>
        {{ isCreator ? 'Postulaciones Recibidas' : 'Historial de Postulaciones' }}
      </h1>
      <p class="text-gray-500">
        {{ isCreator
          ? 'Revisa las postulaciones que han llegado a tus proyectos'
          : 'Revisa el estado de tus postulaciones enviadas' }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button v-if="isDeveloper" @click="activeTab = 'sent'"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'sent' ? 'bg-white border border-[#E5E0D8] text-[#1C1917] shadow-sm' : 'bg-transparent text-gray-500 hover:text-[#1C1917]']">
        Enviadas ({{ sentApplications.length }})
      </button>
      <button v-if="isCreator" @click="activeTab = 'received'"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'received' ? 'bg-white border border-[#E5E0D8] text-[#1C1917] shadow-sm' : 'bg-transparent text-gray-500 hover:text-[#1C1917]']">
        Recibidas ({{ receivedApplications.length }})
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <template v-else>
      <!-- Enviadas (developer) -->
      <div v-if="activeTab === 'sent'" class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-3">
          <div v-for="(stat, idx) in [
            { color:'bg-yellow-50 text-yellow-700', icon:'⏱', label:'Pendientes', count: sentApplications.filter(a=>a.status==='pending').length },
            { color:'bg-green-50 text-green-700',  icon:'✓',  label:'Aceptadas',  count: sentApplications.filter(a=>a.status==='accepted').length },
            { color:'bg-red-50 text-red-700',      icon:'✕',  label:'Rechazadas', count: sentApplications.filter(a=>a.status==='rejected').length }
          ]" :key="idx" class="flex items-center gap-4 bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm">
            <div :class="['flex h-10 w-10 items-center justify-center rounded-full', stat.color]">
              <span class="text-lg">{{ stat.icon }}</span>
            </div>
            <div>
              <p class="text-2xl font-bold">{{ stat.count }}</p>
              <p class="text-xs text-gray-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div v-if="sentApplications.length > 0" class="space-y-4">
          <div v-for="app in sentApplications" :key="app.id"
            class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
            <div class="flex flex-col sm:flex-row">
              <div class="relative h-32 w-full shrink-0 overflow-hidden sm:h-auto sm:w-40">
                <img v-if="app.project?.imageUrl" :src="app.project.imageUrl" :alt="app.project.name" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center bg-[#FAF8F5]">
                  <span class="text-2xl font-bold text-gray-300">{{ (app.project?.name || '?').charAt(0) }}</span>
                </div>
              </div>
              <div class="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div class="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h3 class="font-semibold text-[#1C1917]">{{ app.project?.name }}</h3>
                      <div v-if="app.role" class="mt-1 flex flex-wrap gap-1">
                        <span class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B]">
                          {{ app.role.name }}
                        </span>
                      </div>
                    </div>
                    <span :class="['shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border', statusColors[app.status]]">
                      {{ applicationStatusLabels[app.status] }}
                    </span>
                  </div>
                  <p v-if="app.message" class="mb-2 text-sm text-gray-600">"{{ app.message }}"</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-[#E5E0D8]">
                  <p class="text-xs text-gray-500">Aplicado el {{ formatDate(app.createdAt) }}</p>
                  <router-link v-if="app.status === 'accepted'" :to="`/projects/${app.projectId}`">
                    <button class="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-[#FAF8F5] transition-colors">
                      ↗ Ver Proyecto
                    </button>
                  </router-link>
                  <router-link v-else-if="app.status === 'rejected'" :to="`/projects/${app.projectId}`">
                    <button class="inline-flex items-center gap-2 rounded-lg border border-[#8B5A2B] bg-white px-3 py-1.5 text-sm font-medium text-[#8B5A2B] hover:bg-[#FEF3C7] transition-colors">
                      ↻ Volver a postular
                    </button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#E5E0D8] py-12">
          <p class="text-lg font-medium text-[#1C1917]">No has enviado postulaciones</p>
          <p class="mb-4 text-sm text-gray-500">Explora proyectos y aplica a los que te interesen</p>
          <router-link to="/feed">
            <button class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] transition-colors">
              Explorar Proyectos
            </button>
          </router-link>
        </div>
      </div>

      <!-- Recibidas (creator) -->
      <div v-else-if="activeTab === 'received'" class="space-y-4">
        <div v-if="receivedApplications.length > 0" class="space-y-4">
          <div v-for="app in receivedApplications" :key="app.id"
            class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1917] text-[#CDB06D] text-sm font-semibold">
                {{ (app.applicantProfile?.fullName || 'U').charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-sm text-[#1C1917]">{{ app.applicantProfile?.fullName || 'Candidato' }}</p>
                <span v-if="app.role" class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2 py-0.5 text-xs font-medium text-[#8B5A2B]">
                  {{ app.role.name }}
                </span>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ app.projectName }} · {{ formatDate(app.createdAt) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span :class="['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border', statusColors[app.status]]">
                {{ applicationStatusLabels[app.status] }}
              </span>
              <router-link :to="`/projects/${app.projectId}/manage`">
                <button class="inline-flex items-center gap-1 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5] transition-colors">
                  Gestionar
                </button>
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#E5E0D8] py-12">
          <p class="text-lg font-medium text-[#1C1917]">No has recibido postulaciones</p>
          <p class="mb-4 text-sm text-gray-500">Publica un proyecto para empezar a recibir candidatos</p>
          <router-link to="/projects/new">
            <button class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] transition-colors">
              Crear Proyecto
            </button>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>