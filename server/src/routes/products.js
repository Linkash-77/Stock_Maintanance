import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* =========================
   GET PRODUCTS ✅ (MISSING FIX)
========================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD PRODUCT ✅
========================= */
router.post("/", async (req, res) => {
  try {
    let {
      name,
      unit,
      has_waste,
      defaultWastePercentage,
    } = req.body;

    if (!name || !unit) {
      return res.status(400).json({
        error: "Name and unit required",
      });
    }

    name = name.trim().replace(/\n/g, "");

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          unit,
          has_waste: has_waste ?? false,
          default_waste_percentage: defaultWastePercentage || 0,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Product added",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;