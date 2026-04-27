import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* =========================
   GET PURCHASE HISTORY ✅
========================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id,
        raw_weight,
        usable_weight,
        waste_percentage,
        created_at,
        product_id,
        products (
          name,
          unit,
          has_waste
        )
      `);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const formatted = data.map((p) => ({
      id: p.id,
      raw_weight: p.raw_weight,
      usable_weight: p.usable_weight,
      waste_percentage: p.waste_percentage,
      created_at: p.created_at,
      product_name: p.products?.name || "—",
      unit: p.products?.unit || "kg",             
      has_waste: p.products?.has_waste ?? false,  
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD PURCHASE ✅ (FIXED)
========================= */
router.post("/", async (req, res) => {
  try {
    let { productId, rawWeight, wastePercentage } = req.body;

    // ✅ validation
    if (!productId || rawWeight === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    rawWeight = Number(rawWeight);

    // 🔍 get product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let usableWeight;
    let waste = 0;

    /* =========================
       🔥 CORE LOGIC
    ========================= */

    // ✅ CASE 1 → PCS (Eggs)
    if (product.unit === "pcs") {
      usableWeight = rawWeight;
      waste = 0;
    }

    // ✅ CASE 2 → KG but NO waste
    else if (!product.has_waste) {
      usableWeight = rawWeight;
      waste = 0;
    }

    // ✅ CASE 3 → KG + waste
    else {
      waste =
        wastePercentage !== undefined
          ? Number(wastePercentage)
          : product.default_waste_percentage || 0;

      usableWeight = rawWeight * (1 - waste / 100);
    }

    /* =========================
       INSERT PURCHASE
    ========================= */

    const { data, error } = await supabase
      .from("purchases")
      .insert([
        {
          product_id: productId,
          raw_weight: rawWeight,
          waste_percentage: waste,
          usable_weight: Number(usableWeight.toFixed(2)),
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Purchase added",
      data,
      calculated: {
        unit: product.unit,
        has_waste: product.has_waste,
        usable_weight: usableWeight,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;