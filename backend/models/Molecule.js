const mongoose = require("mongoose");

const MoleculeSchema = new mongoose.Schema({
  molecule: { type: String, required: true },
  defaultTimes: { type: String, default: "1-0-0" },
  defaultDays: { type: Number, default: 5 },
  brands: [String] // fallback brands
});

module.exports = mongoose.model("Molecule", MoleculeSchema);
