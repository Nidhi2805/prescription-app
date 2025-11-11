import React from 'react';

export default function PatientList({ patients, onSelect }) {
  return (
    <div>
      <h3>Patients</h3>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Action</th></tr></thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.patientId}>
              <td>{p.patientId}</td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td><button onClick={() => onSelect(p.patientId)}>Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
