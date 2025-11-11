const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicineController');

router.get('/', controller.searchMedicines);  // GET /api/medicines?search=para
router.post('/', controller.addMedicine);     // POST /api/medicines

module.exports = router;
