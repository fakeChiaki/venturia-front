<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import api from '@/services/api'

const filters = defineModel({ default: () => ({}) })
const emit = defineEmits(['change'])

const technicalAreas = ref([])
const roles = ref([])
const interestAreas = ref([])
const isMobileFiltersOpen = ref(false)
const props = defineProps({
  hideRoles: { type: Boolean, default: false }
})

onMounted(async () => {
  const [taRes, rolesRes, iaRes] = await Promise.all([
    api.get('/catalogs/technical-areas'),
    api.get('/catalogs/roles'),
    api.get('/catalogs/interest-areas'),
  ])
  technicalAreas.value = taRes.data
  roles.value = rolesRes.data
  interestAreas.value = iaRes.data
})

const methodologies = [
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'xp', label: 'XP' },
  { value: 'lean', label: 'Lean' },
]

const hasActiveFilters = computed(() => {
  const f = filters.value
  return !!(
    f.search ||
    f.areaTecnica ||
    f.roleIds?.length ||
    f.interestAreaIds?.length ||
    f.metodologia ||
    f.disponibilidadMin
  )
})

function updateSearch(e) {
  filters.value = { ...filters.value, search: e.target.value || undefined }
  emit('change')
}

// areaTecnica es un solo número — toggle: si ya está seleccionada, deselecciona
function toggleTechnicalArea(id) {
  filters.value = {
    ...filters.value,
    areaTecnica: filters.value.areaTecnica === id ? undefined : id
  }
  emit('change')
}

function toggleId(key, id) {
  const current = filters.value[key] || []
  const updated = current.includes(id)
    ? current.filter(x => x !== id)
    : [...current, id]
  filters.value = { ...filters.value, [key]: updated.length ? updated : undefined }
  emit('change')
}

function updateMetodologia(e) {
  filters.value = { ...filters.value, metodologia: e.target.value === 'all' ? undefined : e.target.value }
  emit('change')
}

function updateDisponibilidad(e) {
  const val = parseInt(e.target.value)
  filters.value = { ...filters.value, disponibilidadMin: isNaN(val) ? undefined : val }
  emit('change')
}

function clearFilters() {
  filters.value = {}
  emit('change')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <div class="flex gap-3">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar proyectos..."
          :value="filters.search || ''"
          @input="updateSearch"
          class="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <BaseButton variant="outline" class="lg:hidden" @click="isMobileFiltersOpen = true">
        Filtros
        <BaseBadge v-if="hasActiveFilters" variant="secondary" class="ml-2">!</BaseBadge>
      </BaseButton>
    </div>

    <!-- Filter content (shared between mobile sheet and desktop) -->
    <template v-for="isMobile in [false, true]" :key="isMobile">
      <Teleport v-if="isMobile" to="body">
        <div v-if="isMobileFiltersOpen" class="fixed inset-0 z-50 flex justify-end bg-black/50 lg:hidden" @click.self="isMobileFiltersOpen = false">
          <div class="h-full w-80 max-w-full overflow-y-auto bg-white p-6 shadow-xl">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-semibold">Filtros</h3>
              <button class="rounded-full p-1 text-gray-500 hover:bg-gray-100" @click="isMobileFiltersOpen = false">✕</button>
            </div>
            <div class="space-y-6">
              <div>
                <h4 class="mb-3 text-sm font-semibold">Áreas Técnicas</h4>
                <div class="flex flex-wrap gap-2">
                  <BaseBadge v-for="area in technicalAreas" :key="area.id"
                    :variant="filters.areaTecnica === area.id ? 'default' : 'outline'"
                    class="cursor-pointer" @click="toggleTechnicalArea(area.id)">
                    {{ area.name }}
                  </BaseBadge>
                </div>
              </div>
              <div>
                <h4 class="mb-3 text-sm font-semibold">Roles</h4>
                <div class="flex flex-wrap gap-2">
                  <BaseBadge v-for="role in roles" :key="role.id"
                    :variant="filters.roleIds?.includes(role.id) ? 'default' : 'outline'"
                    class="cursor-pointer" @click="toggleId('roleIds', role.id)">
                    {{ role.name }}
                  </BaseBadge>
                </div>
              </div>
              <div>
                <h4 class="mb-3 text-sm font-semibold">Áreas de Interés</h4>
                <div class="flex flex-wrap gap-2">
                  <BaseBadge v-for="area in interestAreas" :key="area.id"
                    :variant="filters.interestAreaIds?.includes(area.id) ? 'default' : 'outline'"
                    class="cursor-pointer" @click="toggleId('interestAreaIds', area.id)">
                    {{ area.name }}
                  </BaseBadge>
                </div>
              </div>
              <BaseButton v-if="hasActiveFilters" variant="ghost" class="w-full" @click="clearFilters">
                Limpiar filtros
              </BaseButton>
            </div>
          </div>
        </div>
      </Teleport>

      <div v-else class="hidden lg:block space-y-6">
        <div>
          <h4 class="mb-3 text-sm font-semibold">Áreas Técnicas</h4>
          <div class="flex flex-wrap gap-2">
            <BaseBadge v-for="area in technicalAreas" :key="area.id"
              :variant="filters.areaTecnica === area.id ? 'active' : 'outline'"
              class="cursor-pointer" @click="toggleTechnicalArea(area.id)">
              {{ area.name }}
            </BaseBadge>
          </div>
        </div>
        <div v-if="!hideRoles">
          <h4 class="mb-3 text-sm font-semibold">Roles</h4>
          <div class="flex flex-wrap gap-2">
            <BaseBadge v-for="role in roles" :key="role.id"
              :variant="filters.roleIds?.includes(role.id) ? 'active' : 'outline'"
              class="cursor-pointer" @click="toggleId('roleIds', role.id)">
              {{ role.name }}
            </BaseBadge>
          </div>
        </div>
        <div>
          <h4 class="mb-3 text-sm font-semibold">Áreas de Interés</h4>
          <div class="flex flex-wrap gap-2">
            <BaseBadge v-for="area in interestAreas" :key="area.id"
              :variant="filters.interestAreaIds?.includes(area.id) ? 'active' : 'outline'"
              class="cursor-pointer" @click="toggleId('interestAreaIds', area.id)">
              {{ area.name }}
            </BaseBadge>
          </div>
        </div>
        <div>
          <h4 class="mb-3 text-sm font-semibold">Metodología</h4>
          <select
            :value="filters.metodologia || 'all'"
            @change="updateMetodologia"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option v-for="m in methodologies" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <div>
          <h4 class="mb-3 text-sm font-semibold">Disponibilidad mínima (hrs/semana)</h4>
          <input
            type="number"
            min="1"
            :value="filters.disponibilidadMin || ''"
            @change="updateDisponibilidad"
            placeholder="Ej: 10"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>  
        <BaseButton v-if="hasActiveFilters" variant="ghost" class="mt-4" @click="clearFilters">
          Limpiar filtros
        </BaseButton>
      </div>
    </template>
  </div>
</template>