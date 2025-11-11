import React, { useState } from 'react';
import MedicineAutocomplete from '../components/MedicineAutocomplete'; // 🔹 Autocomplete search

// MedicineRow Component
function MedicineRow({ idx, med, onChange, onRemove }) {
  // When doctor selects medicine from autocomplete
  function handleSelect(medFromDb) {
    // Autofill name, defaultTimes, defaultDays
    onChange(idx, {
      name: medFromDb.name,
      times: medFromDb.defaultTimes || '1-0-0',
      days: medFromDb.defaultDays || 1
    });
  }

  return (
    <div className="medicine-row">
      {/* Medicine Autocomplete Search */}
      <MedicineAutocomplete
        value={med.name}
        onSelect={handleSelect}
      />

      {/* Editable Times */}
      <input
        placeholder="Times (ex: 1-1-0)"
        value={med.times}
        onChange={e => onChange(idx, { ...med, times: e.target.value })}
      />

      {/* Editable Days */}
      <input
        placeholder="Days"
        type="number"
        value={med.days}
        onChange={e => onChange(idx, { ...med, days: Number(e.target.value) })}
      />

      <button onClick={() => onRemove(idx)}>Remove</button>
    </div>
  );
}

// PrescriptionView Main Component
export default function PrescriptionView({ patient, onSubmitPrescription }) {
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', times: '1-0-0', days: 1 }]);

  function changeMed(i, m) {
    const copy = [...medicines];
    copy[i] = m;
    setMedicines(copy);
  }

  function removeMed(i) {
    setMedicines(medicines.filter((_, idx) => idx !== i));
  }

  function addMed() {
    setMedicines([...medicines, { name: '', times: '1-0-0', days: 1 }]);
  }

  function computeTotalMedicines() {
    return medicines.length;
  }

  function computeTotalQuantities() {
    return medicines.reduce((sum, m) => {
      const times = m.times.split('-').map(x => Number(x || 0)).reduce((a, b) => a + b, 0);
      return sum + (times * (m.days || 0));
    }, 0);
  }

  async function submit() {
    if (!medicines || medicines.length === 0) {
      alert('Add at least one medicine');
      return;
    }
    if (medicines.some(m => !m.name || !m.times || !m.days)) {
      alert('Fill all medicine fields');
      return;
    }
    const payload = { doctorName, medicines, notes };
    await onSubmitPrescription(payload);
    alert('Prescription saved');
  }

  function printPrescription() {
    window.print();
  }

  return (
    <div>
      <h2>Patient: {patient.name} — {patient.patientId}</h2>
      <p>Age: {patient.age} | Weight: {patient.weight} | Height: {patient.height}</p>
      <p>Case history: {patient.caseHistory}</p>

      <div className="prescribe-box">
        <input
          placeholder="Doctor name"
          value={doctorName}
          onChange={e => setDoctorName(e.target.value)}
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <h4>Medicines</h4>
        {medicines.map((m, idx) => (
          <MedicineRow
            key={idx}
            idx={idx}
            med={m}
            onChange={changeMed}
            onRemove={removeMed}
          />
        ))}

        <button onClick={addMed}>Add medicine</button>

        <div className="summary">
          <p>Total medicines: {computeTotalMedicines()}</p>
          <p>Total tablets (estimated): {computeTotalQuantities()}</p>
        </div>

        <button onClick={submit}>Save Prescription</button>
        <button onClick={printPrescription}>Print Prescription</button>
      </div>

      <div>
        <h3>Previous Prescriptions</h3>
        {patient.prescriptions && patient.prescriptions.map(p => (
          <div key={p.prescriptionId} className="rx-card">
            <h4>{p.prescriptionId} — {new Date(p.date).toLocaleString()}</h4>
            <p>Doctor: {p.doctorName}</p>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Times</th>
                  <th>Days</th>
                  <th>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {p.medicines.map((m, i) => (
                  <tr key={i}>
                    <td>{m.name}</td>
                    <td>{m.times}</td>
                    <td>{m.days}</td>
                    <td>{m.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Notes: {p.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
