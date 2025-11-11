const Patient = require('../models/Patient');
const { generatePatientId, generatePrescriptionId } = require('../utils/generateId');

async function createPatient(req, res) {
  try {
    const { name, age, weight, height, caseHistory, contact } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const patientId = generatePatientId();
    const patient = new Patient({ patientId, name, age, weight, height, caseHistory, contact });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function listPatients(req, res) {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).limit(100);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getPatient(req, res) {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function addPrescription(req, res) {
  try {
    const { patientId } = req.params;
    const { doctorName, medicines, notes } = req.body;
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'Medicines required' });
    }
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Compute totalQuantity if not provided: assume times string like "1-1-0" -> count of 1s per day
    const prescriptions = patient.prescriptions || [];
    const prescriptionId = generatePrescriptionId();

    const meds = medicines.map(m => {
      const parts = m.times.split('-').map(p => Number(p || 0));
      const dosesPerDay = parts.reduce((a, b) => a + b, 0);
      const totalQuantity = dosesPerDay * m.days;
      return { name: m.name, times: m.times, days: m.days, totalQuantity };
    });

    const prescription = { prescriptionId, doctorName, medicines: meds, notes };
    prescriptions.push(prescription);
    patient.prescriptions = prescriptions;
    await patient.save();
    res.status(201).json({ prescription, patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { createPatient, listPatients, getPatient, addPrescription };
