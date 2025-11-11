import React, { useEffect, useState } from 'react';
import { listPatients, getPatient, addPrescription } from '../api/api';
import PatientList from '../components/patientList';
import PrescriptionView from './PrescriptionView';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await listPatients();
    setPatients(data);
  }

  async function openPatient(id) {
    setSelectedId(id);
    const data = await getPatient(id);
    setPatient(data);
  }

  async function onSubmitPrescription(prescriptionPayload) {
    // payload: { doctorName, medicines: [{name,times,days}], notes }
    await addPrescription(selectedId, prescriptionPayload);
    // refresh patient
    const data = await getPatient(selectedId);
    setPatient(data);
    load();
  }

  return (
    <div className="doctor-grid">
      <div className="left">
        <PatientList patients={patients} onSelect={openPatient} />
      </div>
      <div className="right">
        {patient ? (
          <PrescriptionView patient={patient} onSubmitPrescription={onSubmitPrescription} />
        ) : <p>Select a patient to view/ prescribe</p>}
      </div>
    </div>
  );
}
