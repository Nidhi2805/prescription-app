const Patient = require('../models/Patient');
const Counter = require('../models/Counter');

/* --------------------------------------------------
   🔢 AUTO-INCREMENT PATIENT ID (NUMERIC)
-------------------------------------------------- */
async function getNextPatientId() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'patientId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/* --------------------------------------------------
   ➕ CREATE PATIENT
-------------------------------------------------- */
async function createPatient(req, res) {
  try {
    const {
      name,
      dob,
      age,
      contact,
      address,
      assignedDoctor,
      allergies
    } = req.body;

    if (!name || !assignedDoctor) {
      return res.status(400).json({ error: 'Name and Doctor are required' });
    }

    // ✅ Numeric hospital-style patient ID
    const patientId = await getNextPatientId();

    const patient = new Patient({
      patientId,
      name,
      dob,
      age,
      contact,
      address,
      assignedDoctor,
      allergies: allergies || 'None',
      prescriptions: []
    });

    await patient.save();
    res.status(201).json(patient);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/* --------------------------------------------------
   📋 LIST PATIENTS (OPD QUEUE)
-------------------------------------------------- */
async function listPatients(req, res) {
  try {
    const patients = await Patient
      .find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(patients);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/* --------------------------------------------------
   🔍 GET SINGLE PATIENT (BY NUMERIC ID)
-------------------------------------------------- */
async function getPatient(req, res) {
  try {
    const patientId = Number(req.params.id);

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
}

/* --------------------------------------------------
   💊 ADD PRESCRIPTION
-------------------------------------------------- */
async function addPrescription(req, res) {
  try {
    const patientId = Number(req.params.patientId);
    const { doctorName, medicines, notes } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'Medicines required' });
    }

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const prescriptionId = `RX-${Date.now()}`;

    const meds = medicines.map(m => {
      const parts = m.times.split('-').map(n => Number(n || 0));
      const dosesPerDay = parts.reduce((a, b) => a + b, 0);
      const totalQuantity = dosesPerDay * m.days;

      return {
        name: m.name,
        times: m.times,
        days: m.days,
        totalQuantity
      };
    });

    const prescription = {
      prescriptionId,
      doctorName,
      medicines: meds,
      notes,
      date: new Date()
    };

    patient.prescriptions.push(prescription);
    await patient.save();

    res.status(201).json({ prescription });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

/* --------------------------------------------------
   🔎 SEARCH PATIENTS
-------------------------------------------------- */
async function searchPatients(req, res) {
  try {
    console.log('🔍 Search Query:', req.query);

    const { patientId, name, contact } = req.query;
    const conditions = [];

    if (patientId) {
      conditions.push({ patientId: Number(patientId) });
    }

    if (name) {
      conditions.push({ name: { $regex: name, $options: 'i' } });
    }

    if (contact) {
      conditions.push({ contact });
    }

    if (conditions.length === 0) {
      return res.json([]);
    }

    const patients = await Patient
      .find({ $or: conditions })
      .limit(20);

    res.json(patients);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
}

/* --------------------------------------------------
   📦 EXPORTS
-------------------------------------------------- */
module.exports = {
  createPatient,
  listPatients,
  getPatient,
  addPrescription,
  searchPatients
};
