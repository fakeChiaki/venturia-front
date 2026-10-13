<script setup>
import { projectStatusLabels } from '@/data/mockData.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  project: { type: Object, required: true },
  affinity: { type: Number, default: undefined },
  index: { type: Number, default: 0 },
  isCompany: { type: Boolean, default: false },
})

defineEmits(['click'])

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

function affinityClass(value) {
  if (value >= 80) return 'bg-green-500 text-white'
  if (value >= 60) return 'bg-yellow-500 text-white'
  return 'bg-gray-500 text-white'
}

function initial(name) {
  return name?.charAt(0)?.toUpperCase() ?? '?'
}

const canFund = computed(() =>
  props.isCompany && ['open', 'negotiating'].includes(props.project.status)
)

import { computed } from 'vue'
</script>

<template>
  <div
    class="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all hover:shadow-lg flex flex-col"
    :style="{ '--i': index }"
  >
    <!-- Imagen clickeable -->
    <div class="relative aspect-video overflow-hidden bg-muted cursor-pointer" @click="$emit('click', project)">
      <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div v-else class="flex h-full w-full items-center justify-center">
        <span class="text-4xl font-bold text-muted-foreground">{{ initial(project.name) }}</span>
      </div>
      <span v-if="affinity !== undefined"
        class="absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        :class="affinityClass(affinity)">
        {{ affinity }}% Afinidad
      </span>
      <span class="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
        :class="statusColors[project.status]">
        {{ projectStatusLabels[project.status] }}
      </span>
    </div>

    <!-- Contenido clickeable -->
    <div class="p-4 cursor-pointer flex-1" @click="$emit('click', project)">
      <h3 class="mb-2 line-clamp-1 text-lg font-semibold text-foreground">{{ project.name }}</h3>
      <p class="mb-3 line-clamp-2 text-sm text-muted-foreground">{{ project.description }}</p>
      <div class="mb-3 flex flex-wrap gap-1">
        <span v-if="project.technicalArea"
          class="inline-flex items-center rounded-full border border-border bg-transparent px-2.5 py-0.5 text-xs font-medium text-foreground">
          {{ project.technicalArea.name }}
        </span>
      </div>
      <div class="flex flex-wrap gap-1">
        <span v-for="rr in (project.roleRequirements || []).slice(0, 2)" :key="rr.id"
          class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {{ rr.role?.name }}
        </span>
        <span v-if="(project.roleRequirements || []).length > 2"
          class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          +{{ project.roleRequirements.length - 2 }}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-border px-4 py-3">
      <!-- Empresa: botón financiar -->
      <button
        v-if="canFund"
        @click="router.push(`/projects/${project.id}/offer`)"
        class="w-full bg-[#8B5A2B] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#6B4423] transition-colors"
      >
      Financiar proyecto
      </button>

      <!-- Otros usuarios: info creador + metodología -->
      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 overflow-hidden rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
            <span class="text-xs font-medium text-muted-foreground">
              {{ initial(project.creatorName ?? project.creator?.fullName) }}
            </span>
          </div>
          <span class="text-xs text-muted-foreground truncate max-w-[120px]">
            {{ project.creatorName ?? project.creator?.fullName }}
          </span>
        </div>
        <span class="text-xs text-muted-foreground">{{ project.methodology ?? '' }}</span>
      </div>
    </div>
  </div>
</template>