import React, { useState, useEffect } from 'react';
import '../styles/PrescriptionView.css'
//import MoleculeAutocomplete from '../components/MoleculeAutocomplete';
import { addPrescription } from "../api/api";

const MEDICINE_CONFIG = {
  // You can switch between local and API data
  useLocalData: true, // Set to false when you have API endpoint
  apiEndpoint: '/api/medicines', // Your backend endpoint
  // Or use public API like: 'https://api.fda.gov/drug/label.json'
};

// Orthopedic-specific medicine database (expandable)
const ORTHOPEDIC_MEDICINES = [
  {
    molecule: "Paracetamol",
    tradeNames: ["Crocin", "Dolo 650", "Calpol", "Pacimol"],
    defaultTimes: "1-0-1",
    defaultDays: 3,
    category: "Analgesic",
    indication: "Pain relief"
  },
  {
    molecule: "Ibuprofen",
    tradeNames: ["Brufen", "Combiflam", "Advil", "Ibugesic"],
    defaultTimes: "1-1-1",
    defaultDays: 5,
    category: "NSAID",
    indication: "Pain and inflammation"
  },
  {
    molecule: "Diclofenac Sodium",
    tradeNames: ["Voveran", "Diclomax", "Dynapar", "Voltaren"],
    defaultTimes: "1-0-1",
    defaultDays: 5,
    category: "NSAID",
    indication: "Pain and inflammation"
  },
  {
    molecule: "Aceclofenac",
    tradeNames: ["Hifenac", "Zerodol", "Aceclo", "Arflur"],
    defaultTimes: "1-0-1",
    defaultDays: 5,
    category: "NSAID",
    indication: "Pain and inflammation"
  },
  {
    molecule: "Etoricoxib",
    tradeNames: ["Etoshine", "Etody", "Nucoxia", "Etova"],
    defaultTimes: "1-0-0",
    defaultDays: 5,
    category: "COX-2 Inhibitor",
    indication: "Acute pain, osteoarthritis"
  },
  {
    molecule: "Tramadol",
    tradeNames: ["Tramazac", "Ultracet", "Tramadol", "Tramal"],
    defaultTimes: "1-0-1",
    defaultDays: 3,
    category: "Opioid Analgesic",
    indication: "Moderate to severe pain"
  },
  {
    molecule: "Methylcobalamin",
    tradeNames: ["Neurobion", "Mecoblend", "Methylcobal", "Nervijen"],
    defaultTimes: "1-0-0",
    defaultDays: 30,
    category: "Vitamin B12",
    indication: "Nerve health, neuropathy"
  },
  {
    molecule: "Calcium + Vitamin D3",
    tradeNames: ["Shelcal", "Calcitas", "Calcimax", "Ostocalcium"],
    defaultTimes: "1-0-1",
    defaultDays: 30,
    category: "Supplement",
    indication: "Bone health"
  },
  {
    molecule: "Glucosamine + Chondroitin",
    tradeNames: ["Glucosamine Plus", "Cartigrow", "Jointace", "Osteocare"],
    defaultTimes: "1-0-0",
    defaultDays: 60,
    category: "Supplement",
    indication: "Joint health, osteoarthritis"
  },
  {
    molecule: "Thiocolchicoside",
    tradeNames: ["Myoril", "Thioquest", "Muscoflex", "Nise Plus"],
    defaultTimes: "1-0-1",
    defaultDays: 5,
    category: "Muscle Relaxant",
    indication: "Muscle spasm"
  },
  {
    molecule: "Tizanidine",
    tradeNames: ["Sirdalud", "Tizan", "Myolax", "Relaxo"],
    defaultTimes: "0-0-1",
    defaultDays: 7,
    category: "Muscle Relaxant",
    indication: "Muscle spasticity"
  },
  {
    molecule: "Serratiopeptidase",
    tradeNames: ["Enzomac", "Serral", "Serratio", "Serradic"],
    defaultTimes: "1-0-1",
    defaultDays: 5,
    category: "Enzyme",
    indication: "Anti-inflammatory, reduces swelling"
  },
  {
    molecule: "Pantoprazole",
    tradeNames: ["Pan", "Pantop", "Controloc", "Pantocid"],
    defaultTimes: "1-0-0",
    defaultDays: 5,
    category: "Proton Pump Inhibitor",
    indication: "Gastric protection"
  },
  {
    molecule: "Rabeprazole",
    tradeNames: ["Rablet", "Razo", "Rabicip", "Aciloc"],
    defaultTimes: "1-0-0",
    defaultDays: 5,
    category: "Proton Pump Inhibitor",
    indication: "Gastric protection"
  }
];

// Medicine data service - can switch between local and API
const MedicineDataService = {
  async fetchMedicines() {
    if (MEDICINE_CONFIG.useLocalData) {
      // Return local data
      return Promise.resolve(ORTHOPEDIC_MEDICINES);
    } else {
      // Fetch from API
      try {
        const response = await fetch(MEDICINE_CONFIG.apiEndpoint);
        const data = await response.json();
        return data.medicines || data;
      } catch (error) {
        console.error('Failed to fetch medicines from API:', error);
        // Fallback to local data
        return ORTHOPEDIC_MEDICINES;
      }
    }
  },

  async searchMedicine(query) {
    const medicines = await this.fetchMedicines();
    return medicines.filter(m =>
      m.molecule.toLowerCase().includes(query.toLowerCase())
    );
  },

  async getMedicineByName(moleculeName) {
    const medicines = await this.fetchMedicines();
    return medicines.find(m => m.molecule === moleculeName);
  }
};

function MedicineAdmin({ onClose, onSave, initialMedicines }) {
  const [medicines, setMedicines] = useState(initialMedicines || ORTHOPEDIC_MEDICINES);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    molecule: '',
    tradeNames: [],
    defaultTimes: '1-0-1',
    defaultDays: 5,
    category: '',
    indication: ''
  });
  const [tradeNameInput, setTradeNameInput] = useState('');

  function handleAddTradeName() {
    if (tradeNameInput.trim()) {
      setNewMedicine({
        ...newMedicine,
        tradeNames: [...newMedicine.tradeNames, tradeNameInput.trim()]
      });
      setTradeNameInput('');
    }
  }

  function handleRemoveTradeName(index) {
    setNewMedicine({
      ...newMedicine,
      tradeNames: newMedicine.tradeNames.filter((_, i) => i !== index)
    });
  }

  function handleSaveMedicine() {
    if (!newMedicine.molecule || newMedicine.tradeNames.length === 0) {
      alert('Please fill molecule name and at least one trade name');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...medicines];
      updated[editingIndex] = newMedicine;
      setMedicines(updated);
      setEditingIndex(null);
    } else {
      setMedicines([...medicines, newMedicine]);
    }

    setNewMedicine({
      molecule: '',
      tradeNames: [],
      defaultTimes: '1-0-1',
      defaultDays: 5,
      category: '',
      indication: ''
    });
  }

  function handleEdit(index) {
    setNewMedicine(medicines[index]);
    setEditingIndex(index);
  }

  function handleDelete(index) {
    if (confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  }

  function handleSaveAll() {
    onSave(medicines);
    alert('Medicine database updated successfully!');
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Medicine Database Manager</h2>
          <button onClick={onClose} style={{
            padding: '8px 15px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>✕ Close</button>
        </div>

        {/* Add/Edit Form */}
        <div style={{
          border: '2px solid #3498db',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>{editingIndex !== null ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Molecule Name *
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                value={newMedicine.molecule}
                onChange={e => setNewMedicine({ ...newMedicine, molecule: e.target.value })}
                placeholder="e.g., Paracetamol"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Category
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                value={newMedicine.category}
                onChange={e => setNewMedicine({ ...newMedicine, category: e.target.value })}
                placeholder="e.g., NSAID, Analgesic"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Default Times (M-A-N)
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                value={newMedicine.defaultTimes}
                onChange={e => setNewMedicine({ ...newMedicine, defaultTimes: e.target.value })}
                placeholder="1-0-1"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Default Days
              </label>
              <input
                type="number"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                value={newMedicine.defaultDays}
                onChange={e => setNewMedicine({ ...newMedicine, defaultDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Indication
            </label>
            <input
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              value={newMedicine.indication}
              onChange={e => setNewMedicine({ ...newMedicine, indication: e.target.value })}
              placeholder="e.g., Pain and inflammation"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Trade Names *
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                value={tradeNameInput}
                onChange={e => setTradeNameInput(e.target.value)}
                placeholder="Enter trade name"
                onKeyPress={e => e.key === 'Enter' && handleAddTradeName()}
              />
              <button
                onClick={handleAddTradeName}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {newMedicine.tradeNames.map((name, i) => (
                <span
                  key={i}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {name}
                  <span
                    onClick={() => handleRemoveTradeName(i)}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveMedicine}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {editingIndex !== null ? '✓ Update Medicine' : '+ Add Medicine'}
          </button>
          {editingIndex !== null && (
            <button
              onClick={() => {
                setEditingIndex(null);
                setNewMedicine({
                  molecule: '',
                  tradeNames: [],
                  defaultTimes: '1-0-1',
                  defaultDays: 5,
                  category: '',
                  indication: ''
                });
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Medicine List */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Current Medicines ({medicines.length})</h3>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {medicines.map((med, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid #ddd',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  backgroundColor: editingIndex === i ? '#e8f5e9' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                      {med.molecule}
                      {med.category && (
                        <span style={{
                          marginLeft: '10px',
                          padding: '2px 8px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}>
                          {med.category}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                      <strong>Trade Names:</strong> {med.tradeNames.join(', ')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Default:</strong> {med.defaultTimes} for {med.defaultDays} days | <strong>Indication:</strong> {med.indication}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleEdit(i)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #ddd' }}>
          <button
            onClick={handleSaveAll}
            style={{
              padding: '12px 30px',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            💾 Save Database
          </button>
          <div style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>
            Total Medicines: {medicines.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function MoleculeAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [molecules] = useState([
    { 
      molecule: "Paracetamol", 
      tradeNames: ["Crocin", "Dolo", "Calpol"],
      defaultTimes: "1-0-1",
      defaultDays: 3
    },
    { 
      molecule: "Ibuprofen", 
      tradeNames: ["Brufen", "Combiflam", "Advil"],
      defaultTimes: "1-1-1",
      defaultDays: 5
    },
    { 
      molecule: "Amoxicillin", 
      tradeNames: ["Mox", "Amoxil", "Novamox"],
      defaultTimes: "1-0-1",
      defaultDays: 7
    }
  ]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  function handleInput(v) {
    setQuery(v);
    if (v.length < 2) {
      setFiltered([]);
      return;
    }
    const temp = molecules.filter(m =>
      m.molecule.toLowerCase().includes(v.toLowerCase())
    );
    setFiltered(temp);
  }

  function selectMolecule(mol) {
    setQuery(mol.molecule);
    setFiltered([]);
    onSelect(mol.molecule);
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={e => handleInput(e.target.value)}
        placeholder="Search molecule..."
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      />
      {filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "45px",
          width: "100%",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          maxHeight: "180px",
          overflowY: "auto",
          zIndex: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {filtered.map((m, i) => (
            <div
              key={i}
              onClick={() => selectMolecule(m)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.target.style.background = "#f0f0f0"}
              onMouseLeave={e => e.target.style.background = "white"}
            >
              {m.molecule}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- MedicineRow Component ----------------
function MedicineRow({ idx, med, onChange, onRemove }) {
  const [totalQty, setTotalQty] = useState(0);
  const [englishNote, setEnglishNote] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [tradeNames, setTradeNames] = useState([]);

  // Mock molecules data with default times and days
  const moleculesData = [
    { 
      molecule: "Paracetamol", 
      tradeNames: ["Crocin", "Dolo", "Calpol"],
      defaultTimes: "1-0-1",
      defaultDays: 3
    },
    { 
      molecule: "Ibuprofen", 
      tradeNames: ["Brufen", "Combiflam", "Advil"],
      defaultTimes: "1-1-1",
      defaultDays: 5
    },
    { 
      molecule: "Amoxicillin", 
      tradeNames: ["Mox", "Amoxil", "Novamox"],
      defaultTimes: "1-0-1",
      defaultDays: 7
    }
  ];

  // When molecule is selected, fetch trade names and set default times/days
  async function handleMoleculeSelect(molecule) {
    // Find trade names for this molecule
    const found = moleculesData.find(m => m.molecule === molecule);
    
    if (found) {
      setTradeNames(found.tradeNames);
      
      // Update medicine with molecule and default values
      onChange(idx, {
        ...med,
        molecule: molecule,
        name: "",  // clear name until trade name is selected
        times: found.defaultTimes || "1-0-0",
        days: found.defaultDays || 1
      });
    } else {
      setTradeNames([]);
      onChange(idx, {
        ...med,
        molecule: molecule,
        name: "",
        times: "1-0-0",
        days: 1
      });
    }
  }

  // When trade name is selected
  function handleTradeSelect(tradeName) {
    onChange(idx, {
      ...med,
      name: tradeName
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
        for (const [key, value] of Object.entries(translations)) {
          if (lowerInput.includes(key)) {
            translatedText = value;
            break;
          }
        }
      }

      if (!translatedText) {
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

      {/* Molecule Search */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
          Search Molecule
        </label>
        <MoleculeAutocomplete
          value={med.molecule || ""}
          onSelect={handleMoleculeSelect}
        />
      </div>

      {/* Trade Names Dropdown - Only show when molecule is selected */}
      {tradeNames.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Select Trade Name
          </label>
          <select
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px"
            }}
            value={med.name || ""}
            onChange={e => handleTradeSelect(e.target.value)}
          >
            <option value="">-- Select Trade Name --</option>
            {tradeNames.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Times, Days, Quantity */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
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
      
      {/* Special Note Translation */}
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

// Demo Component
export function Demo() {
  const [medicines, setMedicines] = useState([
    { molecule: '', name: '', times: '1-0-0', days: 1, totalQuantity: 0, specialNote: '' }
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
      { molecule: '', name: '', times: '1-0-0', days: 1, totalQuantity: 0, specialNote: '' }
    ]);
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Medicine Prescription</h2>
      
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
        onClick={addMed}
        style={{
          padding: '10px 20px',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        ➕ Add Medicine
      </button>
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
    // Basic validation
    if (!medicines || medicines.length === 0) { alert('Add at least one medicine'); return; }
    if (medicines.some(m => !m.name || !m.times || !m.days)) { alert('Fill all medicine fields'); return; }
    const payload = { doctorName, medicines, notes };
    await onSubmitPrescription(payload);
    alert('Prescription saved');
  }

  // --- inside PrescriptionView component ---

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

  if (medicines.some(m => !m.name || !m.times || !m.days)) {
    alert("⚠ Please fill all medicine fields");
    return;
  }

  try {
    const prescriptionData = {
      prescriptionId: "RX-" + Date.now(),
      doctorName,
      date: new Date().toISOString(),
      medicines: medicines.map(m => ({
        molecule: m.molecule || "",
        name: m.name,
        times: m.times,
        days: m.days,
        totalQuantity: m.totalQuantity,
        specialNote: m.specialNote || ""
      })),
      notes
    };

    // ✅ FIXED: include patientId as FIRST argument
    await addPrescription(patient.patientId, prescriptionData);

    // 🔥 NEW: fetch updated patient with new prescription
    const updatedPatient = await getPatient(patient.patientId);

    // 🔥 Send updated data to parent (DoctorDashboard)
    onSubmitPrescription(updatedPatient);

    alert("✅ Prescription saved successfully!");


  } catch (error) {
    console.error("Error saving prescription:", error);
  }
}


  async function printPrescription() {
    // Get the watermark image as base64
    // BEFORE - Only loaded watermark
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

// AFTER - Now loads both watermark AND logo
let watermarkBase64 = '';
let logoBase64 = '';

try {
  const watermarkResponse = await fetch('/watermark.jpeg');
  const watermarkBlob = await watermarkResponse.blob();
  watermarkBase64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(watermarkBlob);
  });
} catch (error) {
  console.log('Could not load watermark image:', error);
}

try {
  const logoResponse = await fetch('/Logo.png');
  const logoBlob = await logoResponse.blob();
  logoBase64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(logoBlob);
  });
} catch (error) {
  console.log('Could not load logo image:', error);
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
              padding: 15px; 
              font-size: 14px;
            }
            .header {
              display: flex;
              align-items: flex-start;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 2px solid #000;
            }
            .logo-box {
              width: 250px;
              height: 250px;
              background-color: transparent;  /* <-- Now transparent */
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
              margin: 10px 0 5px 0;
            }
            .patient-info {
              margin: 5px 0;
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
              margin: 10px 0;
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
              margin-top: 15px;
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
          <img src="${logoBase64}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'">
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.12;
  z-index: 0;
  pointer-events: none;
  ">
    <img src="${watermarkBase64}" alt="Watermark" style="width: 100%; height: 100%; object-fit: contain;">
  </div>
  <table style="position: relative; z-index: 1; background-color: transparent;">
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
    <div className='prescription-container' style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

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
          className='add-med-btn'
          onClick={addMed}
        >
          ➕ Add medicine
        </button>
      </div>

      {/* ---------- ACTIONS ---------- */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button 
          className='save-prescription-btn'
          onClick={handleSave}
        >
          💾 Save Prescription
        </button>
        <button 
          className='print-btn'
          onClick={printPrescription}
        >
          🖨️ Print Prescription
        </button>
      </div>
      <div className="previous-prescriptions-section">
  <h3>Previous Prescriptions</h3>
  {patient.prescriptions && patient.prescriptions.length > 0 ? (
    <div className="prescriptions-grid">
      {patient.prescriptions.map(p => (
        <div key={p.prescriptionId} className="rx-card">
          <h4>📅 {new Date(p.date).toLocaleString()}</h4>
          <p>👨‍⚕️ Doctor: {p.doctorName}</p>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Times</th>
                <th>Days</th>
                <th>Total Qty</th>
                <th>Special Note</th>
              </tr>
            </thead>
            <tbody>
              {p.medicines.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.times}</td>
                  <td>{m.days}</td>
                  <td>{m.totalQuantity}</td>
                  <td>{m.specialNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>📝 Notes: {p.notes || 'No notes'}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="no-prescriptions">
      No previous prescriptions found
    </div>
  )}
</div>
    </div>
  );
}