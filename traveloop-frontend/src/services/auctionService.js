import api from './api';

export const auctionService = {
  getAuctions: async () => (await api.get('/api/auctions')).data,
  getAuction: async (id) => (await api.get(`/api/auctions/${id}`)).data,
  placeBid: async (id, amount) => (await api.post(`/api/auctions/${id}/bid`, { amount })).data,
  createAuction: async (data) => (await api.post('/api/auctions', data)).data,
  closeAuction: async (id) => (await api.put(`/api/auctions/${id}/close`)).data,
};
