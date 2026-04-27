import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* =========================
   ADD SALE
========================= */
router.post("/", async (req, res) => {
  try {
    const { productId, soldWeight } = req.body;

    if (!productId || !soldWeight) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 🔍 Get product (for unit awareness later if needed)
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    /* =========================
       CALCULATE STOCK
    ========================= */

    const { data: purchases } = await supabase
      .from("purchases")
      .select("usable_weight")
      .eq("product_id", productId);

    const totalPurchased = purchases.reduce(
      (sum, p) => sum + p.usable_weight,
      0
    );

    const { data: sales } = await supabase
      .from("sales")
      .select("sold_weight")
      .eq("product_id", productId);

    const totalSold = sales.reduce(
      (sum, s) => sum + s.sold_weight,
      0
    );

    const availableStock = totalPurchased - totalSold;

    if (soldWeight > availableStock) {
      return res.status(400).json({
        error: "Not enough stock",
        availableStock,
      });
    }

    /* =========================
       INSERT SALE
    ========================= */

    const { data, error } = await supabase
      .from("sales")
      .insert([
        {
          product_id: productId,
          sold_weight: soldWeight,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Sale recorded successfully",
      data,
      remainingStock: availableStock - soldWeight,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SALES HISTORY (FIXED)
========================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        id,
        sold_weight,
        created_at,
        product_id,
        products ( name, unit ) 
      `);

    if (error) return res.status(500).json({ error: error.message });

    const formatted = data.map((s) => ({
      id: s.id,
      sold_weight: s.sold_weight,
      created_at: s.created_at,
      product_name: s.products?.name || "—",
      unit: s.products?.unit || "kg", // 🔥 IMPORTANT
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET STOCK
========================= */
router.get("/stock/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: purchases } = await supabase
      .from("purchases")
      .select("usable_weight")
      .eq("product_id", id);

    const totalPurchased = purchases.reduce(
      (sum, p) => sum + p.usable_weight,
      0
    );

    const { data: sales } = await supabase
      .from("sales")
      .select("sold_weight")
      .eq("product_id", id);

    const totalSold = sales.reduce(
      (sum, s) => sum + s.sold_weight,
      0
    );

    res.json({
      stock: totalPurchased - totalSold,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   TODAY SALES
========================= */
router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .gte("created_at", today);

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      count: data.length,
      total: data.reduce((sum, s) => sum + s.sold_weight, 0),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;