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
    navigate(`/doctor/${patientId}?view=prescription`);
  }

  return (
    <div>
      <style>{`
        .card {
          max-width: 900px;
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
        }
        
        /* Input Fields */
        .card input {
          padding: 12px 16px;
          border: 2px solid #d4e6f1;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
          background-color: #fafcfd;
          width: 100%;
          margin-bottom: 15px;
        }
        
        .card input:focus {
          outline: none;
          border-color: #0077be;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 119, 190, 0.1);
        }
        
        .card input::placeholder {
          color: #7f8c9a;
        }
        
        /* Search Button */
        .card > button {
          width: 100%;
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
          background: linear-gradient(135deg, #0077be 0%, #005a94 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 119, 190, 0.3);
          margin-bottom: 20px;
        }
        
        .card > button:hover {
          background: linear-gradient(135deg, #005a94 0%, #004773 100%);
          box-shadow: 0 6px 16px rgba(0, 119, 190, 0.4);
          transform: translateY(-2px);
        }
        
        .card > button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 119, 190, 0.3);
        }
        
        /* Status Messages */
        .card > p {
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          font-size: 15px;
          margin: 15px 0;
          animation: slideIn 0.3s ease;
        }
        
        .card > p:first-of-type {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
          border: 2px solid #ffc107;
        }
        
        /* Table Styling */
        .card table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .card table thead {
          background: linear-gradient(135deg, #0077be 0%, #005a94 100%);
        }
        
        .card table thead tr th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #ffffff;
          border: none;
        }
        
        .card table tbody tr {
          background-color: #ffffff;
          transition: all 0.2s ease;
        }
        
        .card table tbody tr:nth-child(even) {
          background-color: #f8fbfd;
        }
        
        .card table tbody tr:hover {
          background-color: #e8f4f8;
          transform: scale(1.01);
          box-shadow: 0 2px 8px rgba(0, 119, 190, 0.1);
        }
        
        .card table tbody tr td {
          padding: 14px 16px;
          border-bottom: 1px solid #e1f0f7;
          color: #2c3e50;
          font-size: 14px;
        }
        
        .card table tbody tr:last-child td {
          border-bottom: none;
        }
        
        /* Table Action Button */
        .card table tbody tr td button {
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid #0077be;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #ffffff;
          color: #0077be;
        }
        
        .card table tbody tr td button:hover {
          background: #0077be;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 119, 190, 0.3);
        }
        
        .card table tbody tr td button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 119, 190, 0.2);
        }
        
        /* Responsive Table */
        @media (max-width: 768px) {
          .card {
            padding: 25px;
            margin: 20px auto;
            max-width: 95%;
          }
        
          .card h2 {
            font-size: 24px;
          }
        
          .card input {
            padding: 10px 14px;
            font-size: 14px;
          }
        
          .card > button {
            padding: 12px 20px;
            font-size: 14px;
          }
        
          /* Stack table for mobile */
          .card table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
        
          .card table thead,
          .card table tbody,
          .card table tr,
          .card table th,
          .card table td {
            display: block;
          }
        
          .card table thead {
            display: none;
          }
        
          .card table tbody tr {
            margin-bottom: 15px;
            border: 2px solid #e1f0f7;
            border-radius: 8px;
            padding: 10px;
          }
        
          .card table tbody tr td {
            position: relative;
            padding-left: 50%;
            text-align: right;
            border-bottom: 1px solid #e1f0f7;
          }
        
          .card table tbody tr td:last-child {
            border-bottom: none;
          }
        
          .card table tbody tr td::before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            width: 45%;
            padding-right: 10px;
            text-align: left;
            font-weight: 600;
            color: #0077be;
          }
        
          .card table tbody tr td button {
            width: 100%;
            margin-top: 5px;
          }
        }
        
        /* Animation */
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
        
        /* Loading State */
        .card > p:contains("Searching") {
          background: linear-gradient(135deg, #cce5ff 0%, #99ccff 100%);
          color: #004085;
          border: 2px solid #0077be;
        }
        
        /* Empty State */
        .card > p:contains("No patients") {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
          border: 2px solid #ffc107;
        }
        
        /* Error State */
        .card > p:contains("failed") {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          color: #721c24;
          border: 2px solid #dc3545;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
          }
          
          .card {
            box-shadow: none;
            border: 1px solid #000;
          }
          
          .card > button {
            display: none;
          }
        
          .card table tbody tr td button {
            display: none;
          }
        }
      `}</style>
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
    </div>
  );
}
