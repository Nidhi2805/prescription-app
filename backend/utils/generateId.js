const { v4: uuidv4 } = require('uuid');

function generatePatientId() {
  return 'P-' + uuidv4(); // e.g. P-xxxxxxxx-xxxx-xxxx-...
}

function generatePrescriptionId() {
  return 'RX-' + uuidv4();
}

module.exports = { generatePatientId, generatePrescriptionId };
