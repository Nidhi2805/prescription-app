// src/services/MedicineDBService.js
export const MedicineDBService = {
    DB_KEY: 'ORTHOPEDIC_MEDICINE_DATABASE',
    
    initializeDB() {
      const existing = this.getAllMedicines();
      if (!existing || existing.length === 0) {
        const defaultMedicines = [
          {
            id: "MED001",
            molecule: "Paracetamol",
            tradeNames: ["Crocin", "Dolo 650", "Calpol", "Pacimol"],
            defaultTimes: "1-0-1",
            defaultDays: 3,
            category: "Analgesic",
            indication: "Pain relief",
            dosageForm: "Tablet",
            strength: "650mg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Add all your medicines here...
        ];
        this.saveMedicines(defaultMedicines);
      }
    },
    
    getAllMedicines() {
      try {
        const data = localStorage.getItem(this.DB_KEY);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error reading medicine database:', error);
        return [];
      }
    },
    
    saveMedicines(medicines) {
      try {
        localStorage.setItem(this.DB_KEY, JSON.stringify(medicines));
        window.dispatchEvent(new Event('medicineDBUpdated'));
        return true;
      } catch (error) {
        console.error('Error saving medicine database:', error);
        return false;
      }
    },
    
    addMedicine(medicine) {
      const medicines = this.getAllMedicines();
      const regimens = medicine.defaultRegimens && medicine.defaultRegimens.length > 0
        ? medicine.defaultRegimens
        : [{
            times: medicine.defaultTimes || '1-0-1',
            days: medicine.defaultDays || 10,
            tradeName: medicine.defaultTradename || '',
            strength: medicine.defaultStrength || '',
            specialNote: medicine.specialNote || ''
          }];
      const newMedicine = {
        ...medicine,
        defaultRegimens: regimens,
        defaultTimes: medicine.defaultTimes || regimens[0].times,
        defaultDays: medicine.defaultDays || regimens[0].days,
        defaultTradename: medicine.defaultTradename || regimens[0].tradeName,
        defaultStrength: medicine.defaultStrength || regimens[0].strength,
        specialNote: medicine.specialNote || regimens[0].specialNote,
        id: `MED${String(medicines.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      medicines.push(newMedicine);
      return this.saveMedicines(medicines) ? newMedicine : null;
    },
    
    updateMedicine(id, updatedData) {
      const medicines = this.getAllMedicines();
      const index = medicines.findIndex(m => m.id === id);
      if (index === -1) return false;
      
      medicines[index] = {
        ...medicines[index],
        ...updatedData,
        id: medicines[index].id,
        createdAt: medicines[index].createdAt,
        updatedAt: new Date().toISOString()
      };
      return this.saveMedicines(medicines);
    },
    
    deleteMedicine(id) {
      const medicines = this.getAllMedicines();
      const filtered = medicines.filter(m => m.id !== id);
      return this.saveMedicines(filtered);
    },
    
    searchMedicines(query) {
      const medicines = this.getAllMedicines();
      const lowerQuery = query.toLowerCase();
      return medicines.filter(m =>
        m.molecule.toLowerCase().includes(lowerQuery) ||
        m.tradeNames.some(t => t.toLowerCase().includes(lowerQuery)) ||
        m.category.toLowerCase().includes(lowerQuery)
      );
    },

    // ADD this new method to MedicineDBService object:
translateToMarathi(text) {
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

  const lowerInput = text.toLowerCase().trim();
  let translatedText = translations[lowerInput];

  if (!translatedText) {
    for (const [key, value] of Object.entries(translations)) {
      if (lowerInput.includes(key)) {
        translatedText = value;
        break;
      }
    }
  }

  return translatedText || null;
},
    
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