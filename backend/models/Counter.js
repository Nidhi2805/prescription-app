const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 100000 } // start from 100000
});

module.exports = mongoose.model('Counter', CounterSchema);
