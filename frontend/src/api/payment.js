// =========================================================================
// payment.js — Kòmanse yon peman (MonCash oswa Kat Stripe) pou yon kòmand
// =========================================================================
// Nou konsève ID kòmand lan nan localStorage anvan nou kite sit la (nou
// pral navige sou paj MonCash/Stripe, ki soti nèt sou yon lòt sit). Lè
// kliyan an tounen sou /payment/return, paj sa a li valè a pou l konnen
// ki kòmand pou l verifye.
import api from './client';

const PENDING_KEY = 'pending_order_id';
const METHOD_KEY = 'pending_payment_method';

export async function startPayment(orderId, method = 'MONCASH') {
  const endpoint =
    method === 'CARD' ? '/payments/stripe/initiate' : '/payments/moncash/initiate';
  const res = await api.post(endpoint, { orderId });
  localStorage.setItem(PENDING_KEY, orderId);
  localStorage.setItem(METHOD_KEY, method);
  window.location.href = res.data.redirectUrl;
}

export function getPendingOrderId() {
  return localStorage.getItem(PENDING_KEY);
}

export function getPendingMethod() {
  return localStorage.getItem(METHOD_KEY) || 'MONCASH';
}

export function clearPending() {
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(METHOD_KEY);
}
