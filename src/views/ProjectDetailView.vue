<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { projectService } from '@/services/project.service'
import { applicationService } from '@/services/application.service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const isCompany = computed(() => authStore.user?.type === 'company')

const isNatural = computed(() => authStore.user?.type === 'natural_person')
const isOwner = computed(() =>
  profileStore.profile && project.value &&
  profileStore.profile.id === project.value.creatorId
)

const project = ref(null)
const loading = ref(true)
const loadError = ref(null)
const isApplying = ref(false)
const applyError = ref(null)
const applied = ref(false)
const selectedRoleId = ref(null)

const methodologyLabels = {
  scrum: 'Scrum', kanban: 'Kanban', scrumban: 'Scrumban',
  xp: 'XP', waterfall: 'Waterfall', lean: 'Lean',
}

const statusColors = {
  draft:        'bg-gray-100 text-gray-700',
  published:    'bg-green-100 text-green-800',
  open:         'bg-green-100 text-green-800',
  in_progress:  'bg-blue-100 text-blue-800',
  seeking_team: 'bg-purple-100 text-purple-800',
  negotiating:  'bg-yellow-100 text-yellow-800',
  funded:       'bg-emerald-100 text-emerald-800',
  cancelled:    'bg-red-100 text-red-800',
  finished:     'bg-gray-100 text-gray-800',
}

const statusLabels = {
  draft: 'Borrador', published: 'Publicado', open: 'Abierto',
  in_progress: 'En Progreso', seeking_team: 'Buscando Equipo',
  negotiating: 'Negociando', funded: 'Financiado',
  cancelled: 'Cancelado', finished: 'Finalizado',
}

onMounted(async () => {
  if (!profileStore.profile) profileStore.fetchProfile()
  try {
    const res = await projectService.findOne(route.params.id)
    project.value = res.data
    if (project.value.roleRequirements?.length) {
      selectedRoleId.value = project.value.roleRequirements[0].roleId
        ?? project.value.roleRequirements[0].id
    }
  } catch (err) {
    loadError.value = err?.response?.status === 404
      ? 'Proyecto no encontrado.'
      : 'Error al cargar el proyecto. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

async function handleApply() {
  if (!selectedRoleId.value) return
  isApplying.value = true
  applyError.value = null
  try {
    await applicationService.apply(project.value.id, selectedRoleId.value)
    applied.value = true
    setTimeout(() => router.push('/applications'), 1500)
  } catch (err) {
    applyError.value = err?.response?.data?.message ?? 'Error al enviar la postulación.'
  } finally {
    isApplying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F7F4]">
    <!-- Topbar -->
    <div class="border-b bg-white px-4 py-3">
      <div class="mx-auto flex max-w-3xl items-center gap-3">
        <button
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>
        <span class="text-gray-400">/</span>
        <span class="text-sm font-medium truncate">{{ project?.name ?? 'Detalle del proyecto' }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="mx-auto max-w-3xl px-4 py-20 text-center">
      <p class="mb-4 text-gray-500">{{ loadError }}</p>
      <button @click="router.back()" class="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Volver</button>
    </div>

    <!-- Contenido -->
    <div v-else-if="project" class="mx-auto max-w-3xl space-y-4 px-4 py-8">

      <!-- Imagen -->
      <div class="relative aspect-video w-full overflow-hidden rounded-xl border bg-white">
        <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-full w-full object-cover" />
        <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
          <span class="text-7xl font-bold text-gray-300">{{ project.name?.charAt(0) }}</span>
        </div>
        <div class="absolute left-3 top-3">
          <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[project.status]">
            {{ statusLabels[project.status] ?? project.status }}
          </span>
        </div>
      </div>

      <!-- Título y empresa/creador -->
      <div>
        <h1 class="text-2xl font-bold">{{ project.name }}</h1>
        <div v-if="project.creatorProfile || project.creator" class="mt-1 flex items-center gap-2">
          <div class="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A5F] text-white text-xs font-bold">
            V
          </div>
          <span class="text-sm text-gray-500">
            {{ project.creatorProfile?.fullName ?? project.creator?.fullName ?? 'Venturia SPA' }}
          </span>
        </div>
      </div>

      <!-- Descripción pública -->
      <div class="rounded-xl border border-[#D97706] bg-white p-5">
        <h3 class="font-semibold mb-2">Descripción del Proyecto</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ project.description }}</p>
      </div>

      <!-- Descripción privada (solo dueño) -->
      <div v-if="isOwner && project.privateDescription"
        class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <h3 class="font-semibold text-gray-700">Descripción Privada</h3>
          <span class="text-xs text-gray-400">(solo visible para ti)</span>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">{{ project.privateDescription }}</p>
      </div>

      <!-- Áreas técnicas -->
      <div v-if="project.technicalAreas?.length" class="rounded-xl border border-[#D97706] bg-white p-5">
        <h3 class="font-semibold mb-3">Áreas Técnicas</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="area in project.technicalAreas"
            :key="area.id ?? area"
            class="px-3 py-1 rounded-full text-sm border border-gray-200 bg-gray-50 text-gray-700"
          >
            {{ area.name ?? area }}
          </span>
        </div>
      </div>

      <!-- Roles requeridos -->
      <div v-if="project.roleRequirements?.length" class="rounded-xl border border-[#D97706] bg-white p-5">
        <h3 class="font-semibold mb-3">Roles Requeridos</h3>
        <div class="space-y-3">
          <div
            v-for="req in project.roleRequirements"
            :key="req.id ?? req.roleId"
            class="flex items-center justify-between rounded-lg border border-[#D97706]/30 bg-[#FEF3C7]/30 px-4 py-3"
          >
            <div>
              <p class="font-medium text-sm">{{ req.role?.name ?? req.roleId }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ req.quantity ?? 1 }} {{ (req.quantity ?? 1) === 1 ? 'persona' : 'personas' }}
                <span v-if="req.weeklyHours"> · {{ req.weeklyHours }}h/sem</span>
              </p>
            </div>
            <span v-if="req.estimatedPay" class="text-sm font-semibold text-green-700">
              ${{ Number(req.estimatedPay).toLocaleString('es-CL') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Metodología y horas -->
      <div v-if="project.methodology || project.weeklyHours"
        class="grid grid-cols-2 gap-4 rounded-xl border border-[#D97706] bg-white p-5">
        <div v-if="project.methodology">
          <p class="text-xs uppercase tracking-wide text-gray-400 font-medium">Metodología</p>
          <p class="mt-1 text-sm font-semibold">{{ methodologyLabels[project.methodology] ?? project.methodology }}</p>
        </div>
        <div v-if="project.weeklyHours">
          <p class="text-xs uppercase tracking-wide text-gray-400 font-medium">Horas Semanales</p>
          <p class="mt-1 text-sm font-semibold">{{ project.weeklyHours }}h</p>
        </div>
      </div>

      <!-- Acción postular (solo persona natural, proyecto en seeking_team o published) -->
      <div
        v-if="isNatural && ['published', 'open', 'seeking_team'].includes(project.status)"
        class="rounded-xl border border-[#D97706] bg-white p-5"
      >
        <h3 class="font-semibold mb-3">¿Te interesa este proyecto?</h3>

        <div v-if="applied" class="rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-700 mb-4">
          ✓ Postulación enviada. Redirigiendo...
        </div>
        <p v-if="applyError" class="mb-3 text-sm text-red-600">{{ applyError }}</p>

        <div v-if="project.roleRequirements?.length" class="mb-4">
          <label class="block text-sm font-medium mb-1">Rol al que postulas</label>
          <select
            v-model="selectedRoleId"
            class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D97706]"
          >
            <option
              v-for="req in project.roleRequirements"
              :key="req.roleId ?? req.id"
              :value="req.roleId ?? req.id"
            >
              {{ req.role?.name ?? req.roleId }}
            </option>
          </select>
        </div>

                <!-- Botón financiar (solo empresa, proyecto open/negotiating) -->
        <div v-if="isCompany && ['open', 'negotiating'].includes(project.status)"
          class="rounded-xl border border-[#D97706] bg-white p-5">
          <h3 class="font-semibold mb-1">¿Quieres financiar este proyecto?</h3>
          <p class="text-sm text-gray-500 mb-4">Realiza una oferta al creador. Pueden negociar hasta llegar a un acuerdo.</p>
          <router-link :to="`/projects/${project.id}/offer`"
            class="block w-full text-center bg-[#8B5A2B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6B4423] transition-colors">
            Hacer oferta de financiamiento
          </router-link>
        </div>

        <button
          v-if="!applied"
          :disabled="isApplying || !selectedRoleId"
          @click="handleApply"
          class="w-full bg-[#B45309] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#92400E] disabled:opacity-50 transition-colors"
        >
          {{ isApplying ? 'Enviando...' : 'Postularme al Proyecto' }}
        </button>
      </div>

    </div>
  </div>
</template>