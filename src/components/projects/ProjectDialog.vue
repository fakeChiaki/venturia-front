<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { applicationService } from '@/services/application.service'
import { methodologyLabels, projectStatusLabels } from '@/data/mockData'

const props = defineProps({
  project: { type: Object, default: null },
  open: { type: Boolean, default: false },
  affinity: { type: Number, default: undefined },
})

const emit = defineEmits(['close', 'applied'])
const router = useRouter()
const authStore = useAuthStore()

const isCompany = computed(() => authStore.user?.type === 'company')
const canFund = computed(() =>
  isCompany.value && ['open', 'negotiating'].includes(props.project?.status)
)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const applying = ref(false)
const applyError = ref('')
const selectedRoleId = ref(null)

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

const affinityClass = computed(() => {
  const a = props.affinity
  if (a === undefined) return ''
  if (a >= 80) return 'bg-green-500 text-white'
  if (a >= 60) return 'bg-yellow-500 text-white'
  return 'bg-gray-500 text-white'
})

function close() {
  applyError.value = ''
  selectedRoleId.value = null
  emit('close')
}

async function handleApply() {
  if (!isAuthenticated.value) { router.push('/login'); return }
  if (!selectedRoleId.value) { applyError.value = 'Selecciona un rol para postular'; return }
  applying.value = true
  applyError.value = ''
  try {
    await applicationService.apply(props.project.id, selectedRoleId.value)
    emit('applied')
    close()
    router.push('/applications')
  } catch (e) {
    applyError.value = e.response?.data?.message || 'Error al postular'
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-overlay">
      <div v-if="open && project" class="fixed inset-0 z-50 bg-black/50" @click="close" />
    </Transition>
    <Transition name="dialog-panel">
      <div v-if="open && project" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl pointer-events-auto">

          <button class="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1 text-gray-500 hover:bg-white hover:text-gray-800" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Imagen -->
          <div class="relative aspect-video w-full overflow-hidden rounded-lg">
            <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
              <span class="text-6xl font-bold text-gray-400">{{ project.name.charAt(0) }}</span>
            </div>
            <div class="absolute left-3 top-3 flex gap-2">
              <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[project.status]">
                {{ projectStatusLabels[project.status] }}
              </span>
              <span v-if="affinity !== undefined" class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="affinityClass">
                {{ affinity }}% Afinidad
              </span>
            </div>
          </div>

          <h2 class="mt-4 text-2xl font-bold">{{ project.name }}</h2>

          <div class="mt-6 space-y-6">

            <!-- Creador -->
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                {{ (project.creatorName ?? project.creator?.fullName ?? '?').charAt(0) }}
              </div>
              <div>
                <p class="text-xs text-gray-500">Creador</p>
                <p class="text-sm font-medium">{{ project.creatorName ?? project.creator?.fullName }}</p>
              </div>
            </div>

            <hr class="border-gray-200" />

            <!-- Descripción -->
            <div>
              <h4 class="mb-2 font-semibold">Descripción</h4>
              <p class="text-sm text-gray-500">{{ project.description }}</p>
            </div>

            <!-- Áreas Técnicas -->
            <div v-if="(project.technicalAreas || []).length">
              <h4 class="mb-2 font-semibold">Áreas Técnicas</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="area in project.technicalAreas"
                  :key="area.id"
                  class="inline-flex items-center rounded-full border border-[#E5E0D8] bg-[#FAF8F5] px-2.5 py-0.5 text-xs font-medium text-gray-700"
                >
                  {{ area.name }}
                </span>
              </div>
            </div>

            <!-- Áreas de Interés -->
            <div v-if="(project.interestAreas || []).length">
              <h4 class="mb-2 font-semibold">Áreas de Interés</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="area in project.interestAreas"
                  :key="area.id"
                  class="inline-flex items-center rounded-full bg-[#F3E9D3] px-2.5 py-0.5 text-xs font-medium text-[#8B5A2B]"
                >
                  {{ area.name }}
                </span>
              </div>
            </div>

            <!-- Roles Requeridos -->
            <div v-if="(project.roleRequirements || []).length">
              <h4 class="mb-2 font-semibold">Roles Requeridos</h4>
              <div class="flex flex-wrap gap-2">
                <BaseBadge v-for="rr in project.roleRequirements" :key="rr.id" variant="secondary">
                  {{ rr.role?.name }}
                  <span v-if="rr.estimatedPay" class="ml-1 text-xs opacity-70">
                    · ${{ Number(rr.estimatedPay).toLocaleString('es-CL') }}
                  </span>
                </BaseBadge>
              </div>
            </div>

            <!-- Metodología y horario -->
            <div v-if="project.methodology || project.weeklyHours" class="grid grid-cols-2 gap-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-4">
              <div v-if="project.methodology">
                <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Metodología</p>
                <p class="mt-0.5 text-sm font-semibold text-[#1C1917]">
                  {{ methodologyLabels[project.methodology] ?? project.methodology }}
                </p>
              </div>
              <div v-if="project.weeklyHours">
                <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Horas semanales</p>
                <p class="mt-0.5 text-sm font-semibold text-[#1C1917]">{{ project.weeklyHours }}h</p>
              </div>
            </div>

            <!-- Postular como (developer) -->
            <template v-if="project.status === 'seeking_team' && isAuthenticated && !isCompany">
              <hr class="border-gray-200" />
              <div>
                <h4 class="mb-2 font-semibold">Postular como</h4>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="rr in project.roleRequirements"
                    :key="rr.id"
                    type="button"
                    @click="selectedRoleId = rr.roleId"
                    :class="['px-3 py-1.5 rounded-full text-sm border transition-colors',
                      selectedRoleId === rr.roleId
                        ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#8B5A2B]']"
                  >
                    {{ rr.role?.name }}
                  </button>
                </div>
                <p v-if="applyError" class="mt-2 text-sm text-red-500">{{ applyError }}</p>
              </div>
            </template>

            <hr class="border-gray-200" />

            <!-- Botones -->
            <div class="flex gap-3">
              <BaseButton variant="outline" class="flex-1" @click="close">Cerrar</BaseButton>

              <BaseButton
                v-if="canFund"
                class="flex-1 bg-[#8B5A2B] text-white hover:bg-[#6B4423]"
                @click="() => { close(); router.push(`/projects/${project.id}/offer`) }"
              >
                Financiar proyecto
              </BaseButton>

              <BaseButton
                v-else-if="project.status === 'seeking_team' && !isCompany"
                class="flex-1 bg-[#8B5A2B] text-white hover:bg-[#6B4423]"
                :disabled="applying"
                @click="handleApply"
              >
                <span v-if="applying">Enviando...</span>
                <span v-else-if="!isAuthenticated">Iniciar Sesión para Aplicar</span>
                <span v-else>Postular</span>
              </BaseButton>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>