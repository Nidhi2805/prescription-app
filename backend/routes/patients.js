const express = require('express');
const router = express.Router();

// ✅ IMPORT CONTROLLER FUNCTIONS
const {
  createPatient,
  getPatient,
  listPatients,
  addPrescription,
  searchPatients      // 🔴 THIS WAS MISSING
} = require('../controllers/patientController');

// Routes
router.post('/', createPatient);
router.get('/', listPatients);
router.get('/search', searchPatients);
router.get('/:id', getPatient);
router.post('/:id/prescriptions', addPrescription);

module.exports = router;
