import React, { useState } from 'react';
import { searchPatients } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function SearchPatient() {
  const navigate = useNavigate();

  const [criteria, setCriteria] = useState({
    patientId: '',
    name: '',
    contact: ''
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function onChange(e) {
    setCriteria({ ...criteria, [e.target.name]: e.target.value });
  }

  async function onSearch() {
    // ✅ validation
    if (!criteria.patientId && !criteria.name && !criteria.contact) {
      alert('Enter Patient ID OR Name OR Contact');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);

    try {
      const params = {};
      if (criteria.patientId) params.patientId = criteria.patientId;
      if (criteria.name) params.name = criteria.name;
      if (criteria.contact) params.contact = criteria.contact;

      console.log('🔍 Sending search params:', params);

      const data = await searchPatients(params);

      console.log('✅ Search API response:', data);

      if (!Array.isArray(data)) {
        throw new Error('Invalid response from server');
      }

      if (data.length === 0) {
        setMessage('No patients found');
      } else {
        setResults(data);
      }

    } catch (err) {
      console.error('❌ Search error:', err);
      setMessage('Search failed. Check console.');
    } finally {
      setLoading(false); // 🔴 THIS WAS THE MISSING PIECE IN MOST CASES
    }
  }

  function openPatient(patientId) {
    navigate(`/doctor/${patientId}`);
  }

  return (
    <div className="card">
      <h2>🔍 Search Old Patient</h2>

      <input
        name="patientId"
        placeholder="Patient ID"
        value={criteria.patientId}
        onChange={onChange}
      />

      <input
        name="name"
        placeholder="Name (any part)"
        value={criteria.name}
        onChange={onChange}
      />

      <input
        name="contact"
        placeholder="Contact Number"
        value={criteria.contact}
        onChange={onChange}
      />

      <button onClick={onSearch}>Search</button>

      {loading && <p>Searching...</p>}
      {message && <p>{message}</p>}

      {/* ✅ RESULTS TABLE */}
      {results.length > 0 && (
        <table style={{ marginTop: '15px', width: '100%' }}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Doctor</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map(p => (
              <tr key={p.patientId}>
                <td>{p.patientId}</td>
                <td>{p.name}</td>
                <td>{p.contact}</td>
                <td>{p.assignedDoctor}</td>
                <td>
                  <button onClick={() => openPatient(p.patientId)}>
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
