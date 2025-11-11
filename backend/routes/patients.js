const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');

router.post('/', controller.createPatient);            // Create patient
router.get('/', controller.listPatients);              // List patients
router.get('/:patientId', controller.getPatient);      // Get patient by id
router.post('/:patientId/prescriptions', controller.addPrescription); // Add prescription

module.exports = router;
