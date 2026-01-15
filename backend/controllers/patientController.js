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
      allergies, 
      weight, 
      sex
    } = req.body;

    if (!name || !assignedDoctor) {
      return res.status(400).json({ error: 'Name and Doctor are required' });
    }

    const patientId = await getNextPatientId();

    const patient = new Patient({
      patientId,
      name,
      dob,
      age,
      sex,
      weight,
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
    const patient = await Patient.findOne({ patientId: req.params.id });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const newPrescription = {
      prescriptionId: "RX-" + Date.now(),
      doctorName: req.body.doctorName,
      date: req.body.date || new Date(),
      medicines: req.body.medicines,
      notes: req.body.notes || ""
    };

    patient.prescriptions.push(newPrescription);
    await patient.save();

    res.json({
      success: true,
      prescription: newPrescription,
      allPrescriptions: patient.prescriptions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* --------------------------------------------------
   🔎 SEARCH PATIENTS
-------------------------------------------------- */
async function searchPatients(req, res) {
  try {
    const { patientId, name, contact } = req.query;
    const conditions = [];

    if (patientId) conditions.push({ patientId: Number(patientId) });
    if (name)      conditions.push({ name: { $regex: name, $options: 'i' } });
    if (contact)   conditions.push({ contact });

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
