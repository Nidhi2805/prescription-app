require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Medicine = require('./models/Medicine');

const sample = [
  { name: 'Paracetamol 500mg', defaultTimes: '1-0-1', defaultDays: 5, description: 'Fever reducer and pain relief' },
  { name: 'Amoxicillin 250mg', defaultTimes: '1-1-1', defaultDays: 7, description: 'Antibiotic' },
  { name: 'Cough Syrup', defaultTimes: '0-1-0', defaultDays: 3 },
  { name: 'Vitamin C 500mg', defaultTimes: '1-0-0', defaultDays: 10 },
  { name: 'Pantoprazole 40mg', defaultTimes: '1-0-0', defaultDays: 5 },
];

async function seed() {
  await connectDB(process.env.MONGO_URI);
  await Medicine.deleteMany({});
  await Medicine.insertMany(sample);
  console.log('✅ Medicines added');
  process.exit();
}

seed();
