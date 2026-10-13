import api from './api'

export const fundingService = {
  // Empresa: hacer oferta
  createOffer: (projectId, data) =>
    api.post(`/funding/projects/${projectId}/offers`, data),

  // Creador: ver todas las ofertas de su proyecto
  getProjectOffers: (projectId) =>
    api.get(`/funding/projects/${projectId}/offers`),

  // Empresa: ver mis ofertas en un proyecto
  getMyOffers: (projectId) =>
    api.get(`/funding/projects/${projectId}/my-offers`),

  // Progreso de financiamiento (meta, recaudado, restante, financistas)
  getSummary: (projectId) =>
    api.get(`/funding/projects/${projectId}/summary`),

  // Creador: contraofertar
  counterOffer: (offerId, data) =>
    api.post(`/funding/offers/${offerId}/counter`, data),

  // Creador: aceptar oferta
  acceptOffer: (offerId) =>
    api.patch(`/funding/offers/${offerId}/accept`),

  // Creador: rechazar oferta
  rejectOffer: (offerId) =>
    api.patch(`/funding/offers/${offerId}/reject`),
}