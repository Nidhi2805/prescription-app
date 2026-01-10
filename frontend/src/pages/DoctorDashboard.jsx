import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listPatients, getPatient, addPrescription } from '../api/api';
import PatientList from '../components/PatientList';
import PrescriptionView from './PrescriptionView';

export default function DoctorDashboard() {
  const { patientId } = useParams(); // 👈 GET ID FROM URL

  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [patient, setPatient] = useState(null);

  // Load patient list (OPD queue)
  useEffect(() => {
    loadPatients();
  }, []);

  // Auto-open patient if navigated from Search → Open
  useEffect(() => {
    if (patientId) {
      openPatient(patientId);
    }
  }, [patientId]);

  async function loadPatients() {
    const data = await listPatients();
    setPatients(data);
  }

  async function openPatient(id) {
    setSelectedId(id);
    const data = await getPatient(id);
    setPatient(data);
  }

  async function onSubmitPrescription(prescriptionPayload) {
    await addPrescription(selectedId, prescriptionPayload);

    // Reload patient after prescription save
    const data = await getPatient(selectedId);
    setPatient(data);

    // Refresh queue
    loadPatients();
  }

  return (
    <div>
      <style>{`
        .doctor-grid .right > h2 {
          color: #003d5c;
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #e1f0f7;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .doctor-grid .right > h2::before {
          content: '📋';
          font-size: 28px;
        }
        
        /* Patient Info Paragraphs */
        .doctor-grid .right > p {
          font-size: 15px;
          color: #2c3e50;
          margin: 12px 0;
          padding: 10px 14px;
          background: linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%);
          border-radius: 8px;
          border-left: 4px solid #0077be;
        }
        
        .doctor-grid .right > p strong {
          color: #0077be;
          font-weight: 600;
        }
        
        /* Allergy Warning */
        .doctor-grid .right > p[style*="red"] {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%) !important;
          border-left: 4px solid #dc3545 !important;
          color: #721c24 !important;
          font-weight: 600 !important;
          padding: 14px 18px !important;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
          animation: pulseWarning 2s ease-in-out infinite;
        }
        
        @keyframes pulseWarning {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
          }
          50% {
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.25);
          }
        }
        
        /* Empty State - No Patient Selected */
        .doctor-grid .right > p:only-child {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #7f8c9a;
          font-style: italic;
          background: linear-gradient(135deg, #f8fbfd 0%, #ffffff 100%);
          border-radius: 12px;
          border: 2px dashed #d4e6f1;
          margin: 40px 0;
        }
        
        .doctor-grid .right > p:only-child::before {
          content: '👨‍⚕️';
          display: block;
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        /* Custom Scrollbar for Left Panel */
        .doctor-grid .left::-webkit-scrollbar {
          width: 8px;
        }
        
        .doctor-grid .left::-webkit-scrollbar-track {
          background: #f0f8ff;
          border-radius: 4px;
        }
        
        .doctor-grid .left::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #0077be 0%, #005a94 100%);
          border-radius: 4px;
        }
        
        .doctor-grid .left::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #005a94 0%, #004773 100%);
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .doctor-grid {
            grid-template-columns: 300px 1fr;
            gap: 20px;
            padding: 20px;
          }
        
          .doctor-grid .left {
            padding: 15px;
          }
        
          .doctor-grid .right {
            padding: 20px;
          }
        
          .doctor-grid .right > h2 {
            font-size: 24px;
          }
        }
        
        @media (max-width: 768px) {
          .doctor-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 15px;
          }
        
          .doctor-grid .left {
            position: relative;
            top: 0;
            max-height: 400px;
            margin-bottom: 10px;
          }
        
          .doctor-grid .right {
            padding: 20px 15px;
            min-height: auto;
          }
        
          .doctor-grid .right > h2 {
            font-size: 22px;
          }
        
          .doctor-grid .right > h2::before {
            font-size: 24px;
          }
        
          .doctor-grid .right > p {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
        
        /* Mobile - Stack Layout */
        @media (max-width: 480px) {
          .doctor-grid {
            padding: 10px;
            gap: 15px;
          }
        
          .doctor-grid .left {
            padding: 12px;
            max-height: 350px;
          }
        
          .doctor-grid .right {
            padding: 15px;
          }
        
          .doctor-grid .right > h2 {
            font-size: 20px;
            flex-direction: column;
            align-items: flex-start;
          }
        
          .doctor-grid .right > p:only-child {
            padding: 40px 15px;
            font-size: 16px;
          }
        
          .doctor-grid .right > p:only-child::before {
            font-size: 48px;
          }
        }
        
        /* Loading State */
        .doctor-grid .loading {
          text-align: center;
          padding: 40px;
          color: #7f8c9a;
          font-style: italic;
        }
        
        .doctor-grid .loading::before {
          content: '⏳';
          display: block;
          font-size: 48px;
          margin-bottom: 15px;
          animation: rotate 2s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Print Styles */
        @media print {
          .doctor-grid {
            background: white;
            padding: 0;
            display: block;
          }
        
          .doctor-grid .left {
            display: none;
          }
        
          .doctor-grid .right {
            box-shadow: none;
            border: none;
            padding: 0;
          }
        }
        
        /* Accessibility - Focus States */
        .doctor-grid .left:focus-within {
          box-shadow: 0 4px 20px rgba(0, 119, 190, 0.15);
        }
        
        .doctor-grid .right:focus-within {
          box-shadow: 0 4px 20px rgba(0, 119, 190, 0.15);
        }
        
        /* Animation for Panel Loading */
        .doctor-grid .left,
        .doctor-grid .right {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="doctor-grid">
        {/* LEFT: OPD Patient Queue */}
        <div className="left">
          <PatientList
            patients={patients}
            onSelect={openPatient}
            selectedId={selectedId}
          />
        </div>

        {/* RIGHT: Patient File */}
        <div className="right">
          {patient ? (
            <>
              <h2>
                Patient: {patient.name} ({patient.patientId})
              </h2>

              <p>
                <strong>Assigned Doctor:</strong> {patient.assignedDoctor}
              </p>

              <p style={{ color: 'red', fontWeight: 'bold' }}>
                ⚠ Allergies: {patient.allergies || 'None'}
              </p>

              <PrescriptionView
                patient={patient}
                onSubmitPrescription={onSubmitPrescription}
              />
            </>
          ) : (
            <p>Select a patient to view / prescribe</p>
          )}
        </div>
      </div>
    </div>
  );
}