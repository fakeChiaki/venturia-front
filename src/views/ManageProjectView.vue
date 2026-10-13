<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { projectService } from '@/services/project.service'
import { applicationService } from '@/services/application.service'
import BaseButton from '@/components/common/BaseButton.vue'
import { applicationStatusLabels } from '@/data/mockData'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

const activeTab = ref('applications')
const isUpdating = ref(false)
const showDeleteConfirm = ref(false)
const showImageModal = ref(false)
const newImageUrl = ref('')
const savingImage = ref(false)
const imageError = ref('')
const loading = ref(true)
const project = ref(null)
const projectApplications = ref([])

const fetchProjectData = async () => {
  loading.value = true
  try {
    const projectId = route.params.id
    const [projResponse, appResponse] = await Promise.all([
      projectService.findOne(projectId),
      applicationService.getProjectApplications(projectId),
    ])
    project.value = projResponse.data
    projectApplications.value = Array.isArray(appResponse.data)
      ? appResponse.data
      : appResponse.data.data || []
  } catch (error) {
    console.error('Error al cargar el panel de gestión:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!profileStore.profile) await profileStore.fetchProfile()
  fetchProjectData()
})

const isOwner = computed(() => {
  if (!profileStore.profile || !project.value) return false
  return (
    profileStore.profile.id === project.value.creatorId ||
    profileStore.profile.id === project.value.creator?.id ||
    profileStore.profile.id === project.value.companyId
  )
})

const pendingApplications = computed(() =>
  projectApplications.value.filter(a => a.status === 'pending' || a.status === 'in_review')
)
const processedApplications = computed(() =>
  projectApplications.value.filter(a => a.status === 'accepted' || a.status === 'rejected')
)

const applicationStatusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
}

const handleAcceptApplication = async (applicationId) => {
  isUpdating.value = true
  try {
    await applicationService.accept(applicationId)
    const app = projectApplications.value.find(a => a.id === applicationId)
    if (app) app.status = 'accepted'
  } catch (error) {
    console.error('Error al aceptar la postulación:', error)
  } finally {
    isUpdating.value = false
  }
}

const handleRejectApplication = async (applicationId) => {
  isUpdating.value = true
  try {
    await applicationService.reject(applicationId)
    const app = projectApplications.value.find(a => a.id === applicationId)
    if (app) app.status = 'rejected'
  } catch (error) {
    console.error('Error al rechazar la postulación:', error)
  } finally {
    isUpdating.value = false
  }
}

const projectStatus = computed({
  get: () => project.value?.status || 'draft',
  set: (val) => { if (project.value) project.value.status = val },
})

const handleStatusChange = async (newStatus) => {
  if (!project.value) return
  isUpdating.value = true
  try {
    await projectService.updateStatus(project.value.id, newStatus)
    project.value.status = newStatus
  } catch (error) {
    console.error('Error al actualizar estado:', error)
  } finally {
    isUpdating.value = false
  }
}

const handlePublish = async () => {
  if (!project.value) return
  isUpdating.value = true
  try {
    await projectService.publish(project.value.id)
    project.value.status = 'open'
  } catch (error) {
    console.error('Error al publicar:', error)
  } finally {
    isUpdating.value = false
  }
}

async function handleUpdateImage() {
  if (!newImageUrl.value.trim()) { imageError.value = 'Ingresa una URL'; return }
  savingImage.value = true
  imageError.value = ''
  try {
    await projectService.update(project.value.id, { imageUrl: newImageUrl.value.trim() })
    project.value.imageUrl = newImageUrl.value.trim()
    showImageModal.value = false
    newImageUrl.value = ''
  } catch (e) {
    imageError.value = e.response?.data?.message || 'Error al actualizar imagen'
  } finally {
    savingImage.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-CL')
}

const handleDeleteProject = async () => {
  try {
    await projectService.remove(project.value.id)
    router.push('/projects')
  } catch (error) {
    console.error('Error al eliminar el proyecto:', error)
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <main v-if="loading" class="flex items-center justify-center py-32">
    <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  </main>

  <main v-else-if="!project" class="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16">
    <h1 class="mb-4 text-2xl font-bold">Proyecto no encontrado</h1>
    <router-link to="/projects"><BaseButton>Volver a Mis Proyectos</BaseButton></router-link>
  </main>

  <main v-else class="min-h-screen bg-[#F9F7F4]">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      <!-- Breadcrumb -->
      <router-link to="/projects"
        class="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Volver a Mis Proyectos
      </router-link>

      <!-- Header -->
      <div class="mb-6 flex items-center gap-4 flex-wrap">
        <!-- Imagen clickeable -->
        <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white group cursor-pointer"
          @click="showImageModal = true">
          <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
            <span class="text-2xl font-bold text-gray-400">{{ project.name.charAt(0) }}</span>
          </div>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>

        <div class="flex-1">
          <h1 class="text-xl font-bold">Gestionar: {{ project.name }}</h1>
          <p class="text-sm text-gray-500">Panel de administración del proyecto</p>
        </div>

        <router-link v-if="project.fundingGoal" :to="`/projects/${project.id}/funding`"
          class="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-medium text-[#8B5A2B] hover:bg-[#FEF3C7] transition-colors">
          Ver financiamiento
        </router-link>
      </div>

      <!-- Estado + acciones -->
      <div class="mb-6 rounded-xl border bg-white px-5 py-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Estado actual:</span>
            <select
              :value="projectStatus"
              :disabled="isUpdating"
              class="rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706] disabled:opacity-50"
              @change="handleStatusChange($event.target.value)"
            >
              <option value="draft">Borrador</option>
              <option value="open">Abierto</option>
              <option value="negotiating">Negociando</option>
              <option value="funded">Financiado</option>
              <option value="seeking_team">Buscando Equipo</option>
              <option value="in_progress">En Progreso</option>
              <option value="cancelled">Cancelado</option>
              <option value="finished">Finalizado</option>
            </select>
            <svg v-if="isUpdating" class="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="project.status === 'draft'"
              @click="handlePublish"
              :disabled="isUpdating"
              class="flex items-center gap-2 rounded-lg bg-[#8B5A2B] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#6B4423] disabled:opacity-50 transition-colors"
            >
              Publicar proyecto
            </button>
            <button
              @click="showDeleteConfirm = true"
              class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            activeTab === 'applications' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black']"
          @click="activeTab = 'applications'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Postulaciones ({{ pendingApplications.length }} pendientes)
        </button>
        <button
          :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black']"
          @click="activeTab = 'history'"
        >
          Historial
        </button>
      </div>

      <!-- Postulaciones pendientes -->
      <div v-if="activeTab === 'applications'" class="rounded-xl border bg-white">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">Postulaciones Pendientes</h2>
          <p class="text-sm text-gray-500">Revisa y gestiona las solicitudes de ingreso al proyecto</p>
        </div>
        <div class="p-5">
          <div v-if="pendingApplications.length > 0" class="space-y-4">
            <div v-for="app in pendingApplications" :key="app.id"
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white text-sm font-semibold">
                  {{ (app.applicantProfile?.fullName || 'U').charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-sm">{{ app.applicantProfile?.fullName || 'Candidato' }}</p>
                  <span v-if="app.role" class="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {{ app.role.name }}
                  </span>
                  <p class="text-xs text-gray-400 mt-0.5">Aplicado el {{ formatDate(app.createdAt) }}</p>
                </div>
              </div>
              <div class="flex shrink-0 gap-2">
                <button @click="handleAcceptApplication(app.id)" :disabled="isUpdating"
                  class="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Aceptar
                </button>
                <button @click="handleRejectApplication(app.id)" :disabled="isUpdating"
                  class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
          <p v-else class="py-8 text-center text-sm text-gray-400">No hay postulaciones pendientes</p>
        </div>
      </div>

      <!-- Historial -->
      <div v-if="activeTab === 'history'" class="rounded-xl border bg-white">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">Historial de Postulaciones</h2>
          <p class="text-sm text-gray-500">Postulaciones procesadas anteriormente</p>
        </div>
        <div class="p-5">
          <div v-if="processedApplications.length > 0" class="space-y-4">
            <div v-for="app in processedApplications" :key="app.id"
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white text-sm font-semibold">
                  {{ (app.applicantProfile?.fullName || 'U').charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-sm">{{ app.applicantProfile?.fullName || 'Candidato' }}</p>
                  <span v-if="app.role" class="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {{ app.role.name }}
                  </span>
                  <p class="text-xs text-gray-400 mt-0.5">Aplicado el {{ formatDate(app.createdAt) }}</p>
                </div>
              </div>
              <span :class="['shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', applicationStatusColors[app.status]]">
                {{ applicationStatusLabels[app.status] }}
              </span>
            </div>
          </div>
          <p v-else class="py-8 text-center text-sm text-gray-400">No hay postulaciones procesadas</p>
        </div>
      </div>

    </div>

    <!-- Modal cambiar imagen -->
    <div v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showImageModal = false; newImageUrl = ''; imageError = ''">
      <div class="w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl">
        <h2 class="text-base font-semibold mb-1">Cambiar imagen del proyecto</h2>
        <p class="text-sm text-gray-500 mb-4">Ingresa la URL de la nueva imagen</p>

        <div v-if="newImageUrl" class="mb-4 h-32 w-full overflow-hidden rounded-lg border bg-gray-50">
          <img :src="newImageUrl" class="h-full w-full object-cover"
            @error="imageError = 'URL inválida o imagen no accesible'" />
        </div>

        <input
          v-model="newImageUrl"
          type="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          class="w-full border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] bg-[#FAF8F5]"
        />
        <p v-if="imageError" class="mt-2 text-xs text-red-500">{{ imageError }}</p>

        <div class="flex justify-end gap-3 mt-5">
          <button @click="showImageModal = false; newImageUrl = ''; imageError = ''"
            class="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="handleUpdateImage" :disabled="savingImage"
            class="px-4 py-2 rounded-lg bg-[#8B5A2B] text-white text-sm font-medium hover:bg-[#6B4423] disabled:opacity-50">
            {{ savingImage ? 'Guardando...' : 'Guardar imagen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showDeleteConfirm = false">
      <div class="w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl">
        <h2 class="text-base font-semibold mb-2">Eliminar Proyecto</h2>
        <p class="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer. Se eliminará permanentemente "{{ project.name }}" y todos sus datos.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false"
            class="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="handleDeleteProject"
            class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </main>
</template>