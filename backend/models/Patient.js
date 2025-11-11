const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  times: { type: String, required: true }, // e.g. "1-1-0"
  days: { type: Number, required: true },
  totalQuantity: { type: Number, required: true } // optional precomputed
});

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  doctorName: { type: String },
  medicines: [MedicineSchema],
  notes: { type: String }
});

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: Number,
  weight: Number,
  height: Number,
  contact: String,
  caseHistory: String,
  createdAt: { type: Date, default: Date.now },
  prescriptions: [PrescriptionSchema]
});

module.exports = mongoose.model('Patient', PatientSchema);
