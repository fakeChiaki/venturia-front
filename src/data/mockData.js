export const roleLabels = {
  developer: 'Desarrollador',
  scrum_master: 'Scrum Master',
  project_manager: 'Project Manager',
  product_owner: 'Product Owner',
  designer: 'Diseñador',
  qa_engineer: 'QA Engineer',
  devops: 'DevOps',
  data_analyst: 'Analista de Datos',
}

export const technicalAreaLabels = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full Stack',
  mobile: 'Mobile',
  data_science: 'Data Science',
  devops: 'DevOps',
  security: 'Seguridad',
  ai_ml: 'IA / ML',
}

export const availabilityLabels = {
  full_time: 'Tiempo Completo',
  part_time: 'Medio Tiempo',
  freelance: 'Freelance',
  contract: 'Contrato',
}

export const projectStatusLabels = {
  draft: 'Borrador',
  open: 'Abierto',
  negotiating: 'Negociando',
  funded: 'Financiado',
  seeking_team: 'Buscando Equipo',
  in_progress: 'En Progreso',
  cancelled: 'Cancelado',
  finished: 'Finalizado',
}

export const applicationStatusLabels = {
  pending: 'Pendiente',
  in_review: 'En Revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}

export const methodologyLabels = {
  scrum: 'Scrum',
  kanban: 'Kanban',
  hybrid: 'Híbrido',
}

export const mockProjects = [
  {
    id: 'proj-1',
    name: 'E-commerce Sustentable',
    description: 'Plataforma de ventas para productos ecológicos locales.',
    ownerId: 'usr-1', // TU USUARIO
    ownerName: 'Fernando Robles',
    status: 'published',
    rolesNeeded: ['developer', 'designer'],
    technicalAreas: ['frontend', 'backend'],
    availability: 'part_time',
    methodology: 'scrum',
    affinityScore: 95,
    createdAt: '2026-06-01T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80',
    publicDocuments: []
  },
  {
    id: 'proj-2',
    name: 'App de Tracking Financiero',
    description: 'Aplicación móvil para finanzas personales.',
    ownerId: 'usr-1', // TU USUARIO
    ownerName: 'Fernando Robles',
    status: 'in_progress',
    rolesNeeded: ['developer', 'qa_engineer'],
    technicalAreas: ['mobile', 'backend'],
    availability: 'freelance',
    methodology: 'kanban',
    affinityScore: 80,
    createdAt: '2026-05-15T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
    publicDocuments: []
  },
  {
    id: 'proj-3',
    name: 'IA para Diagnóstico Agrícola',
    description: 'Sistema de Machine Learning para detectar enfermedades en cultivos.',
    ownerId: 'usr-99', // OTRA EMPRESA
    ownerName: 'AgroTech SPA',
    status: 'published',
    rolesNeeded: ['data_analyst', 'developer'],
    technicalAreas: ['data_science', 'backend'],
    availability: 'full_time',
    methodology: 'scrum',
    affinityScore: 60,
    createdAt: '2026-06-10T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=500&q=80',
    publicDocuments: []
  }
]

export const mockApplications = [
  {
    id: 'app-1',
    projectId: 'proj-3', 
    userId: 'usr-1', // TÚ POSTULASTE
    userName: 'Fernando Robles',
    status: 'pending',
    message: 'Tengo 3 años de experiencia en Python.',
    appliedAt: '2026-06-12T14:30:00Z',
    respondedAt: null
  },
  {
    id: 'app-2',
    projectId: 'proj-1', // OTRA PERSONA POSTULÓ A TU PROYECTO
    userId: 'usr-45', 
    userName: 'Camila Soto',
    status: 'pending',
    message: 'Soy diseñadora UX/UI.',
    appliedAt: '2026-06-14T09:15:00Z',
    respondedAt: null
  }
]
