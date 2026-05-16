const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  defaultTimes: { type: String, default: "1-0-1" }, // ex: "1-1-0"
  defaultDays: { type: Number, default: 10 },
  description: String,
});

module.exports = mongoose.model('Medicine', MedicineSchema);
