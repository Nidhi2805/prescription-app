import React, { useState, useEffect } from 'react';
import MedicineAutocomplete from '../components/MedicineAutocomplete';

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
  const doctorName = patient.assignedDoctor;
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

  function printPrescription() {
    const printContents =
      document.getElementById('printable-prescription').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #555; padding: 6px; text-align: center; }
            h1, h2 { text-align: center; }
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
      <h2>
        Patient: {patient.name} — {patient.patientId}
      </h2>

      <p>
        <strong>Age:</strong> {patient.age}
      </p>

      <p style={{ color: 'red', fontWeight: 'bold' }}>
        ⚠ Allergies: {patient.allergies || 'None'}
      </p>

      {/* ---------- PRINTABLE PRESCRIPTION ---------- */}
      <div className="prescribe-box" id="printable-prescription">
        <h1>Doctor Prescription</h1>

        <p><strong>Doctor:</strong> {doctorName}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>

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
      </div>

      {/* ---------- NON-PRINT ---------- */}
      <div className="non-print">
        <textarea
          placeholder="Notes (not printed)"
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
      </div>

      {/* ---------- ACTIONS ---------- */}
      <div className="actions">
        <button onClick={submit}>💾 Save Prescription</button>
        <button onClick={printPrescription}>🖨️ Print Prescription</button>
      </div>
    </div>
  );
}
