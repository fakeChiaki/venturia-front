import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

const FALLBACK_AREAS = [
  { id: 1, name: 'Desarrollo Web' },
  { id: 2, name: 'Desarrollo Móvil' },
  { id: 3, name: 'Data Science' },
  { id: 4, name: 'Inteligencia Artificial' },
  { id: 5, name: 'DevOps & Cloud' },
  { id: 6, name: 'Ciberseguridad' },
  { id: 7, name: 'QA & Testing' },
  { id: 8, name: 'Diseño UX/UI' },
]

const FALLBACK_ROLES = [
  { id: 1, name: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer' },
  { id: 3, name: 'Fullstack Developer' },
  { id: 4, name: 'Mobile Developer' },
  { id: 5, name: 'UX/UI Designer' },
  { id: 6, name: 'QA Engineer' },
  { id: 7, name: 'DevOps Engineer' },
  { id: 8, name: 'Data Scientist' },
  { id: 9, name: 'Data Engineer' },
  { id: 10, name: 'Product Manager' },
  { id: 11, name: 'Scrum Master' },
  { id: 12, name: 'Tech Lead' },
]

const FALLBACK_INTERESTS = [
  { id: 1, name: 'E-commerce' },
  { id: 2, name: 'Fintech' },
  { id: 3, name: 'Salud' },
  { id: 4, name: 'Educación' },
  { id: 5, name: 'Logística' },
  { id: 6, name: 'Entretenimiento' },
  { id: 7, name: 'Sostenibilidad' },
  { id: 8, name: 'Gobierno' },
  { id: 9, name: 'Agroindustria' },
  { id: 10, name: 'Turismo' },
]

export const useCatalogsStore = defineStore('catalogs', () => {
  const technicalAreas = ref([])
  const roles = ref([])
  const interestAreas = ref([])
  const loaded = ref(false)
  
  async function fetchAll() {
    try {
      const [areasRes, rolesRes, interestsRes] = await Promise.all([
        api.get('/catalogs/technical-areas').catch(() => ({ data: FALLBACK_AREAS })),
        api.get('/catalogs/roles').catch(() => ({ data: FALLBACK_ROLES })),
        api.get('/catalogs/interest-areas').catch(() => ({ data: FALLBACK_INTERESTS })),
      ])
      
      technicalAreas.value = areasRes.data
      roles.value = rolesRes.data
      interestAreas.value = interestsRes.data
      loaded.value = true
    } catch (err) {
      console.error('Error cargando catálogos:', err)
    }
  }
  
  return { technicalAreas, roles, interestAreas, loaded, fetchAll }
})