<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fundingService } from '@/services/funding.service'
import { projectService } from '@/services/project.service'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)
const myOffers = ref([])
const summary = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = ref({ amount: '', message: '' })

const fundingPercent = computed(() => {
  if (!summary.value?.goal) return 0
  return Math.min(100, Math.round((summary.value.funded / summary.value.goal) * 100))
})

const statusLabels = {
  pending: 'Pendiente', countered: 'Contraoferta recibida',
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
    const [projRes, offersRes, summaryRes] = await Promise.all([
      projectService.findOne(projectId),
      fundingService.getMyOffers(projectId),
      fundingService.getSummary(projectId),
    ])
    project.value = projRes.data
    myOffers.value = Array.isArray(offersRes.data) ? offersRes.data : offersRes.data.data || []
    summary.value = summaryRes.data
  } catch (e) {
    error.value = 'Error al cargar el proyecto'
  } finally {
    loading.value = false
  }
})

async function handleOffer() {
  if (!form.value.amount) { error.value = 'Ingresa un monto'; return }
  saving.value = true; error.value = ''
  try {
    await fundingService.createOffer(projectId, {
      amount: Number(form.value.amount),
      message: form.value.message || undefined,
    })
    success.value = true
    form.value = { amount: '', message: '' }
    const res = await fundingService.getMyOffers(projectId)
    myOffers.value = Array.isArray(res.data) ? res.data : res.data.data || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al enviar la oferta'
  } finally {
    saving.value = false
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
    <div class="mx-auto max-w-2xl px-4 py-8">

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
        <h1 class="text-2xl font-bold text-[#1C1917] mb-1">Financiar: {{ project.name }}</h1>
        <p class="text-sm text-gray-500 mb-8">Realiza una oferta de financiamiento al creador del proyecto</p>

        <!-- Info del proyecto -->
        <div class="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6">
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
              <img v-if="project.imageUrl" :src="project.imageUrl" class="h-full w-full object-cover" />
              <span v-else class="text-2xl font-bold text-gray-400">{{ project.name?.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-semibold text-[#1C1917]">{{ project.name }}</p>
              <p class="text-sm text-gray-500">Meta: {{ formatMoney(summary?.goal ?? project.fundingGoal ?? 0) }} CLP</p>
            </div>
          </div>

          <!-- Progreso de financiamiento colectivo -->
          <div v-if="summary" class="mt-5">
            <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div class="bg-[#8B5A2B] h-2 rounded-full transition-all" :style="{ width: fundingPercent + '%' }"></div>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-[#8B5A2B] font-medium">
                {{ formatMoney(summary.funded) }} recaudado ({{ fundingPercent }}%)
              </span>
              <span class="text-gray-400">
                Falta {{ formatMoney(summary.remaining ?? 0) }} · {{ summary.backers }}
                {{ summary.backers === 1 ? 'financista' : 'financistas' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Formulario oferta -->
        <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 mb-6 space-y-4">
          <h2 class="font-semibold text-[#1C1917]">Nueva oferta</h2>

          <div v-if="success" class="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            ✓ Oferta enviada correctamente. El creador recibirá tu propuesta.
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Monto a ofrecer (CLP) <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input v-model="form.amount" type="number" min="1" placeholder="250000"
                class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Mensaje / condiciones</label>
            <textarea v-model="form.message" rows="3"
              placeholder="Ej: Ofrecemos $250.000 CLP a cambio de crédito como patrocinador en la documentación..."
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] resize-none" />
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <button @click="handleOffer" :disabled="saving"
            class="w-full bg-[#8B5A2B] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors">
            {{ saving ? 'Enviando...' : 'Enviar oferta de financiamiento' }}
          </button>
        </div>

        <!-- Mis ofertas anteriores -->
        <div v-if="myOffers.length > 0" class="bg-white rounded-2xl border border-[#E5E0D8]">
          <div class="border-b border-[#E5E0D8] px-6 py-4">
            <h2 class="font-semibold text-[#1C1917]">Mis ofertas anteriores</h2>
          </div>
          <div class="divide-y divide-[#E5E0D8]">
            <div v-for="offer in myOffers" :key="offer.id" class="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <div class="font-semibold text-[#1C1917]">{{ formatMoney(offer.amount) }}</div>
                <p v-if="offer.message" class="text-xs text-gray-400 italic mt-0.5">"{{ offer.message }}"</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(offer.createdAt) }} · Ronda {{ offer.round }}</p>
              </div>
              <span :class="['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shrink-0', statusColors[offer.status]]">
                {{ statusLabels[offer.status] }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>