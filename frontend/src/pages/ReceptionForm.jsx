import React, { useState } from 'react';
import { createPatient } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ReceptionForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    age: '',
    contact: '',
    address: '',
    assignedDoctor: 'Dr. Anand Rajgopal Karva',
    allergies: '',
    weight: '',
    sex: ''              // ✅ NEW FIELD
  });

  const [status, setStatus] = useState(null);

  function calculateAge(dobValue) {
    if (!dobValue) return '';
    const birthDate = new Date(dobValue);
    if (Number.isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age >= 0 ? String(age) : '';
  }

  function onChange(e) {
    const { name, value } = e.target;

    if (name === 'dob') {
      setForm({
        ...form,
        dob: value,
        age: value ? calculateAge(value) : ''
      });
      return;
    }

    setForm({ ...form, [name]: value });
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
        dob: form.dob || null,
        age: Number(form.age || 0),
        contact: form.contact,
        address: form.address,
        assignedDoctor: form.assignedDoctor,
        allergies: form.allergies || 'None',
        weight: Number(form.weight || 0),   // ✔ weight passed
        sex: form.sex || ''          // ✔ sex passed to backend
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
        assignedDoctor: 'Dr. Anand Rajgopal Karva',
        allergies: '',
        weight: '',
        sex: ''
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || 'Error saving';
      setStatus(errorMessage);
    }
  }

  function onSearchOldPatient() {
    navigate('/search-patient');
  }

  return (
    <div>
      <style>{`
        .card {
          max-width: 800px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 40px;
          border-top: 5px solid #0077be;
        }

        .card h2 {
          color: #003d5c;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1f0f7;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card h2::before {
          content: '⚕️';
          font-size: 32px;
        }

        .card form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .card input,
        .card textarea,
        .card select {
          padding: 12px 16px;
          border: 2px solid #d4e6f1;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
          background-color: #fafcfd;
          width: 100%;
        }

        .card input:focus,
        .card textarea:focus,
        .card select:focus {
          outline: none;
          border-color: #0077be;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 119, 190, 0.1);
        }

        .card input::placeholder,
        .card textarea::placeholder {
          color: #7f8c9a;
        }

        .card textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .card select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230077be' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 35px;
        }

        .card input:required,
        .card textarea:required,
        .card select:required {
          border-left: 4px solid #0077be;
        }

        .card button {
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card button[type="submit"] {
          background: linear-gradient(135deg, #0077be 0%, #005a94 100%);
          color: white;
          flex: 1;
          box-shadow: 0 4px 12px rgba(0, 119, 190, 0.3);
        }

        .card button[type="submit"]:hover {
          background: linear-gradient(135deg, #005a94 0%, #004773 100%);
          box-shadow: 0 6px 16px rgba(0, 119, 190, 0.4);
          transform: translateY(-2px);
        }

        .card button[type="submit"]:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 119, 190, 0.3);
        }

        .card button[type="button"] {
          background: #ffffff;
          color: #0077be;
          border: 2px solid #0077be;
          flex: 1;
        }

        .card button[type="button"]:hover {
          background: #f0f8ff;
          border-color: #005a94;
          color: #005a94;
          transform: translateY(-2px);
        }

        .card button[type="button"]:active {
          transform: translateY(0);
        }

        .card p {
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          font-size: 15px;
          animation: slideIn 0.3s ease;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          border: 2px solid #28a745;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .card {
            padding: 25px;
            margin: 20px auto;
          }

          .card h2 {
            font-size: 24px;
          }

          .card button {
            padding: 12px 20px;
            font-size: 14px;
          }

          .card input,
          .card textarea,
          .card select {
            padding: 10px 14px;
            font-size: 14px;
          }
        }
      `}</style>
      <div className="card">
        <h2>Reception — New Patient</h2>

        <form onSubmit={onSubmit}>

          {/* Name Fields */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="firstName" placeholder="First Name"
              value={form.firstName} onChange={onChange} required />

            <input name="middleName" placeholder="Middle Name"
              value={form.middleName} onChange={onChange} />

            <input name="lastName" placeholder="Last Name"
              value={form.lastName} onChange={onChange} required />
          </div>

          {/* Date of Birth */}
          <input name="dob" type="date"
            value={form.dob} onChange={onChange}  />

          {/* Age, Weight, Sex */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="age" type="number" placeholder="Age"
              value={form.age} onChange={onChange} style={{ flex: 1 }} />

            <input name="weight" type="number" placeholder="Weight (e.g., 65 kg)"
              value={form.weight} onChange={onChange} style={{ flex: 1 }} />

            {/* 🔥 NEW SEX FIELD */}
            <select
              name="sex"
              value={form.sex}
              onChange={onChange}
              style={{ flex: 1, padding: '8px' }}
              required
            >
              <option value="">Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Contact */}
          <input name="contact" placeholder="Phone No."
            value={form.contact} onChange={onChange} />

          {/* Address */}
          <textarea name="address" placeholder="Full Address"
            value={form.address} onChange={onChange} rows="2" required />

          {/* Assigned Doctor */}
          <input name="assignedDoctor"
            placeholder="Assigned Doctor (e.g. Dr. Sharma)"
            value={form.assignedDoctor} onChange={onChange} required />

          {/* Allergies */}
          <input name="allergies"
            placeholder="Allergies (e.g. Penicillin, Dust, None)"
            value={form.allergies} onChange={onChange} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit">Save & Generate ID</button>
            <button type="button" onClick={onSearchOldPatient}>Search Old Patient</button>
          </div>

        </form>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}
