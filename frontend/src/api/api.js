import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Named API functions ---
export const createPatient = data =>
  axios.post(`${BASE}/patients`, data).then(r => r.data);

export const listPatients = () =>
  axios.get(`${BASE}/patients`).then(r => r.data);

export const getPatient = id =>
  axios.get(`${BASE}/patients/${id}`).then(r => r.data);

  export const addPrescription = (id, data) =>
  axios.post(`${BASE}/patients/${id}/prescriptions`, data)
       .then(r => r.data);


export async function searchPatients(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/patients/search?${query}`);
  return res.json();
}

// --- Default Export (IMPORTANT FIX) ---
const api = {
  createPatient,
  listPatients,
  getPatient,
  addPrescription,
  searchPatients
};

export default api;
