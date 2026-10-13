<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { useCatalogsStore } from '../stores/catalogs.js'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const catalogs = useCatalogsStore()

const activeTab = ref('general')
const saving = ref(false)
const msg = ref('')
const editable = ref({})
const originalEmail = ref('')
const confirmPassword = ref('')
const msgError = ref(false)

// --- Estado para reemplazar CV ---
const cvFile = ref(null)
const cvFileName = ref('Ningún archivo seleccionado')
const uploadingCv = ref(false)
const cvMsg = ref('')
const cvMsgError = ref(false)

const isNatural = computed(() => authStore.user?.type === 'natural_person')
const isCreator = computed(() => authStore.user?.type === 'natural_person' && profileStore.profile?.subtype === 'creator')
const canEditEmail = computed(() => isNatural.value && authStore.user?.provider === 'local')
const emailChanged = computed(() => canEditEmail.value && editable.value.email !== originalEmail.value)

const initials = computed(() => {
  const name = editable.value?.fullName || authStore.user?.fullName || ''
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})
const companyInitials = computed(() => {
  const name = editable.value?.companyName || ''
  return name.charAt(0).toUpperCase()
})

onMounted(async () => {
  await catalogs.fetchAll()
  await profileStore.fetchProfile()
  if (profileStore.profile) {
    editable.value = { ...profileStore.profile }
    originalEmail.value = editable.value.email || ''
    if (!editable.value.availability) {
      editable.value.availability = { days: ['mon', 'tue', 'wed', 'thu', 'fri'], from: '09:00', to: '18:00' }
    }
  }
})

const tabs = computed(() => {
  const base = [{ key: 'general', label: 'General' }]
  if (isNatural.value && !isCreator.value) {
    base.push(
      { key: 'habilidades', label: 'Habilidades' },
      { key: 'disponibilidad', label: 'Disponibilidad' }
    )
  }
  return base
})

const methodologies = [
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'xp', label: 'XP' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'lean', label: 'Lean' },
]

function isAreaSelected(areaId) {
  return editable.value.technicalAreas?.some(a => a.id === areaId) || false
}
function toggleArea(area) {
  if (!editable.value.technicalAreas) editable.value.technicalAreas = []
  const idx = editable.value.technicalAreas.findIndex(a => a.id === area.id)
  if (idx > -1) editable.value.technicalAreas.splice(idx, 1)
  else editable.value.technicalAreas.push({ id: area.id, name: area.name })
}
function isRoleSelected(roleId) {
  return editable.value.roles?.some(r => r.id === roleId) || false
}
function toggleRole(role) {
  if (!editable.value.roles) editable.value.roles = []
  const idx = editable.value.roles.findIndex(r => r.id === role.id)
  if (idx > -1) editable.value.roles.splice(idx, 1)
  else editable.value.roles.push({ id: role.id, name: role.name })
}

async function saveChanges() {
  saving.value = true
  msg.value = ''
  try {
    if (isNatural.value) {
      const payload = {
        fullName: editable.value.fullName,
        photoUrl: editable.value.photoUrl,
      }
      if (emailChanged.value) {
        payload.email = editable.value.email
        payload.currentPassword = confirmPassword.value
      }
      await profileStore.updateNaturalProfile(payload)
    } else {
      await profileStore.updateCompanyProfile({
        companyName: editable.value.companyName,
        address: editable.value.address,
        phone: editable.value.phone,
        photoUrl: editable.value.photoUrl,
      })
    }
    originalEmail.value = editable.value.email || ''
    confirmPassword.value = ''
    msgError.value = false
    msg.value = '✓ Cambios guardados'
  } catch (e) {
    msgError.value = true
    msg.value = e.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function saveSkills() {
  saving.value = true
  msg.value = ''
  try {
    await profileStore.updateOnboarding({
      technicalAreaIds: (editable.value.technicalAreas || []).map(a => a.id),
      roleIds: (editable.value.roles || []).map(r => r.id),
      interestAreaIds: (editable.value.interestAreas || []).map(a => a.id),
      methodology: editable.value.methodology,
      weeklyHours: editable.value.weeklyHours || 40,
      timezone: editable.value.timezone,
      availability: editable.value.availability,
    })
    msg.value = '✓ Cambios guardados'
  } catch (e) {
    msg.value = 'Error al guardar'
  } finally {
    saving.value = false
  }
}

// --- CV: seleccionar, subir, eliminar ---
function onCvChange(e) {
  const file = e.target.files[0]
  cvMsg.value = ''
  if (file) {
    cvFile.value = file
    cvFileName.value = file.name
  } else {
    cvFile.value = null
    cvFileName.value = 'Ningún archivo seleccionado'
  }
}

async function uploadCv() {
  if (!cvFile.value) {
    cvMsgError.value = true
    cvMsg.value = 'Selecciona un archivo primero'
    return
  }
  uploadingCv.value = true
  cvMsg.value = ''
  try {
    // profileStore.uploadCv arma su propio FormData internamente
    // (campo 'file'), así que se le pasa el File tal cual.
    const updated = await profileStore.uploadCv(cvFile.value)

    editable.value.cvUrl = updated?.cvUrl ?? updated?.url ?? profileStore.profile?.cvUrl ?? editable.value.cvUrl
    cvFile.value = null
    cvFileName.value = 'Ningún archivo seleccionado'
    cvMsgError.value = false
    cvMsg.value = '✓ CV actualizado'
  } catch (e) {
    cvMsgError.value = true
    cvMsg.value = e.response?.data?.message || 'Error al subir el CV'
  } finally {
    uploadingCv.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- Volver -->
    <div class="mb-6">
      <router-link :to="isNatural ? '/feed' : '/feed'" class="text-sm text-gray-500 hover:text-[#8B5A2B] flex items-center gap-1 transition-colors">
        <span>←</span> Volver al Dashboard
      </router-link>
    </div>

    <!-- Header perfil -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-[#CDB06D] font-bold text-xl"
        :class="editable.photoUrl ? '' : 'bg-[#1C1917]'">
        <img v-if="editable.photoUrl" :src="editable.photoUrl" class="w-full h-full object-cover" />
        <span v-else>{{ isNatural ? initials : companyInitials }}</span>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-[#1C1917]">Mi Perfil</h1>
        <span class="inline-flex items-center gap-1 bg-[#F3E9D3] text-[#8B5A2B] text-xs font-medium px-2.5 py-0.5 rounded-full mt-1">
          {{ isNatural ? '👤 Cuenta Personal' : '🏢 Cuenta Empresa' }}
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; msg = ''; msgError = false"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === tab.key
            ? 'bg-white border border-[#E5E0D8] text-[#1C1917] shadow-sm'
            : 'bg-transparent text-gray-500 hover:text-[#1C1917]'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== GENERAL ===== -->
    <div v-if="activeTab === 'general'" class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
      <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Información General</h2>
      <p class="text-sm text-gray-500 mb-6">Actualiza tu información básica de perfil</p>

      <div class="space-y-5">
        <!-- Persona natural -->
        <template v-if="isNatural">
          <div>
            <label class="block text-sm font-medium mb-1.5">Nombre Completo</label>
            <input v-model="editable.fullName" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">URL de Avatar</label>
            <input v-model="editable.photoUrl" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>

          <!-- CV: ver, reemplazar -->
          <div>
            <label class="block text-sm font-medium mb-2">Currículum Vitae</label>

            <a v-if="editable.cvUrl" :href="editable.cvUrl" target="_blank"
              class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#6B4423] transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver CV subido
            </a>
            <p v-else class="text-sm text-gray-400 mb-0">No se ha subido CV</p>

            <!-- Reemplazar / subir CV -->
            <div class="flex items-center gap-3 flex-wrap mt-2.5">
              <label class="cursor-pointer inline-flex">
                <span class="border border-[#E5E0D8] bg-white text-[#1C1917] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#FAF8F5] transition-colors">
                  {{ editable.cvUrl ? 'Seleccionar nuevo CV' : 'Seleccionar archivo' }}
                </span>
                <input type="file" accept="application/pdf" @change="onCvChange" class="hidden" />
              </label>
              <span class="text-xs text-gray-500 truncate max-w-[180px]">{{ cvFileName }}</span>
              <button v-if="cvFile" type="button" @click="uploadCv" :disabled="uploadingCv"
                class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#6B4423] disabled:opacity-50 transition-colors">
                {{ uploadingCv ? 'Subiendo...' : (editable.cvUrl ? 'Reemplazar CV' : 'Subir CV') }}
              </button>
            </div>

            <p v-if="cvMsg" :class="cvMsgError ? 'text-red-600' : 'text-green-600'" class="text-sm mt-2">{{ cvMsg }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5">Correo Electrónico</label>
            <input v-if="canEditEmail" v-model="editable.email" type="email"
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
            <input v-else :value="editable.email" disabled
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
            <p v-if="!canEditEmail && isNatural" class="text-xs text-gray-400 mt-1">
              El correo no se puede cambiar en cuentas vinculadas con Google.
            </p>
          </div>
          <div v-if="emailChanged">
            <label class="block text-sm font-medium mb-1.5">Contraseña actual <span class="text-red-500">*</span></label>
            <input v-model="confirmPassword" type="password" placeholder="Ingresa tu contraseña para confirmar el cambio"
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
        </template>

        <!-- Empresa -->
        <template v-else>
          <div>
            <label class="block text-sm font-medium mb-1.5">URL de Avatar / Logo</label>
            <input v-model="editable.photoUrl" placeholder="https://..." class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Nombre de la Empresa</label>
            <input v-model="editable.companyName" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Dirección</label>
            <input v-model="editable.address" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Teléfono</label>
            <input v-model="editable.phone" class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
        </template>
      </div>

      <div class="flex justify-end items-center gap-3 pt-6">
        <span v-if="msg" :class="msgError ? 'text-red-600' : 'text-green-600'" class="text-sm">{{ msg }}</span>
        <button @click="saveChanges" :disabled="saving"
          class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- ===== HABILIDADES ===== -->
    <div v-if="activeTab === 'habilidades'" class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
      <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Habilidades y Áreas</h2>
      <p class="text-sm text-gray-500 mb-6">Define tus áreas técnicas, roles e intereses</p>
      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1.5">Áreas Técnicas</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="area in catalogs.technicalAreas" :key="area.id" @click="toggleArea(area)"
              :class="['px-3 py-1.5 rounded-full text-sm border transition-all',
                isAreaSelected(area.id) ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
              {{ area.name }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Roles</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="role in catalogs.roles" :key="role.id" @click="toggleRole(role)"
              :class="['px-3 py-1.5 rounded-full text-sm border transition-all',
                isRoleSelected(role.id) ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-white text-gray-700 border-[#E5E0D8] hover:border-[#8B5A2B]']">
              {{ role.name }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Metodología Preferida</label>
          <select v-model="editable.methodology"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all">
            <option v-for="m in methodologies" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end items-center gap-3 pt-6">
        <span v-if="msg" :class="msgError ? 'text-red-600' : 'text-green-600'" class="text-sm">{{ msg }}</span>
        <button @click="saveSkills" :disabled="saving"
          class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- ===== DISPONIBILIDAD ===== -->
    <div v-if="activeTab === 'disponibilidad'" class="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
      <h2 class="text-lg font-bold mb-1 text-[#1C1917]">Disponibilidad</h2>
      <p class="text-sm text-gray-500 mb-6">Configura tu disponibilidad y horario de trabajo</p>
      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1.5">Horas Semanales</label>
          <select v-model.number="editable.weeklyHours"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all">
            <option :value="40">Tiempo Completo (40h)</option>
            <option :value="20">Medio Tiempo (20h)</option>
            <option :value="10">Freelance (10h)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5">Zona Horaria</label>
          <select v-model="editable.timezone"
            class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all">
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="America/Bogota">America/Bogota</option>
            <option value="America/Santiago">America/Santiago</option>
            <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
            <option value="America/Lima">America/Lima</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1.5">Hora de Inicio</label>
            <input type="time" v-model="editable.availability.from"
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Hora de Fin</label>
            <input type="time" v-model="editable.availability.to"
              class="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all" />
          </div>
        </div>
      </div>
      <div class="flex justify-end items-center gap-3 pt-6">
        <span v-if="msg" :class="msgError ? 'text-red-600' : 'text-green-600'" class="text-sm">{{ msg }}</span>
        <button @click="saveSkills" :disabled="saving"
          class="inline-flex items-center gap-2 bg-[#8B5A2B] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#6B4423] disabled:opacity-50 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>