import api from './api';

export const projectService = {
  // RF-09/10: Feed paginado con filtros opcionales
  getFeed: async (params = {}) => {
    return api.get('/feed', { params });
  },

  // Proyectos de la empresa autenticada
  findAll: async () => {
    return api.get('/projects');
  },

  // Detalle de un proyecto por ID
  findOne: async (id) => {
    return api.get(`/projects/${id}`);
  },

  // RF-12: Crear proyecto
  create: async (data) => {
    return api.post('/projects', data);
  },

  // RF-12: Actualizar datos generales
  update: async (id, data) => {
    return api.patch(`/projects/${id}`, data);
  },

  // RF-09: Publicar proyecto (draft → published)
  publish: async (id) => {
    return api.patch(`/projects/${id}/publish`);
  },

  updateStatus: async (id, status) => {
    return api.patch(`/projects/${id}/status`, { status });
  },

  // RF-13: Actualizar visibilidad de campos
  updateVisibility: async (id, fieldVisibility) => {
    return api.patch(`/projects/${id}/visibility`, { fieldVisibility });
  },

  // RF-14: Configurar roles requeridos
  setRoleRequirements: async (id, requirements) => {
    return api.patch(`/projects/${id}/roles`, { requirements });
  },

  // RF-19: Conteo de vacantes
  getVacancies: async (id) => {
    return api.get(`/projects/${id}/vacancies`);
  },

  remove: async (id) => {
    return api.delete(`/projects/${id}`);
  },
};
