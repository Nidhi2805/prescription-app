const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createPatient,
  getPatient,
  listPatients,
  addPrescription,
  searchPatients
} = require('../controllers/patientController');

// Routes
router.post('/', createPatient);
router.get('/', listPatients);
router.get('/search', searchPatients);
router.get('/:id', getPatient);

// Add prescription (use controller — do NOT rewrite logic here)
router.post("/:id/prescriptions", addPrescription);

module.exports = router;
