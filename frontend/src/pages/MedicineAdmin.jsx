import React, { useState, useEffect } from 'react';

// ==================== MEDICINE DATABASE STORAGE SERVICE ====================
// This service handles all database operations with localStorage
const MedicineDBService = {
  DB_KEY: 'ORTHOPEDIC_MEDICINE_DATABASE',
  
  // Initialize database with default medicines
  initializeDB() {
    const existing = this.getAllMedicines();
    if (!existing || existing.length === 0) {
      const defaultMedicines = [
        {
          id: "MED001",
          molecule: "Paracetamol",
          tradeNames: ["Crocin", "Dolo 650", "Calpol", "Pacimol"],
          defaultTradename: "Crocin",
          defaultTimes: "1-0-1",
          defaultDays: 3,
          category: "Analgesic",
          indication: "Pain relief",
          dosageForm: "Tablet",
          strengths: ["500mg", "650mg", "1000mg"],
          defaultStrength: "650mg",
          specialNote: "जेवणानंतर घ्या",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "MED002",
          molecule: "Ibuprofen",
          tradeNames: ["Brufen", "Combiflam", "Advil", "Ibugesic"],
          defaultTimes: "1-1-1",
          defaultDays: 5,
          category: "NSAID",
          indication: "Pain and inflammation",
          dosageForm: "Tablet",
          strengths: ["200mg", "400mg", "600mg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "MED003",
          molecule: "Diclofenac Sodium",
          tradeNames: ["Voveran", "Diclomax", "Dynapar", "Voltaren"],
          defaultTimes: "1-0-1",
          defaultDays: 5,
          category: "NSAID",
          indication: "Pain and inflammation",
          dosageForm: "Tablet",
          strengths: ["50mg", "75mg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "MED004",
          molecule: "Aceclofenac",
          tradeNames: ["Hifenac", "Zerodol", "Aceclo", "Arflur"],
          defaultTimes: "1-0-1",
          defaultDays: 5,
          category: "NSAID",
          indication: "Pain and inflammation",
          dosageForm: "Tablet",
          strengths: ["100mg", "200mg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "MED005",
          molecule: "Tramadol",
          tradeNames: ["Tramazac", "Ultracet", "Tramadol", "Tramal"],
          defaultTimes: "1-0-1",
          defaultDays: 3,
          category: "Opioid Analgesic",
          indication: "Moderate to severe pain",
          dosageForm: "Tablet",
          strengths: ["50mg", "100mg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveMedicines(defaultMedicines);
    }
  },
  
  // Get all medicines from database
  getAllMedicines() {
    try {
      const data = localStorage.getItem(this.DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading medicine database:', error);
      return [];
    }
  },
  
  // Save medicines to database
  saveMedicines(medicines) {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(medicines));
      // Trigger storage event for real-time sync
      window.dispatchEvent(new Event('medicineDBUpdated'));
      return true;
    } catch (error) {
      console.error('Error saving medicine database:', error);
      return false;
    }
  },
  
  // Add new medicine
  addMedicine(medicine) {
    const medicines = this.getAllMedicines();
    const newMedicine = {
      ...medicine,
      defaultDays: medicine.defaultDays ?? 10,
      id: `MED${String(medicines.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    medicines.push(newMedicine);
    return this.saveMedicines(medicines) ? newMedicine : null;
  },
  
  // Update existing medicine
  updateMedicine(id, updatedData) {
    const medicines = this.getAllMedicines();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    medicines[index] = {
      ...medicines[index],
      ...updatedData,
      id: medicines[index].id, // Keep original ID
      createdAt: medicines[index].createdAt, // Keep creation date
      updatedAt: new Date().toISOString()
    };
    return this.saveMedicines(medicines);
  },
  
  // Delete medicine
  deleteMedicine(id) {
    const medicines = this.getAllMedicines();
    const filtered = medicines.filter(m => m.id !== id);
    return this.saveMedicines(filtered);
  },
  
  // Search medicines
  searchMedicines(query) {
    const medicines = this.getAllMedicines();
    const lowerQuery = query.toLowerCase();
    return medicines.filter(m =>
      m.molecule.toLowerCase().includes(lowerQuery) ||
      m.tradeNames.some(t => t.toLowerCase().includes(lowerQuery)) ||
      m.category.toLowerCase().includes(lowerQuery)
    );
  },
  
  // Get medicine by ID
  getMedicineById(id) {
    const medicines = this.getAllMedicines();
    return medicines.find(m => m.id === id);
  },
  
  // Export database
  exportDatabase() {
    const medicines = this.getAllMedicines();
    const dataStr = JSON.stringify(medicines, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medicine_database_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
  
  // Import database
  importDatabase(jsonData) {
    try {
      const medicines = JSON.parse(jsonData);
      if (!Array.isArray(medicines)) throw new Error('Invalid format');
      return this.saveMedicines(medicines);
    } catch (error) {
      console.error('Error importing database:', error);
      return false;
    }
  }
};

// ==================== MEDICINE ADMIN COMPONENT ====================
function MedicineAdmin({ onClose }) {
  const [medicines, setMedicines] = useState([]);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const emptyRegimen = () => ({
    times: '1-0-1',
    days: 10,
    tradeName: '',
    strength: '',
    specialNote: ''
  });

  const [formData, setFormData] = useState({
    molecule: '',
    tradeNames: [],
    defaultTimes: '1-0-1',
    defaultTradename: '',
    defaultDays: 10,
    defaultRegimens: [emptyRegimen()],
    category: '',
    indication: '',
    dosageForm: 'Tablet',
    strengths: [],
    defaultStrength: '',
    specialNote: ''
  });
  const [tradeNameInput, setTradeNameInput] = useState('');
  const [strengthInput, setStrengthInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    loadMedicines();
    // Listen for database updates
    window.addEventListener('medicineDBUpdated', loadMedicines);
    return () => window.removeEventListener('medicineDBUpdated', loadMedicines);
  }, []);

  function loadMedicines() {
    const allMedicines = MedicineDBService.getAllMedicines();
    setMedicines(allMedicines);
  }

  function handleAddTradeName() {
    if (tradeNameInput.trim()) {
      setFormData({
        ...formData,
        tradeNames: [...formData.tradeNames, tradeNameInput.trim()]
      });
      setTradeNameInput('');
    }
  }

  function handleRemoveTradeName(index) {
    setFormData({
      ...formData,
      tradeNames: formData.tradeNames.filter((_, i) => i !== index)
    });
  }

  function handleAddStrength() {
    if (strengthInput.trim()) {
      setFormData({
        ...formData,
        strengths: [...formData.strengths, strengthInput.trim()]
      });
      setStrengthInput('');
    }
  }

  function handleRemoveStrength(index) {
    setFormData({
      ...formData,
      strengths: formData.strengths.filter((_, i) => i !== index)
    });
  }

  const translationDictionary = {
    'take after food': 'जेवणानंतर घ्या',
    'translate food': 'जेवणानंतर घ्या',
    'take after meal': 'जेवणानंतर घ्या',
    'after meal': 'जेवणानंतर',
    'take before food': 'जेवणाआधी घ्या',
    'take before meal': 'जेवणाआधी घ्या',
    'before meal': 'जेवणाआधी',
    'take with food': 'जेवणासोबत घ्या',
    'take with meals': 'जेवणासोबत घ्या',
    'with meals': 'जेवणासोबत',
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

  function translateToMarathi(text) {
    if (!text || typeof text !== 'string') return null;
    const normalized = text.toLowerCase().trim();
    if (translationDictionary[normalized]) return translationDictionary[normalized];

    for (const [key, value] of Object.entries(translationDictionary)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return null;
  }

  function handleRegimenChange(index, field, value) {
    const updatedRegimens = formData.defaultRegimens.map((regimen, i) =>
      i === index ? { ...regimen, [field]: field === 'specialNote' ? (translateToMarathi(value) || value) : value } : regimen
    );
    setFormData({ ...formData, defaultRegimens: updatedRegimens });
  }

  function addRegimen() {
    setFormData({
      ...formData,
      defaultRegimens: [...formData.defaultRegimens, emptyRegimen()]
    });
  }

  function removeRegimen(index) {
    const updatedRegimens = formData.defaultRegimens.filter((_, i) => i !== index);
    setFormData({ ...formData, defaultRegimens: updatedRegimens.length ? updatedRegimens : [emptyRegimen()] });
  }

  function handleSaveMedicine() {
    if (!formData.molecule || formData.tradeNames.length === 0) {
      alert('❌ Please fill molecule name and at least one trade name');
      return;
    }

    const regimens = formData.defaultRegimens.filter(r => r.times && r.days > 0);
    if (regimens.length === 0) {
      alert('❌ Please add at least one default regimen with times and days');
      return;
    }

    const payload = {
      ...formData,
      defaultRegimens: regimens,
      defaultTimes: formData.defaultTimes || regimens[0].times,
      defaultDays: formData.defaultDays || regimens[0].days,
      defaultTradename: formData.defaultTradename || regimens[0].tradeName,
      defaultStrength: formData.defaultStrength || regimens[0].strength,
      specialNote: formData.specialNote || regimens[0].specialNote
    };

    if (editingMedicine) {
      const success = MedicineDBService.updateMedicine(editingMedicine.id, payload);
      if (success) {
        alert('✅ Medicine updated successfully!');
        resetForm();
      } else {
        alert('❌ Failed to update medicine');
      }
    } else {
      const newMedicine = MedicineDBService.addMedicine(payload);
      if (newMedicine) {
        alert(`✅ Medicine added successfully! ID: ${newMedicine.id}`);
        resetForm();
      } else {
        alert('❌ Failed to add medicine');
      }
    }
    loadMedicines();
  }

  function handleEdit(medicine) {
    setEditingMedicine(medicine);
    const fallbackRegimen = {
      times: medicine.defaultTimes || '1-0-1',
      days: medicine.defaultDays || 10,
      tradeName: medicine.defaultTradename || '',
      strength: medicine.defaultStrength || '',
      specialNote: medicine.specialNote || ''
    };

    setFormData({
      molecule: medicine.molecule,
      tradeNames: [...medicine.tradeNames],
      defaultTradename: medicine.defaultTradename || '',
      defaultTimes: medicine.defaultTimes,
      defaultDays: medicine.defaultDays,
      defaultRegimens: (medicine.defaultRegimens && medicine.defaultRegimens.length > 0)
        ? medicine.defaultRegimens
        : [fallbackRegimen],
      category: medicine.category,
      indication: medicine.indication,
      dosageForm: medicine.dosageForm || 'Tablet',
      strengths: medicine.strengths || [],
      defaultStrength: medicine.defaultStrength || '',
      specialNote: medicine.specialNote || ''
    });
    setShowForm(true);
  }

  function handleDelete(id) {
    if (confirm('⚠️ Are you sure you want to delete this medicine? This action cannot be undone.')) {
      const success = MedicineDBService.deleteMedicine(id);
      if (success) {
        alert('✅ Medicine deleted successfully!');
        loadMedicines();
      } else {
        alert('❌ Failed to delete medicine');
      }
    }
  }

  function resetForm() {
    setFormData({
      molecule: '',
      tradeNames: [],
      defaultTradename: '',
      defaultTimes: '1-0-1',
      defaultDays: 10,
      defaultRegimens: [emptyRegimen()],
      category: '',
      indication: '',
      dosageForm: 'Tablet',
      strengths: [],
      defaultStrength: '',
      specialNote: ''
    });
    setEditingMedicine(null);
    setShowForm(false);
  }

  const categories = ['All', ...new Set(medicines.map(m => m.category))];
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = searchQuery === '' || 
      m.molecule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tradeNames.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
        borderRadius: '12px',
        width: '95%',
        maxWidth: '1400px',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'linear-gradient(135deg, #0077be 0%, #005a94 100%)',
          background: 'linear-gradient(135deg, #0077be 0%, #005a94 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>💊 Medicine Database Manager</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Manage your orthopedic medicine database
            </p>
          </div>
          <button onClick={onClose} style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            ✕ Close
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Action Bar */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)'
              }}
            >
              {showForm ? '📋 View List' : '➕ Add New Medicine'}
            </button>
            
            <input
              type="text"
              placeholder="🔍 Search medicines..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => MedicineDBService.exportDatabase()}
              style={{
                padding: '12px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Export
            </button>

            <label style={{
              padding: '12px 20px',
              backgroundColor: '#9b59b6',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📤 Import
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const success = MedicineDBService.importDatabase(ev.target.result);
                      if (success) {
                        alert('✅ Database imported successfully!');
                        loadMedicines();
                      } else {
                        alert('❌ Failed to import database');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div style={{
              border: '2px solid #0077be',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: '#f8fbfd'
            }}>
              <h3 style={{ marginTop: 0, color: '#0077be' }}>
                {editingMedicine ? '✏️ Edit Medicine' : '➕ Add New Medicine'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Molecule Name *
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #ddd'
                    }}
                    value={formData.molecule}
                    onChange={e => setFormData({ ...formData, molecule: e.target.value })}
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Category *
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #ddd'
                    }}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., NSAID, Analgesic"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                    Default Regimens
                  </label>
                  {formData.defaultRegimens.map((regimen, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      backgroundColor: '#fbfcfd'
                    }}>
                      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                            Times (M-A-N)
                          </label>
                          <input
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                            value={regimen.times}
                            onChange={e => handleRegimenChange(index, 'times', e.target.value)}
                            placeholder="1-0-1"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                            Days
                          </label>
                          <input
                            type="number"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                            value={regimen.days}
                            min="1"
                            onChange={e => handleRegimenChange(index, 'days', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                            Trade Name
                          </label>
                          <select
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                            value={regimen.tradeName}
                            onChange={e => handleRegimenChange(index, 'tradeName', e.target.value)}
                          >
                            <option value="">-- Select trade name --</option>
                            {formData.tradeNames.map((name, i) => (
                              <option key={i} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                            Strength
                          </label>
                          <select
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                            value={regimen.strength}
                            onChange={e => handleRegimenChange(index, 'strength', e.target.value)}
                          >
                            <option value="">-- Select strength --</option>
                            {formData.strengths.map((strength, i) => (
                              <option key={i} value={strength}>{strength}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          Special Note
                        </label>
                        <input
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #ddd' }}
                          value={regimen.specialNote}
                          onChange={e => {
                            const value = e.target.value;
                            const translation = translateToMarathi(value);
                            handleRegimenChange(index, 'specialNote', translation || value);
                          }}
                          placeholder="Type note for this regimen"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRegimen(index)}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Regimen
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRegimen}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    + Add Default Regimen
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Dosage Form
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #ddd'
                    }}
                    value={formData.dosageForm}
                    onChange={e => setFormData({ ...formData, dosageForm: e.target.value })}
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Cream</option>
                    <option>Gel</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Indication
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '2px solid #ddd'
                  }}
                  value={formData.indication}
                  onChange={e => setFormData({ ...formData, indication: e.target.value })}
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
        padding: '10px',
        borderRadius: '6px',
        border: '2px solid #ddd'
      }}
      value={tradeNameInput}
      onChange={e => setTradeNameInput(e.target.value)}
      placeholder="Enter trade name"
      onKeyPress={e => e.key === 'Enter' && handleAddTradeName()}
    />
    <button
      onClick={handleAddTradeName}
      style={{
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      + Add
    </button>
  </div>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {formData.tradeNames.map((name, i) => (
      <span
        key={i}
        style={{
          padding: '8px 12px',
          backgroundColor: formData.defaultTradeName === name ? '#27ae60' : '#0077be', // GREEN if default
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer', // ADD cursor pointer
          border: formData.defaultTradeName === name ? '2px solid #1e8449' : 'none' // ADD border if default
        }}
        onClick={() => setFormData({ ...formData, defaultTradeName: name })} // ADD click to set default
        title={formData.defaultTradeName === name ? 'Default trade name (Click another to change)' : 'Click to set as default'} // ADD tooltip
      >
        {formData.defaultTradeName === name && '⭐ '} {/* ADD star icon for default */}
        {name}
        <span
          onClick={(e) => {
            e.stopPropagation(); // PREVENT triggering the parent onClick
            handleRemoveTradeName(i);
          }}
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          ×
        </span>
      </span>
    ))}
  </div>
  {formData.tradeNames.length > 0 && !formData.defaultTradeName && (
    <div style={{ 
      marginTop: '8px', 
      fontSize: '12px', 
      color: '#e67e22',
      fontStyle: 'italic'
    }}>
      💡 Click on a trade name to set it as default
    </div>
  )}
</div>

<div style={{ marginBottom: '15px' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
    Strengths
  </label>
  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
    <input
      style={{
        flex: 1,
        padding: '10px',
        borderRadius: '6px',
        border: '2px solid #ddd'
      }}
      value={strengthInput}
      onChange={e => setStrengthInput(e.target.value)}
      placeholder="Enter strength (e.g., 500mg)"
      onKeyPress={e => e.key === 'Enter' && handleAddStrength()}
    />
    <button
      onClick={handleAddStrength}
      style={{
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      + Add
    </button>
  </div>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {formData.strengths.map((strength, i) => (
      <span
        key={i}
        style={{
          padding: '8px 12px',
          backgroundColor: formData.defaultStrength === strength ? '#27ae60' : '#9b59b6', // GREEN if default
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer', // ADD cursor pointer
          border: formData.defaultStrength === strength ? '2px solid #1e8449' : 'none' // ADD border if default
        }}
        onClick={() => setFormData({ ...formData, defaultStrength: strength })} // ADD click to set default
        title={formData.defaultStrength === strength ? 'Default strength (Click another to change)' : 'Click to set as default'} // ADD tooltip
      >
        {formData.defaultStrength === strength && '⭐ '} {/* ADD star icon for default */}
        {strength}
        <span
          onClick={(e) => {
            e.stopPropagation(); // PREVENT triggering the parent onClick
            handleRemoveStrength(i);
          }}
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          ×
        </span>
      </span>
    ))}
  </div>
  {formData.strengths.length > 0 && !formData.defaultStrength && (
    <div style={{ 
      marginTop: '8px', 
      fontSize: '12px', 
      color: '#e67e22',
      fontStyle: 'italic'
    }}>
      💡 Click on a strength to set it as default
    </div>
  )}
</div>

<div style={{ marginBottom: '15px' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
    Special Note (Default note for prescriptions)
  </label>
  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
    <input
      style={{
        flex: 1,
        padding: '10px',
        borderRadius: '6px',
        border: '2px solid #ddd'
      }}
      value={formData.specialNote}
      onChange={e => {
        const value = e.target.value;
        const translation = translateToMarathi(value);
        setFormData({
          ...formData,
          specialNote: translation || value
        });
      }}
      placeholder="Type in English (e.g., take after food) or Marathi directly"
    />
    {/* <button
      type="button"
      onClick={() => {
        if (!formData.specialNote || !formData.specialNote.trim()) {
          alert('⚠️ Please enter some text first in the Special Note field');
          return;
        }

        const translatedText = translateToMarathi(formData.specialNote);

        if (translatedText) {
          setFormData({ ...formData, specialNote: translatedText });
          alert(`✅ Translated successfully!\n\nEnglish: ${formData.specialNote}\nMarathi: ${translatedText}`);
        } else {
          alert('❌ Translation not found.\n\nCommon phrases:\n• take after food\n• take before food\n• take with food\n• take on empty stomach\n• take at bedtime\n• take in morning\n• take at night\n\nYou can also type directly in Marathi.');
        }
      }}
      style={{
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
      }}
    >
      🔄 Translate
    </button> */}
  </div>
  <div style={{ 
    fontSize: '11px', 
    color: '#666',
    fontStyle: 'italic'
  }}>
    💡 Type English phrase and click Translate, or type Marathi directly. This will be auto-filled in prescriptions.
  </div>
  <div style={{ 
    fontSize: '11px', 
    color: '#999',
    fontStyle: 'italic',
    marginTop: '5px'
  }}>
    Examples: "take after food", "take before food", "take with food", "take on empty stomach"
  </div>
</div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveMedicine}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #0077be 0%, #005a94 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  {editingMedicine ? '✓ Update Medicine' : '+ Add Medicine'}
                </button>
                {editingMedicine && (
                  <button
                    onClick={resetForm}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Medicine List */}
          {!showForm && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>
                  📋 Medicine Database ({filteredMedicines.length} medicines)
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '15px',
                maxHeight: '600px',
                overflow: 'auto'
              }}>
                {filteredMedicines.map((med, i) => (
                  <div
                    key={med.id}
                    style={{
                      border: '2px solid #e0e0e0',
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0077be';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,119,190,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <span style={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            color: '#2c3e50'
                          }}>
                            {med.molecule}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            backgroundColor: '#0077be',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {med.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                          ID: {med.id} | {med.dosageForm}
                        </div>
                        {med.strengths && med.strengths.length > 0 && (
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            <strong>Strengths:</strong> {med.strengths.join(', ')}
                          </div>
                        )}
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                          <strong>Trade Names:</strong> {med.tradeNames.join(', ')}
                        </div>
                        {med.defaultRegimens && med.defaultRegimens.length > 0 ? (
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                            <strong>Default Regimens:</strong>
                            <div style={{ marginTop: '5px' }}>
                              {med.defaultRegimens.map((regimen, i) => (
                                <div key={i} style={{ marginBottom: '4px' }}>
                                  {regimen.times} for {regimen.days} days
                                  {regimen.tradeName ? ` • ${regimen.tradeName}` : ''}
                                  {regimen.strength ? ` • ${regimen.strength}` : ''}
                                  {regimen.specialNote ? ` • ${regimen.specialNote}` : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                            <strong>Default Dosage:</strong> {med.defaultTimes} for {med.defaultDays} days
                          </div>
                        )}
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          <strong>Indication:</strong> {med.indication}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(med)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMedicines.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999',
                  fontSize: '16px'
                }}>
                  No medicines found matching your search criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== DEMO APPLICATION ====================
export default function Demo() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({ total: 0, categories: {} });

  useEffect(() => {
    // Initialize database
    MedicineDBService.initializeDB();
    loadMedicines();
    
    // Listen for database updates
    window.addEventListener('medicineDBUpdated', loadMedicines);
    return () => window.removeEventListener('medicineDBUpdated', loadMedicines);
  }, []);

  function loadMedicines() {
    const allMedicines = MedicineDBService.getAllMedicines();
    setMedicines(allMedicines);
    
    // Calculate statistics
    const categoryCount = {};
    allMedicines.forEach(med => {
      categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
    });
    setStats({
      total: allMedicines.length,
      categories: categoryCount
    });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fbfd 0%, #ffffff 100%)',
      padding: '30px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0077be 0%, #005a94 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,119,190,0.3)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
            💊 Medicine Database Management System
          </h1>
          
        </div>

        {/* Statistics Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #0077be'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Total Medicines
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0077be' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #27ae60'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Categories
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              {Object.keys(stats.categories).length}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #9b59b6'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Top Category
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9b59b6' }}>
              {Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowAdmin(true)}
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #0077be 0%, #005a94 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,119,190,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,119,190,0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,119,190,0.3)';
            }}
          >
            🔧 Open Database Manager
          </button>

          <button
            onClick={() => {
              MedicineDBService.exportDatabase();
              alert('✅ Database exported successfully!');
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(39,174,96,0.3)'
            }}
          >
            📥 Export Database
          </button>

          <button
            onClick={loadMedicines}
            style={{
              padding: '15px 30px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(52,152,219,0.3)'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Medicine Preview */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>
            📋 Current Database ({medicines.length} medicines)
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px',
            maxHeight: '500px',
            overflow: 'auto',
            padding: '10px'
          }}>
            {medicines.map(med => (
              <div
                key={med.id}
                style={{
                  padding: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fbfd',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#0077be';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50' }}>
                    {med.molecule}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#0077be',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '11px'
                  }}>
                    {med.category}
                  </span>
                </div>
                {med.strengths && med.strengths.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#9b59b6', marginBottom: '5px', fontWeight: 'bold' }}>
                    {med.strengths.join(', ')}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  {med.tradeNames.slice(0, 2).join(', ')}
                  {med.tradeNames.length > 2 && ` +${med.tradeNames.length - 2} more`}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {med.defaultTimes} • {med.defaultDays} days
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      {showAdmin && <MedicineAdmin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}