import api from './api';

export const applicationService = {
  // RF-15: Postular a un proyecto (persona natural)
  apply: async (projectId, roleId, message = null) => {
    return api.post('/applications', { projectId, roleId, message });
  },

  // Mis postulaciones (persona natural)
  getMyApplications: async () => {
    return api.get('/applications/mine');
  },

  // RF-16: Postulaciones de un proyecto específico (empresa)
  getProjectApplications: async (projectId) => {
    return api.get(`/applications/project/${projectId}`);
  },

  // Equipo actual de un proyecto (empresa)
  getProjectTeam: async (projectId) => {
    return api.get(`/applications/project/${projectId}/team`);
  },

  // RF-18: Aceptar postulación
  accept: async (applicationId) => {
    return api.patch(`/applications/${applicationId}/accept`);
  },

  // RF-18: Rechazar postulación
  reject: async (applicationId) => {
    return api.patch(`/applications/${applicationId}/reject`);
  },

  // Marcar postulación en revisión
  markInReview: async (applicationId) => {
    return api.patch(`/applications/${applicationId}/review`);
  },
};
