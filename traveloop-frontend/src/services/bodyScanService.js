import api from './api';

export const bodyScanService = {
  saveScan: async (scanData) => (await api.post('/api/body-scan/save', scanData)).data,
  getMyScans: async () => (await api.get('/api/body-scan/my-scans')).data,
  getLatest: async () => (await api.get('/api/body-scan/latest')).data,
  getRecommendation: async (productId) => (await api.get(`/api/body-scan/recommendation/${productId}`)).data,
};
