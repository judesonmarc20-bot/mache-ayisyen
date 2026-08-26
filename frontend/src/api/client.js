// =========================================================================
// client.js — Yon sèl kote ki pale ak backend la
// =========================================================================
// Nou itilize "axios" pou fè demand HTTP. Yon "interceptor" ajoute
// otomatikman jeton (token) JWT a nan chak demand si itilizatè a konekte.
//
// baseURL:
//   - Nan devlopman (npm run dev): VITE_API_URL = http://localhost:4000/api
//   - Nan pwodiksyon (npm run build): VITE_API_URL = /api (relatif), paske
//     backend la sèvi frontend la sou menm domèn nan.
// =========================================================================
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
