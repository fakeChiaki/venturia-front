<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fundingService } from '@/services/funding.service'
import { projectService } from '@/services/project.service'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)
const offers = ref([])
const loading = ref(true)
const error = ref('')

const counterForm = ref({ offerId: null, amount: '', message: '' })
const showCounterModal = ref(false)
const saving = ref(false)

const totalFunded = computed(() =>
  offers.value
    .filter(o => o.status === 'accepted')
    .reduce((sum, o) => sum + Number(o.amount), 0)
)

const fundingPercent = computed(() => {
  if (!project.value?.fundingGoal) return 0
  return Math.min(100, Math.round((totalFunded.value / project.value.fundingGoal) * 100))
})

const statusLabels = {
  pending: 'Pendiente', countered: 'Contraoferta enviada',
  accepted: 'Aceptado', rejected: 'Rechazado',
}
const statusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  countered: 'bg-blue-100 text-blue-800',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
}

onMounted(async () => {
  try {
    const [projRes, offersRes] = await Promise.all([
      projectService.findOne(projectId),
      fundingService.getProjectOffers(projectId),
    ])
    project.value = projRes.data
    offers.value = Array.isArray(offersRes.data) ? offersRes.data : offersRes.data.data || []
  } catch (e) {
    error.value = 'Error al cargar el financiamiento'
  } finally {
    loading.value = false
  }
})

function openCounter(offer) {
  counterForm.value = { offerId: offer.id, amount: offer.amount, message: '' }
  showCounterModal.value = true
}

async function handleCounter() {
  saving.value = true
  try {
    await fundingService.counterOffer(counterForm.value.offerId, {
      amount: Number(counterForm.value.amount),
      message: counterForm.value.message,
    })
    showCounterModal.value = false
    const res = await fundingService.getProjectOffers(projectId)
    offers.value = Array.isArray(res.data) ? res.data : res.data.data || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al contraofertar'
  } finally {
    saving.value = false
  }
}

async function handleAccept(offerId) {
  try {
    await fundingService.acceptOffer(offerId)
    const res = await fundingService.getProjectOffers(projectId)
    offers.value = Array.isArray(res.data) ? res.data : res.data.data || []
    const projRes = await projectService.findOne(projectId)
    project.value = projRes.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al aceptar'
  }
}

async function handleReject(offerId) {
  try {
    await fundingService.rejectOffer(offerId)
    const idx = offers.value.findIndex(o => o.id === offerId)
    if (idx > -1) offers.value[idx].status = 'rejected'
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al rechazar'
  }
}

function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-CL')}`
}
function formatDate(d) {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'hace 1 día'
  return `hace ${diff} días`
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F7F4]">
    <div class="mx-auto max-w-4xl px-4 py-8">

      <!-- Breadcrumb -->
      <button @click="router.back()" class="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Volver
      </button>

      <div v-if="loading" class="flex items-center justify-center py-32">
        <svg class="h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <template v-else-if="project">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-[#1C1917]">Financiamiento: {{ project.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">Gestiona las ofertas de financiamiento recibidas</p>
        </div>

        <!-- Estado de financiamiento -->
        <div class="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-6">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Estado de financiamiento</h2>
          <div class="text-3xl font-bold text-[#1C1917] mb-1">{{ formatMoney(totalFunded) }}</div>
          <div class="text-sm text-gray-500 mb-4">
            de {{ formatMoney(project.fundingGoal ?? 0) }} CLP recaudados
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div class="bg-[#1C1917] h-2 rounded-full transition-all" :style="{ width: fundingPercent + '%' }"></div>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-[#8B5A2B] font-medium">{{ fundingPercent }}% financiado</span>
            <span class="text-gray-400">
              Falta {{ formatMoney(Math.max(0, (project.fundingGoal ?? 0) - totalFunded)) }} CLP
            </span>
          </div>
        </div>

        <!-- Ofertas -->
        <div class="bg-white rounded-2xl border border-[#E5E0D8]">
          <div class="border-b border-[#E5E0D8] px-6 py-4">
            <h2 class="font-semibold text-[#1C1917]">Ofertas recibidas</h2>
            <p class="text-sm text-gray-500">Revisa, acepta, rechaza o contraoferta</p>
          </div>

          <div v-if="offers.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
            Aún no has recibido ofertas de financiamiento.
          </div>

          <div v-else class="divide-y divide-[#E5E0D8]">
            <div v-for="offer in offers" :key="offer.id" class="px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-semibold text-[#1C1917]">
                      {{ offer.company?.companyName ?? offer.companyId }}
                    </span>
                    <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[offer.status]]">
                      {{ statusLabels[offer.status] }}
                    </span>
                    <span v-if="offer.round > 1" class="text-xs text-gray-400">Ronda {{ offer.round }}</span>
                  </div>
                  <div class="text-2xl font-bold text-green-700 mb-1">{{ formatMoney(offer.amount) }}</div>
                  <p v-if="offer.message" class="text-sm text-gray-500 italic mb-2">"{{ offer.message }}"</p>
                  <p class="text-xs text-gray-400">{{ formatDate(offer.createdAt) }}</p>
                </div>

                <!-- Acciones solo si está pendiente o contraofertada -->
                <div v-if="offer.status === 'pending' || offer.status === 'countered'" class="flex flex-col gap-2 shrink-0">
                  <button @click="handleAccept(offer.id)"
                    class="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                    Aceptar
                  </button>
                  <button @click="openCounter(offer)"
                    class="px-4 py-1.5 rounded-lg border border-[#8B5A2B] text-[#8B5A2B] text-sm font-medium hover:bg-[#FEF3C7] transition-colors">
                    Contraofertar
                  </button>
                  <button @click="handleReject(offer.id)"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón buscar equipo si está funded -->
        <div v-if="project.status === 'funded'" class="mt-6 bg-[#1C1917] rounded-2xl p-8 text-center text-white">
          <div class="text-4xl mb-3">🎉</div>
          <h2 class="text-xl font-bold mb-2">¡{{ project.name }} está 100% financiado!</h2>
          <p class="text-sm text-gray-300 mb-6">Ahora puedes armar el equipo técnico que lo hará realidad.</p>
          <router-link :to="`/projects/${project.id}/manage`"
            class="inline-flex items-center gap-2 bg-[#CDB06D] text-[#1C1917] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#b8993a] transition-colors">
            Buscar Equipo de Desarrollo
          </router-link>
        </div>

        <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
      </template>
    </div>

    <!-- Modal contraofertar -->
    <div v-if="showCounterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showCounterModal = false">
      <div class="w-full max-w-sm bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-xl">
        <h2 class="font-semibold text-[#1C1917] mb-4">Contraofertar</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nuevo monto (CLP)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input v-model="counterForm.amount" type="number" min="0"
                class="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Mensaje / condiciones</label>
            <textarea v-model="counterForm.message" rows="3" placeholder="Explica las condiciones de tu contraoferta..."
              class="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] resize-none" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showCounterModal = false" class="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button @click="handleCounter" :disabled="saving"
            class="px-4 py-2 rounded-lg bg-[#8B5A2B] text-white text-sm font-medium hover:bg-[#6B4423] disabled:opacity-50">
            {{ saving ? 'Enviando...' : 'Enviar contraoferta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>