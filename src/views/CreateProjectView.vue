<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectService } from '@/services/project.service'
import { useCatalogsStore } from '@/stores/catalogs.js'

const router = useRouter()
const catalogs = useCatalogsStore()
onMounted(() => catalogs.fetchAll())

const saving = ref(false)
const error = ref('')

const form = ref({
  name: '', description: '', privateDescription: '', imageUrl: '',
  methodology: '', technicalAreaIds: [], roleRequirements: [], fundingGoal: '',
})

const methodologies = [
  { value: 'scrum', label: 'Scrum' }, { value: 'kanban', label: 'Kanban' }, { value: 'scrumban', label: 'Scrumban' },
  { value: 'xp', label: 'XP' }, { value: 'waterfall', label: 'Waterfall' }, { value: 'lean', label: 'Lean' },
]

function isAreaSelected(areaId) { return form.value.technicalAreaIds.includes(areaId) }
function toggleArea(areaId) {
  const idx = form.value.technicalAreaIds.indexOf(areaId)
  if (idx > -1) form.value.technicalAreaIds.splice(idx, 1)
  else form.value.technicalAreaIds.push(areaId)
}
function addRole() { form.value.roleRequirements.push({ roleId: '', quantity: 1, estimatedPay: '', weeklyHours: '' }) }
function removeRole(idx) { form.value.roleRequirements.splice(idx, 1) }
function usedRoleIds(currentIdx) { return form.value.roleRequirements.filter((_, i) => i !== currentIdx).map(r => r.roleId) }

async function handleCreate() {
  if (form.value.technicalAreaIds.length === 0) { error.value = 'Selecciona al menos un área técnica'; return }
  saving.value = true; error.value = ''
  try {
    const payload = { name: form.value.name, description: form.value.description, technicalAreaIds: form.value.technicalAreaIds, methodology: form.value.methodology }
    if (form.value.privateDescription) payload.privateDescription = form.value.privateDescription
    if (form.value.imageUrl) payload.imageUrl = form.value.imageUrl
    if (form.value.roleRequirements.length > 0) {
      payload.roleRequirements = form.value.roleRequirements.map(r => ({
        roleId: Number(r.roleId), quantity: Number(r.quantity),
        ...(r.estimatedPay !== '' && { estimatedPay: Number(r.estimatedPay) }),
        ...(r.weeklyHours !== '' && { weeklyHours: Number(r.weeklyHours) }),
      }))
    }
    if (form.value.fundingGoal) payload.fundingGoal = Number(form.value.fundingGoal)
    const { data } = await projectService.create(payload)
    router.push(`/projects/${data.id}/manage`)
  } catch (err) { error.value = err.response?.data?.message || 'Error al crear el proyecto' }
  finally { saving.value = false }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <router-link to="/projects" class="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-[#8B5A2B] transition-colors">
      ← Volver a Mis Proyectos
    </router-link>

    <h1 class="text-2xl font-bold text-[#1C1917] mb-1">Crear Proyecto</h1>
    <p class="text-gray-500 text-sm mb-8">Completa la información del proyecto para publicarlo en la plataforma</p>

    <form @submit.prevent="handleCreate" class="space-y-6">
      <!-- General -->
      <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8 space-y-5">
        <h2 class="font-semibold text-[#1C1917]">Información General</h2>
        <p class="text-sm text-gray-500">Los datos básicos del proyecto</p>

        <div>
          <label class="block text-sm font-medium mb-1.5">Nombre del Proyecto <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" placeholder="Ej: Plataforma de gestión de inventario" required minlength="5" maxlength="150"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Descripción Pública <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-400 mb-1">Visible para todos los usuarios de la plataforma</p>
          <textarea v-model="form.description" placeholder="Describe el proyecto, sus objetivos y tecnologías a usar" required rows="3"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all resize-none" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Descripción Privada</label>
          <p class="text-xs text-gray-400 mb-1">Solo visible para miembros aceptados en el proyecto</p>
          <textarea v-model="form.privateDescription" placeholder="Stack técnico detallado, arquitectura, accesos, información interna..." rows="3"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all resize-none" />
        </div>
      </div>
            <!-- Meta de financiamiento -->
      <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8 space-y-3">
        <h2 class="font-semibold text-[#1C1917]">Meta de Financiamiento</h2>
        <p class="text-xs text-gray-400">Monto total en CLP que buscas recaudar. Las empresas podrán hacer ofertas por el total o una parte.</p>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
          <input
            v-model="form.fundingGoal"
            type="number" min="0" placeholder="500000"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all"
          />
        </div>
      </div>

      <!-- Áreas técnicas -->
      <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
        <h2 class="font-semibold text-[#1C1917] mb-1">Áreas Técnicas <span class="text-red-500">*</span></h2>
        <p class="text-xs text-gray-400 mb-4">Selecciona todas las áreas que apliquen al proyecto</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="area in catalogs.technicalAreas" :key="area.id" type="button" @click="toggleArea(area.id)"
            :class="['px-3 py-1.5 rounded-full text-sm border transition-all', isAreaSelected(area.id) ? 'bg-[#1C1917] text-white border-[#1C1917]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
            {{ area.name }}
          </button>
        </div>
      </div>

      <!-- Roles requeridos -->
      <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-semibold text-[#1C1917]">Roles Requeridos</h2>
            <p class="text-xs text-gray-400 mt-0.5">Define los roles, cantidad, paga y horas estimadas</p>
          </div>
          <button type="button" @click="addRole" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm font-medium hover:bg-[#FAF8F5] transition-colors">
            + Agregar Rol
          </button>
        </div>

        <div v-if="form.roleRequirements.length === 0" class="text-center py-6 text-sm text-gray-400 border border-dashed border-[#E5E0D8] rounded-xl">
          No hay roles definidos aún. Haz clic en "Agregar Rol" para comenzar.
        </div>

        <div class="space-y-4">
          <div v-for="(req, idx) in form.roleRequirements" :key="idx" class="bg-white border border-[#E5E0D8] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-[#1C1917]">Rol #{{ idx + 1 }}</p>
              <button type="button" @click="removeRole(idx)" class="text-gray-400 hover:text-red-500 transition-colors">✕</button>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Rol <span class="text-red-500">*</span></label>
              <select v-model="req.roleId" required
                class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]">
                <option value="" disabled>Selecciona un rol...</option>
                <option v-for="role in catalogs.roles" :key="role.id" :value="role.id" :disabled="usedRoleIds(idx).includes(role.id)">{{ role.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Cantidad <span class="text-red-500">*</span></label>
                <input v-model.number="req.quantity" type="number" min="1" required class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Paga Estimada</label>
                <input v-model="req.estimatedPay" type="number" min="0" placeholder="$0" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Horas / Semana</label>
                <input v-model="req.weeklyHours" type="number" min="1" placeholder="40" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metodología -->
      <div class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
        <h2 class="font-semibold text-[#1C1917] mb-4">Metodología <span class="text-red-500">*</span></h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="m in methodologies" :key="m.value" type="button" @click="form.methodology = m.value"
            :class="['text-sm font-medium py-2 rounded-lg border transition-all', form.methodology === m.value ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-[#FAF8F5] text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
            {{ m.label }}
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex justify-end gap-3 pb-8">
        <router-link to="/projects" class="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] transition-colors">Cancelar</router-link>
        <button type="submit" :disabled="saving" class="bg-[#8B5A2B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors">
          {{ saving ? 'Creando...' : 'Crear Proyecto' }}
        </button>
      </div>
    </form>
  </div>
</template>