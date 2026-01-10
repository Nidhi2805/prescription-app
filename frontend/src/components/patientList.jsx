import React from 'react';

export default function PatientList({ patients, onSelect, selectedId }) {
  return (
    <div>
      <style>{`
        .patient-list-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #e1f0f7;
        }
        
        .patient-list-container h3 {
          color: #003d5c;
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e1f0f7;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .patient-list-container h3::before {
          content: '👥';
          font-size: 24px;
        }

        .patient-list-container table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
        }

        .patient-list-container table thead {
          background: linear-gradient(135deg, #0077be 0%, #005a94 100%);
        }

        .patient-list-container table thead tr th {
          padding: 12px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #ffffff;
          border: none;
        }

        .patient-list-container table tbody tr {
          background-color: #ffffff;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .patient-list-container table tbody tr:nth-child(even) {
          background-color: #f8fbfd;
        }

        .patient-list-container table tbody tr:hover {
          background-color: #f0f8ff;
          transform: scale(1.005);
          box-shadow: 0 2px 8px rgba(0, 119, 190, 0.1);
        }

        .patient-list-container table tbody tr td {
          padding: 12px 14px;
          border-bottom: 1px solid #e1f0f7;
          color: #2c3e50;
          font-size: 14px;
        }

        .patient-list-container table tbody tr:last-child td {
          border-bottom: none;
        }

        .patient-list-container table tbody tr td button {
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          border: 2px solid #0077be;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #0077be;
        }

        .patient-list-container table tbody tr td button:hover {
          background: #0077be;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 119, 190, 0.3);
        }

      `}</style>

      <div className="patient-list-container">

        <h3>Patients</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
  {patients.map((p, index) => (
    <tr
      key={`${p.patientId}-${index}`}
      style={{
        backgroundColor:
          selectedId === p.patientId ? '#eef2ff' : 'transparent'
      }}
    >
      <td>{p.patientId}</td>
      <td>{p.name}</td>
      <td>{p.age}</td>
      <td>
        <button onClick={() => onSelect(p.patientId)}>
          Open
        </button>
      </td>
    </tr>
  ))}

  {patients.length === 0 && (
    <tr className="empty-state">
      <td colSpan="4">No patients found</td>
    </tr>
  )}
</tbody>

        </table>
      </div>

    </div>
  );
}
