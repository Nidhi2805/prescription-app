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
  );
}