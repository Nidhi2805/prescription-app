const express = require("express");
const router = express.Router();
const Molecule = require("../models/Molecule");
const axios = require("axios");

/* ---------------- GET ALL MOLECULES ---------------- */
router.get("/molecules", async (req, res) => {
  const list = await Molecule.find();
  res.json(list);
});

/* ---------------- GET BRANDS FOR MOLECULE ---------------- */
router.get("/brands", async (req, res) => {
  const { molecule } = req.query;

  if (!molecule) return res.json([]);

  try {
    // HealthOS API (dummy URL – replace with real key)
    const apiRes = await axios.get(
      `https://healthos-api.india/v1/brands?molecule=${encodeURI(molecule)}`
    );

    if (apiRes.data && apiRes.data.brands?.length) {
      return res.json(apiRes.data.brands);
    }
  } catch (error) {
    console.log("HealthOS unavailable, using fallback");
  }

  // fallback brand list from DB
  const mol = await Molecule.findOne({ molecule });
  res.json(mol?.brands || []);
});

module.exports = router;
