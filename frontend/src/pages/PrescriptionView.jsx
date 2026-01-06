import React, { useState, useEffect } from 'react';
import MedicineAutocomplete from '../components/MedicineAutocomplete';

// ---------------- MedicineRow Component ----------------
function MedicineRow({ idx, med, onChange, onRemove }) {
  const [totalQty, setTotalQty] = useState(0);
  const [englishNote, setEnglishNote] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  function handleSelect(medFromDb) {
    onChange(idx, {
      name: medFromDb.name,
      times: medFromDb.defaultTimes || '1-0-0',
      days: medFromDb.defaultDays || 1,
      totalQuantity: 0,
      specialNote: med.specialNote || ''
    });
  }

  useEffect(() => {
    const parts = (med.times || '0-0-0').split('-').map(p => Number(p || 0));
    const dosesPerDay = parts.reduce((a, b) => a + b, 0);
    const qty = dosesPerDay * (med.days || 0);
    setTotalQty(qty);
    onChange(idx, { ...med, totalQuantity: qty });
  }, [med.times, med.days]);

  async function translateToMarathi() {
    if (!englishNote.trim()) {
      alert('Please enter some text to translate');
      return;
    }
    
    setIsTranslating(true);
    try {
      // Simple client-side translation mapping for common medical instructions
      const translations = {
        'take after food': 'जेवणानंतर घ्या',
        'take before food': 'जेवणाआधी घ्या',
        'take with food': 'जेवणासोबत घ्या',
        'take on empty stomach': 'रिकाम्या पोटी घ्या',
        'take at bedtime': 'झोपण्याच्या वेळी घ्या',
        'take in morning': 'सकाळी घ्या',
        'take at night': 'रात्री घ्या',
        'take with water': 'पाण्यासोबत घ्या',
        'take with milk': 'दूधासोबत घ्या',
        'do not chew': 'चघळू नका',
        'dissolve in water': 'पाण्यात विरघळवा',
        'after food': 'जेवणानंतर',
        'before food': 'जेवणाआधी',
        'with food': 'जेवणासोबत',
        'empty stomach': 'रिकाम्या पोटी',
        'morning': 'सकाळी',
        'night': 'रात्री',
        'bedtime': 'झोपण्याच्या वेळी'
      };

      const lowerInput = englishNote.toLowerCase().trim();
      let translatedText = translations[lowerInput];

      if (!translatedText) {
        // Try to find partial matches
        for (const [key, value] of Object.entries(translations)) {
          if (lowerInput.includes(key)) {
            translatedText = value;
            break;
          }
        }
      }

      if (!translatedText) {
        // If no match found, inform user
        alert('Translation not found. Common phrases:\n- take after food\n- take before food\n- take with food\n- take on empty stomach\n- take at bedtime\n\nOr you can manually type in Marathi.');
        setIsTranslating(false);
        return;
      }

      onChange(idx, { ...med, specialNote: translatedText });
      setEnglishNote('');
      alert(`Translated: ${translatedText}`);
      
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try common phrases like "take after food", "take before food", etc.');
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      marginBottom: '15px', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '2', minWidth: '200px' }}>
          <MedicineAutocomplete value={med.name} onSelect={handleSelect} />
        </div>
        <input
          style={{ flex: '1', minWidth: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          placeholder="Times (1-1-0)"
          value={med.times}
          onChange={e => onChange(idx, { ...med, times: e.target.value })}
        />
        <input
          style={{ flex: '1', minWidth: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          type="number"
          placeholder="Days"
          min="1"
          value={med.days}
          onChange={e => onChange(idx, { ...med, days: Number(e.target.value) })}
        />
        <span style={{ 
          flex: '1', 
          minWidth: '100px', 
          color: '#27ae60', 
          fontWeight: 'bold',
          padding: '8px'
        }}>
          {totalQty > 0 ? `${totalQty} tablets` : ''}
        </span>
        <button 
          style={{
            padding: '8px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => onRemove(idx)}
        >
          ❌ Remove
        </button>
      </div>
      
      <div style={{ 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: '#fff', 
        borderRadius: '4px',
        border: '1px solid #e0e0e0'
      }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
          Special Note:
        </label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            style={{ 
              flex: '1', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
            placeholder="Type in English (e.g., take after food)"
            value={englishNote}
            onChange={e => setEnglishNote(e.target.value)}
          />
          <button 
            style={{
              padding: '8px 15px',
              backgroundColor: isTranslating ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isTranslating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={translateToMarathi}
            disabled={isTranslating}
          >
            {isTranslating ? '⏳ Translating...' : '🔄 Translate'}
          </button>
        </div>
        {med.specialNote && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '4px',
            border: '1px solid #a5d6a7',
            marginBottom: '10px'
          }}>
            <strong style={{ color: '#2e7d32' }}>Marathi:</strong> 
            <span style={{ marginLeft: '8px', fontSize: '16px' }}>{med.specialNote}</span>
          </div>
        )}
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Common phrases: take after food, take before food, take with food, take on empty stomach, take at bedtime
        </div>
      </div>
    </div>
  );
}

// ---------------- PrescriptionView Main Component ----------------
export default function PrescriptionView({ patient, onSubmitPrescription }) {
  const doctorName = patient.assignedDoctor;
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', times: '1-0-0', days: 1, totalQuantity: 0, specialNote: '' }
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
      { name: '', times: '1-0-0', days: 1, totalQuantity: 0, specialNote: '' }
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

  // --- inside PrescriptionView component ---

async function handleSave() {
  if (!patient || !patient.patientId) {
    alert("❌ No patient selected");
    return;
  }

  if (medicines.length === 0) {
    alert("⚠ Add at least one medicine before saving!");
    return;
  }

  // send to parent (DoctorDashboard)
  await onSubmitPrescription({
    medicines,
    notes
  });

  alert("✅ Prescription saved successfully!");
}

  async function printPrescription() {
    // Get the watermark image as base64
    let watermarkBase64 = '';
    try {
      const response = await fetch('/watermark.jpeg');
      const blob = await response.blob();
      watermarkBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Could not load watermark image:', error);
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              font-size: 14px;
            }
            .header {
              display: flex;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .logo-box {
              width: 100px;
              height: 100px;
              background-color: #c9a962;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20px;
              flex-shrink: 0;
            }
            .doctor-info {
              flex: 1;
            }
            .doctor-name {
              color: #8b0000;
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            .qualifications {
              font-size: 11px;
              margin: 0 0 10px 0;
              color: #333;
            }
            .consulting-info {
              font-size: 12px;
              line-height: 1.6;
              margin: 5px 0;
            }
            .rx-symbol {
              color: #8b0000;
              font-size: 48px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            .patient-info {
              margin: 15px 0;
              font-size: 13px;
            }
            .patient-info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              font-size: 13px;
              background-color: rgba(255, 255, 255, 0.9);
            }
            th, td { 
              border: 1px solid #333; 
              padding: 10px 8px; 
              text-align: center; 
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .medicine-name {
              text-align: left;
              padding-left: 10px;
            }
            .footer-note {
              font-size: 11px;
              font-style: italic;
              margin: 15px 0;
            }
            .bottom-section {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              font-size: 12px;
            }
            .dispensed-by {
              width: 45%;
            }
            .doctor-signature {
              width: 45%;
              text-align: right;
            }
            .signature-name {
              color: #8b0000;
              font-size: 18px;
              font-weight: bold;
              margin-top: 40px;
            }
            .reg-no {
              font-size: 11px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-box">
              <div style="color: white; font-size: 12px; text-align: center;">
                [Logo]
              </div>
            </div>
            <div class="doctor-info">
              <div class="doctor-name">Dr. ${doctorName}</div>
              <div class="qualifications">
                M.S.(Ortho.), A.F.I.H.(Bom.), M.R.C.S. (Edin.), MSc.(UK), MCh(UK)
              </div>
              <div class="qualifications">
                Primary & Revision Joint Replacement & Arthroscopy Surgeon
              </div>
              <div class="consulting-info">
                <strong>Consulting:</strong> Nidhi Joint Care Centre,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Anubandh" 158, Rly. lines,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Opp. Pankha Bawadi, Solapur - 413 001.<br>
                <strong>Time:</strong> 11 am to 1 pm, 5 pm to 7 pm
              </div>
              <div class="consulting-info">
                <strong>Consultant:</strong> Ashwini Sahkari Rughalaya,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;South Sadar Bazar, Solapur - 413 001.
              </div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              Date: ${currentDate}
            </div>
          </div>

          <div class="rx-symbol">℞</div>

          <div class="patient-info">
            <div class="patient-info-row">
              <span><strong>Patient's Full Name:</strong> ${patient.name}</span>
            </div>
            <div class="patient-info-row">
              <span><strong>Sex:</strong> ${patient.sex || '-'}</span>
              <span><strong>Age:</strong> ${patient.age || '-'}</span>
              <span><strong>Weight:</strong> ${patient.weight || '-'}</span>
            </div>
          </div>

          <div style="position: relative;">
            <div style="
              position: relative;
              background-image: url('${watermarkBase64}');
              background-position: centre;
              background-repeat: no-repeat;
              background-size: 450px 450px;
              opacity: 0.25;
              z-index: -1
            ">
              <img src="https://i.imgur.com/yourlogourl.png" alt="We Care For Your Joints" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'">
            </div>
            <table style="position: relative; z-index: 1; background-color: rgba(255, 255, 255, 0.97)">
              <thead>
                <tr>
                  <th style="width: 35%;">Name of Medicine</th>
                  <th style="width: 13%;">Morning</th>
                  <th style="width: 13%;">Afternoon</th>
                  <th style="width: 13%;">Night</th>
                  <th style="width: 13%;">Duration of Days</th>
                  <th style="width: 13%;">Quantity of Medicine</th>
                </tr>
              </thead>
              <tbody>
                ${medicines.map(m => {
                  const times = (m.times || '0-0-0').split('-');
                  return `
                    <tr>
                      <td class="medicine-name">${m.name}${m.specialNote ? '<br><small style="color: #666;">(' + m.specialNote + ')</small>' : ''}</td>
                      <td>${times[0] || '0'}</td>
                      <td>${times[1] || '0'}</td>
                      <td>${times[2] || '0'}</td>
                      <td>${m.days}</td>
                      <td>${m.totalQuantity}</td>
                    </tr>
                  `;
                }).join('')}
                ${Array(Math.max(0, 8 - medicines.length)).fill(0).map(() => `
                  <tr>
                    <td class="medicine-name">&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer-note">
            * Or any Economical generic medicine as per the choice of the patient.<br>
            Don't stop or change Medicine without Doctor's Advice
            <span style="float: right; margin-right: 20px;">Sign. & Date</span>
          </div>

          <div class="bottom-section">
            <div class="dispensed-by">
              <div><strong>Dispensed By:</strong></div>
              <div style="margin-top: 5px;">Name and Address of Medical Store</div>
              <br />
              <br/>
              <div style="margin-top: 10px;">Date of Dispensing: ____/____/20____</div>
            </div>
            <div class="doctor-signature">
              <div class="signature-name">Dr. ${doctorName}</div>
              <div style="font-size: 11px; margin-top: 5px;">
                M.S.(Ortho.), A.F.I.H.(Bom.), M.R.C.S. (Edin.), MSc.(UK), MCh(UK)
              </div>
              <div style="font-size: 11px;">
                Primary & Revision Joint Replacement & Arthroscopy Surgeon
              </div>
              <div class="reg-no">Reg. No. 84688</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50' }}>
        Patient: {patient.name} — {patient.patientId}
      </h2>

      <p>
        <strong>Age:</strong> {patient.age}
      </p>

      <p style={{ color: 'red', fontWeight: 'bold' }}>
        ⚠ Allergies: {patient.allergies || 'None'}
      </p>

      {/* ---------- PRINTABLE PRESCRIPTION ---------- */}
      <div style={{ 
        border: '2px solid #34495e', 
        padding: '20px', 
        marginBottom: '20px',
        backgroundColor: '#fff'
      }} id="printable-prescription">
        <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Doctor Prescription</h1>

        <p><strong>Doctor:</strong> {doctorName}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>

        <table>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              <th>Medicine</th>
              <th>Times</th>
              <th>Days</th>
              <th>Total Qty</th>
              <th>Special Note</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td>{m.name}</td>
                <td>{m.times}</td>
                <td>{m.days}</td>
                <td>{m.totalQuantity}</td>
                <td className="special-note-cell">{m.specialNote || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- NON-PRINT ---------- */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          style={{ 
            width: '100%', 
            minHeight: '80px', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
          placeholder="Notes (not printed)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#2c3e50' }}>Medicines</h4>
        {medicines.map((m, idx) => (
          <MedicineRow
            key={idx}
            idx={idx}
            med={m}
            onChange={changeMed}
            onRemove={removeMed}
          />
        ))}

        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={addMed}
        >
          ➕ Add medicine
        </button>
      </div>

      {/* ---------- ACTIONS ---------- */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button 
          style={{
            padding: '12px 24px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={handleSave}
        >
          💾 Save Prescription
        </button>
        <button 
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={printPrescription}
        >
          🖨️ Print Prescription
        </button>
      </div>
    </div>
  );
}