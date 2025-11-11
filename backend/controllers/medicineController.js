const Medicine = require('../models/Medicine');

// Create new medicine (admin use)
async function addMedicine(req, res) {
  try {
    const { name, defaultTimes, defaultDays, description } = req.body;
    const med = new Medicine({ name, defaultTimes, defaultDays, description });
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding medicine' });
  }
}

// Search medicines
async function searchMedicines(req, res) {
  try {
    const q = req.query.search || '';
    const results = await Medicine.find({ name: { $regex: q, $options: 'i' } }).limit(10);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching medicines' });
  }
}

module.exports = { addMedicine, searchMedicines };
