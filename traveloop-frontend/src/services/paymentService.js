import api from './api';

export const paymentService = {
  createIntent: async (orderId, method = 'DEV_GATEWAY') =>
    (await api.post('/api/payments/create-intent', { orderId, method })).data,
  verifyPayment: async (transactionId, paymentId, simulatedStatus = 'SUCCESS') =>
    (await api.post('/api/payments/verify', { transactionId, paymentId, simulatedStatus })).data,
};
