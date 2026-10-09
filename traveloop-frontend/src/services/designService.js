import api from './api';

export const designService = {
  saveDesign: async (data) => (await api.post('/api/designs', data)).data,
  getMyDesigns: async () => (await api.get('/api/designs/my-designs')).data,
  getDesign: async (id) => (await api.get(`/api/designs/${id}`)).data,
  updateDesign: async (id, data) => (await api.put(`/api/designs/${id}`, data)).data,
  deleteDesign: async (id) => (await api.delete(`/api/designs/${id}`)).data,
  requestQuote: async (id) => (await api.post(`/api/designs/${id}/quote`)).data,
};
