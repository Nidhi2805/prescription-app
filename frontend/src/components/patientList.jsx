import React from 'react';

export default function PatientList({ patients, onSelect, selectedId }) {
  return (
    <div>
      <h3>Patients</h3>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {patients.map(p => (
            <tr
              key={p.patientId}
              style={{
                backgroundColor:
                  selectedId === p.patientId ? '#eef2ff' : 'transparent'
              }}
            >
              <td>{p.patientId}</td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>
                {/* 🔴 THIS IS THE IMPORTANT PART */}
                <button onClick={() => onSelect(p.patientId)}>
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
