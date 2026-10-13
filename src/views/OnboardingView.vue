<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profile'
import { useCatalogsStore } from '../stores/catalogs.js'

const router = useRouter()
const profileStore = useProfileStore()
const catalogs = useCatalogsStore()

onMounted(() => {
  catalogs.fetchAll()
})

const currentStep = ref(1)
const loading = ref(false)
const error = ref('')

const methodologies = [
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'scrumban', label: 'Scrumban' },
  { value: 'xp', label: 'XP' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'lean', label: 'Lean' },
]

const availabilityTypes = [
  { value: 'full_time', label: 'Tiempo Completo', hours: 40 },
  { value: 'part_time', label: 'Medio Tiempo', hours: 20 },
  { value: 'freelance', label: 'Freelance', hours: 10 },
  { value: 'contract', label: 'Contrato', hours: 40 },
]

const timezones = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Lima',
  'America/New_York',
]

const form = reactive({
  technicalAreaIds: [],
  methodology: '',
  interestAreaIds: [],
  roleIds: [],
  availabilityType: 'full_time',
  timezone: 'America/Mexico_City',
  startTime: '09:00',
  endTime: '18:00',
})

const steps = [
  { number: 1, title: 'Áreas e Intereses', subtitle: 'Define tus áreas técnicas' },
  { number: 2, title: 'Roles', subtitle: 'Selecciona tus roles' },
  { number: 3, title: 'Disponibilidad', subtitle: 'Configura tu horario' },
]

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function toggleId(array, id) {
  const idx = array.indexOf(id)
  if (idx > -1) array.splice(idx, 1)
  else array.push(id)
}

function isSelected(array, id) {
  return array.includes(id)
}

async function submitOnboarding() {
  try {
    loading.value = true
    error.value = ''
    const avType = availabilityTypes.find(t => t.value === form.availabilityType)
    const payload = {
      technicalAreaIds: form.technicalAreaIds,
      methodology: form.methodology,
      weeklyHours: avType?.hours || 40,
      timezone: form.timezone,
      availability: {
        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        from: form.startTime,
        to: form.endTime,
      },
      roleIds: form.roleIds,
      interestAreaIds: form.interestAreaIds,
    }
    await profileStore.updateOnboarding(payload)
    router.push('/feed')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al completar onboarding'
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] font-sans">

    <main class="max-w-2xl mx-auto px-4 py-10">
      <div class="flex items-center justify-center gap-4 mb-10">
        <template v-for="(step, index) in steps" :key="step.number">
          <div class="flex flex-col items-center gap-2">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2',
                currentStep > step.number ? 'bg-[#8B5A2B] border-[#8B5A2B] text-white' : currentStep === step.number ? 'bg-[#1C1917] border-[#1C1917] text-white' : 'bg-white border-[#E5E0D8] text-gray-400'
              ]"
            >
              <span v-if="currentStep > step.number">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span v-else>{{ step.number }}</span>
            </div>
            <div class="text-center hidden sm:block">
              <p class="text-xs font-semibold">{{ step.title }}</p>
              <p class="text-[10px] text-gray-500">{{ step.subtitle }}</p>
            </div>
          </div>
          <div v-if="index < steps.length - 1" :class="['h-px w-12 md:w-20 mb-6', currentStep > step.number ? 'bg-[#8B5A2B]' : 'bg-[#E5E0D8]']" />
        </template>
      </div>

      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#E5E0D8]">
        <!-- PASO 1 -->
        <div v-if="currentStep === 1">
          <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Áreas Técnicas e Intereses</h2>
          <p class="text-sm text-gray-500 mb-6">Elige las áreas técnicas en las que te especializas y tus intereses</p>

          <div class="mb-6">
            <label class="block text-sm font-semibold mb-3">Áreas Técnicas <span class="text-red-500">*</span></label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="area in catalogs.technicalAreas"
                :key="area.id"
                type="button"
                @click="toggleId(form.technicalAreaIds, area.id)"
                :class="[
                  'px-3.5 py-1.5 rounded-full text-sm border transition-all',
                  isSelected(form.technicalAreaIds, area.id) ? 'bg-[#1C1917] text-white border-[#1C1917]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]'
                ]"
              >
                {{ area.name }}
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2">Metodología Preferida</label>
            <select v-model="form.methodology" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]">
              <option value="" disabled>Selecciona...</option>
              <option v-for="m in methodologies" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div class="mb-2">
            <label class="block text-sm font-semibold mb-3">Intereses</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="area in catalogs.interestAreas"
                :key="area.id"
                type="button"
                @click="toggleId(form.interestAreaIds, area.id)"
                :class="[
                  'px-3.5 py-1.5 rounded-full text-sm border transition-all',
                  isSelected(form.interestAreaIds, area.id) ? 'bg-[#1C1917] text-white border-[#1C1917]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]'
                ]"
              >
                {{ area.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- PASO 2 -->
        <div v-if="currentStep === 2">
          <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Selecciona tus Roles</h2>
          <p class="text-sm text-gray-500 mb-6">Selecciona los roles que puedes desempeñar en un proyecto</p>

          <div class="mb-2">
            <label class="block text-sm font-semibold mb-2">Roles que puedes desempeñar <span class="text-red-500">*</span></label>
            <p class="text-xs text-gray-400 mb-3">Selecciona todos los roles en los que tienes experiencia</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="role in catalogs.roles"
              :key="role.id"
              type="button"
              @click="toggleId(form.roleIds, role.id)"
              :class="[
                'py-3 px-4 rounded-lg border text-sm font-medium transition-all text-center',
                isSelected(form.roleIds, role.id) ? 'bg-[#1C1917] text-white border-[#1C1917]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]'
              ]"
            >
              {{ role.name }}
            </button>
          </div>
        </div>

        <!-- PASO 3 -->
        <div v-if="currentStep === 3">
          <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Disponibilidad y Horario</h2>
          <p class="text-sm text-gray-500 mb-6">Configura tu disponibilidad y horario de trabajo preferido</p>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold mb-2">Disponibilidad</label>
              <select v-model="form.availabilityType" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]">
                <option v-for="t in availabilityTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Zona Horaria</label>
              <select v-model="form.timezone" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]">
                <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Hora de Inicio</label>
                <input v-model="form.startTime" type="time" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2">Hora de Fin</label>
                <input v-model="form.endTime" type="time" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
              </div>
            </div>
          </div>
        </div>

        <p v-if="error" class="text-red-600 text-sm mt-6">{{ error }}</p>

        <div class="flex justify-between mt-8">
          <button
            type="button"
            @click="prevStep"
            :disabled="currentStep === 1"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-white text-gray-400 border-[#E5E0D8]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:bg-[#FAF8F5]'
            ]"
          >
            ← Atrás
          </button>

          <button
            v-if="currentStep < 3"
            type="button"
            @click="nextStep"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-[#F3E9D3] text-[#8B5A2B] hover:bg-[#ead6b5] transition-colors"
          >
            Siguiente →
          </button>

          <button
            v-else
            type="button"
            @click="submitOnboarding"
            :disabled="loading"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-[#1C1917] text-white hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <span v-if="loading">Guardando...</span>
            <span v-else class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              Completar
            </span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>