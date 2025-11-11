import React, { useState, useEffect } from 'react';
import MedicineAutocomplete from '../components/MedicineAutocomplete'; // 🔹 Fixed autocomplete

// ---------------- MedicineRow Component ----------------
function MedicineRow({ idx, med, onChange, onRemove }) {
  const [totalQty, setTotalQty] = useState(0);

  function handleSelect(medFromDb) {
    onChange(idx, {
      name: medFromDb.name,
      times: medFromDb.defaultTimes || '1-0-0',
      days: medFromDb.defaultDays || 1,
      totalQuantity: 0
    });
  }

  useEffect(() => {
    const parts = (med.times || '0-0-0').split('-').map(p => Number(p || 0));
    const dosesPerDay = parts.reduce((a, b) => a + b, 0);
    const qty = dosesPerDay * (med.days || 0);
    setTotalQty(qty);
    onChange(idx, { ...med, totalQuantity: qty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [med.times, med.days]);

  return (
    <div className="medicine-row">
      <MedicineAutocomplete value={med.name} onSelect={handleSelect} />
      <input
        placeholder="Times (1-1-0)"
        value={med.times}
        onChange={e => onChange(idx, { ...med, times: e.target.value })}
      />
      <input
        type="number"
        placeholder="Days"
        min="1"
        value={med.days}
        onChange={e => onChange(idx, { ...med, days: Number(e.target.value) })}
      />
      <span className="qty-label">
        {totalQty > 0 ? `${totalQty} tablets` : ''}
      </span>
      <button onClick={() => onRemove(idx)}>❌ Remove</button>
    </div>
  );
}

// ---------------- PrescriptionView Main Component ----------------
export default function PrescriptionView({ patient, onSubmitPrescription }) {
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', times: '1-0-0', days: 1, totalQuantity: 0 }
  ]);

  function changeMed(i, m) {
    const copy = [...medicines];
    copy[i] = m;
    setMedicines(copy);
  }

  function removeMed(i) {
    setMedicines(medicines.filter((_, idx) => idx !== i));
  }

  function addMed() {
    setMedicines([
      ...medicines,
      { name: '', times: '1-0-0', days: 1, totalQuantity: 0 }
    ]);
  }

  const computeTotalMedicines = () => medicines.length;
  const computeTotalQuantities = () =>
    medicines.reduce((sum, m) => sum + (m.totalQuantity || 0), 0);

  async function submit() {
    if (medicines.length === 0) {
      alert('Add at least one medicine');
      return;
    }
    if (medicines.some(m => !m.name || !m.times || !m.days)) {
      alert('Please fill all medicine fields');
      return;
    }
    const payload = { doctorName, medicines, notes };
    await onSubmitPrescription(payload);
    alert('✅ Prescription saved successfully!');
  }

  // 🖨️ Print only the current prescription section
  function printPrescription() {
    const printContents = document.getElementById('printable-prescription').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #555; padding: 6px; text-align: center; }
            h1, h2, h3 { text-align: center; }
            .footer { margin-top: 10px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div>
      <h2>Patient: {patient.name} — {patient.patientId}</h2>
      <p>
        Age: {patient.age} | Weight: {patient.weight} | Height: {patient.height}
      </p>
      <p>Case History: {patient.caseHistory}</p>

      {/* ---------- Prescription Entry Section ---------- */}
      {/* 🔹 Added printable wrapper */}
      <div className="prescribe-box" id="printable-prescription">
        <h1>Doctor Prescription</h1>
        <p><strong>Doctor:</strong> {doctorName || 'Dr. __________'}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>

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

        <button onClick={addMed}>➕ Add medicine</button>

        {/* ---------- Summary Table ---------- */}
        <div className="summary">
          <h4>Prescription Summary</h4>
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
              {medicines.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.times}</td>
                  <td>{m.days}</td>
                  <td>{m.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <strong>Total Medicines:</strong> {computeTotalMedicines()}
          </p>
          <p>
            <strong>Total Tablets (All):</strong> {computeTotalQuantities()}
          </p>

          {notes && (
            <div className="footer">
              <strong>Notes:</strong> {notes}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Action Buttons (won’t print) ---------- */}
      <div className="actions">
        <button onClick={submit}>💾 Save Prescription</button>
        <button onClick={printPrescription}>🖨️ Print Prescription</button>
      </div>

      {/* ---------- Previous Prescriptions ---------- */}
      <div className="non-print">
        <h3>Previous Prescriptions</h3>
        {patient.prescriptions && patient.prescriptions.length > 0 ? (
          patient.prescriptions.map(p => (
            <div key={p.prescriptionId} className="rx-card">
              <h4>
                {p.prescriptionId} — {new Date(p.date).toLocaleString()}
              </h4>
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
          ))
        ) : (
          <p>No previous prescriptions found.</p>
        )}
      </div>
    </div>
  );
}
