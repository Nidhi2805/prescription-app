import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const searchMedicines = (q) =>
  axios.get(`${BASE}/medicines?search=${encodeURIComponent(q)}`).then(r => r.data);
