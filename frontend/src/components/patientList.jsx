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
        
        /* Header Styling */
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
        
        /* Table Styling */
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
        
        /* Selected Row Styling */
        .patient-list-container table tbody tr[style*="rgb(238, 242, 255)"],
        .patient-list-container table tbody tr[style*="#eef2ff"] {
          background-color: #e8f4f8 !important;
          border-left: 4px solid #0077be;
          box-shadow: 0 2px 8px rgba(0, 119, 190, 0.15);
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
        
        /* Action Button */
        .patient-list-container table tbody tr td button {
          padding: 6px 16px;
          font-size: 12px;
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
        
        .patient-list-container table tbody tr td button:hover {
          background: #0077be;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 119, 190, 0.3);
        }
        
        .patient-list-container table tbody tr td button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 119, 190, 0.2);
        }
        
        /* Empty State */
        .patient-list-container table tbody tr.empty-state td {
          text-align: center;
          padding: 30px;
          color: #7f8c9a;
          font-style: italic;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .patient-list-container {
            padding: 20px;
          }
        
          .patient-list-container h3 {
            font-size: 20px;
          }
        
          /* Mobile Table Layout */
          .patient-list-container table {
            display: block;
            overflow-x: auto;
          }
        
          .patient-list-container table thead,
          .patient-list-container table tbody,
          .patient-list-container table tr,
          .patient-list-container table th,
          .patient-list-container table td {
            display: block;
          }
        
          .patient-list-container table thead {
            display: none;
          }
        
          .patient-list-container table tbody tr {
            margin-bottom: 12px;
            border: 2px solid #e1f0f7;
            border-radius: 8px;
            padding: 10px;
          }
        
          .patient-list-container table tbody tr td {
            position: relative;
            padding-left: 50%;
            text-align: right;
            border-bottom: 1px solid #e1f0f7;
            min-height: 35px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
        
          .patient-list-container table tbody tr td:last-child {
            border-bottom: none;
            justify-content: center;
            padding-left: 0;
          }
        
          .patient-list-container table tbody tr td::before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            width: 45%;
            padding-right: 10px;
            text-align: left;
            font-weight: 600;
            color: #0077be;
          }
        
          .patient-list-container table tbody tr td:last-child::before {
            content: none;
          }
        
          .patient-list-container table tbody tr td button {
            width: 100%;
            margin-top: 5px;
          }
        }
        
        /* Print Styles */
        @media print {
          .patient-list-container {
            box-shadow: none;
            border: 1px solid #000;
          }
        
          .patient-list-container table tbody tr td button {
            display: none;
          }
        
          .patient-list-container table tbody tr:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
      <div className='patient-list-container'>
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
    </div>
  );
}
