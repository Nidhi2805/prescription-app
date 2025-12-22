import React, { useState } from 'react';
import { createPatient } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ReceptionForm() {
  // ✅ useNavigate MUST be inside component
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    age: '',
    contact: '',
    address: '',
    assignedDoctor: '',
    allergies: ''
  });

  const [status, setStatus] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');

    const fullName = `${form.firstName} ${form.middleName} ${form.lastName}`
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const resp = await createPatient({
        name: fullName,
        dob: form.dob,
        age: Number(form.age || 0),
        contact: form.contact,
        address: form.address,
        assignedDoctor: form.assignedDoctor,
        allergies: form.allergies || 'None'
      });

      setStatus(`Saved. Patient ID: ${resp.patientId}`);

      setForm({
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        age: '',
        contact: '',
        address: '',
        assignedDoctor: '',
        allergies: ''
      });

    } catch (err) {
      console.error(err);
      setStatus('Error saving');
    }
  }

  // ✅ Correct place for search handler
  function onSearchOldPatient() {
    navigate('/search-patient');
  }

  return (
    <div className="card">
      <h2>Reception — New Patient</h2>

      <form onSubmit={onSubmit}>

        {/* Name Fields */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={onChange}
            required
          />
          <input
            name="middleName"
            placeholder="Middle Name"
            value={form.middleName}
            onChange={onChange}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={onChange}
            required
          />
        </div>

        {/* Date of Birth */}
        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={onChange}
          required
        />

        {/* Age */}
        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={onChange}
        />

        {/* Contact */}
        <input
          name="contact"
          placeholder="Phone No."
          value={form.contact}
          onChange={onChange}
        />

        {/* Address */}
        <textarea
          name="address"
          placeholder="Full Address"
          value={form.address}
          onChange={onChange}
          rows="2"
          required
        />

        {/* Assigned Doctor */}
        <input
          name="assignedDoctor"
          placeholder="Assigned Doctor (e.g. Dr. Sharma)"
          value={form.assignedDoctor}
          onChange={onChange}
          required
        />

        {/* Allergies */}
        <input
          name="allergies"
          placeholder="Allergies (e.g. Penicillin, Dust, None)"
          value={form.allergies}
          onChange={onChange}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit">
            Save & Generate ID
          </button>

          <button
            type="button"
            onClick={onSearchOldPatient}
          >
            Search Old Patient
          </button>
        </div>

      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
