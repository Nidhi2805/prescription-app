require("dotenv").config();
const connectDB = require("./config/db");
const Molecule = require("./models/Molecule");

const list = [
  {
    molecule: "Etoricoxib 60mg",
    defaultTimes: "1-0-0",
    defaultDays: 5,
    brands: ["Nucoxia 60", "Etoshine 60", "Turox 60"]
  },
  {
    molecule: "Etoricoxib 90mg",
    defaultTimes: "1-0-0",
    defaultDays: 5,
    brands: ["Nucoxia 90", "Etoshine 90"]
  },
  {
    molecule: "Acelofenac 100mg",
    defaultTimes: "1-1-0",
    defaultDays: 5,
    brands: ["Hifenac 100", "Zerodol P"]
  },
  {
    molecule: "Diclofenac 50mg",
    defaultTimes: "1-0-1",
    defaultDays: 3,
    brands: ["Voveran 50", "Diclowin 50"]
  },
  {
    molecule: "Pantoprazole 40mg",
    defaultTimes: "1-0-0",
    defaultDays: 7,
    brands: ["Pantocid 40", "Pan 40", "Pantodac 40"]
  }
];

async function seed() {
  await connectDB(process.env.MONGO_URI);
  await Molecule.deleteMany({});
  await Molecule.insertMany(list);
  console.log("✔ Molecule List Added");
  process.exit();
}

seed();
