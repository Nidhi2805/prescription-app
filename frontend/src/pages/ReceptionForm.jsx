import React, { useState } from 'react';
import { createPatient } from '../api/api';

export default function ReceptionForm() {
  const [form, setForm] = useState({
    name: '', age: '', weight: '', height: '', caseHistory: '', contact: ''
  });
  const [status, setStatus] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const resp = await createPatient({
        name: form.name,
        age: Number(form.age || 0),
        weight: Number(form.weight || 0),
        height: Number(form.height || 0),
        caseHistory: form.caseHistory,
        contact: form.contact
      });
      setStatus(`Saved. Patient ID: ${resp.patientId}`);
      setForm({ name:'', age:'', weight:'', height:'', caseHistory:'', contact:'' });
    } catch (err) {
      console.error(err);
      setStatus('Error saving');
    }
  }

  return (
    <div className="card">
      <h2>Reception — New Patient</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Full name" value={form.name} onChange={onChange} required/>
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={onChange}/>
        <input name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={onChange}/>
        <input name="height" type="number" placeholder="Height (cm)" value={form.height} onChange={onChange}/>
        <input name="contact" placeholder="Contact" value={form.contact} onChange={onChange}/>
        <textarea name="caseHistory" placeholder="Case history" value={form.caseHistory} onChange={onChange}/>
        <button type="submit">Save & Generate ID</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
