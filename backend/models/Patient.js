const mongoose = require('mongoose');

// ----------------- MEDICINE INSIDE PRESCRIPTION -----------------
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  times: { type: String, required: true },     // e.g., "1-0-1"
  days: { type: Number, required: true },       // duration
  totalQuantity: { type: Number, required: true },
  specialNote: { type: String, default: "" }    // optional
});

// ----------------- PRESCRIPTION SCHEMA -----------------
const PrescriptionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },

  doctorName: { type: String },

  medicines: [MedicineSchema],

  notes: { type: String, default: "" }
});

// ----------------- PATIENT SCHEMA -----------------
const PatientSchema = new mongoose.Schema({
  patientId: { type: Number, required: true, unique: true },

  name: { type: String, required: true },

  age: Number,

  // WEIGHT stored as string so "65 kg", "72kg", "81.5" works
  weight: { type: String },

  contact: String,
  caseHistory: String,

  assignedDoctor: {
    type: String,
    required: true
  },

  allergies: {
    type: String,
    default: "None"
  },

  dob: {
    type: Date,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  // NEW: SEX FIELD
  sex: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: ""
  },

  createdAt: { type: Date, default: Date.now },

  // 🔥 PRESCRIPTIONS WILL BE STORED HERE ✔
  prescriptions: [PrescriptionSchema]
});

module.exports = mongoose.model("Patient", PatientSchema);
