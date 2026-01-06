const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  times: { type: String, required: true },
  days: { type: Number, required: true },
  totalQuantity: { type: Number, required: true }
});

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  doctorName: { type: String },
  medicines: [MedicineSchema],
  notes: { type: String }
});

const PatientSchema = new mongoose.Schema({
  patientId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  age: Number,

  // 🔥 UPDATED: Store as String (ex: “65 kg”)
  weight: { type: String },

  // ❌ Removed height — no longer in form
  contact: String,
  caseHistory: String,

  assignedDoctor: {
    type: String,
    required: true
  },

  allergies: {
    type: String,
    default: 'None'
  },

  dob: {
    type: Date,
    required: true
  },
  
  address: {
    type: String,
    required: true
  },

  // 🔥 NEW FIELD
  sex: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: ""
  },
  
  createdAt: { type: Date, default: Date.now },
  prescriptions: [PrescriptionSchema]
});

module.exports = mongoose.model('Patient', PatientSchema);
