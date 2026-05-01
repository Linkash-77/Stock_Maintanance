import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* =========================
   GET PRODUCTS ✅
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

/* =========================
   RESET STOCK ✅
   Inserts a compensating purchase entry with negative
   usable_weight equal to the current stock, bringing
   the computed stock to zero. Purchase/sales history
   is fully preserved.
========================= */
router.post("/:id/reset-stock", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch all purchases and sales for this product
    const [{ data: purchases, error: pErr }, { data: sales, error: sErr }] =
      await Promise.all([
        supabase.from("purchases").select("usable_weight").eq("product_id", id),
        supabase.from("sales").select("sold_weight").eq("product_id", id),
      ]);

    if (pErr) throw pErr;
    if (sErr) throw sErr;

    const totalPurchased = (purchases ?? []).reduce(
      (sum, p) => sum + (p.usable_weight ?? 0),
      0
    );
    const totalSold = (sales ?? []).reduce(
      (sum, s) => sum + (s.sold_weight ?? 0),
      0
    );

    const currentStock = totalPurchased - totalSold;

    // 2. If stock is already zero, nothing to do
    if (currentStock === 0) {
      return res.json({ message: "Stock is already zero", adjusted: 0 });
    }

    // 3. Insert a compensating purchase entry with negative usable_weight
    const { error: insertErr } = await supabase.from("purchases").insert([
      {
        product_id: id,
        usable_weight: -currentStock, // cancels out the current stock exactly
        note: "Stock reset to zero",
      },
    ]);

    if (insertErr) throw insertErr;

    res.json({ message: "Stock reset to zero", adjusted: -currentStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE PRODUCT ✅
   No CASCADE on FK, so we delete child rows first:
   purchases → sales → product
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete purchases
    const { error: pErr } = await supabase
      .from("purchases")
      .delete()
      .eq("product_id", id);
    if (pErr) throw pErr;

    // 2. Delete sales
    const { error: sErr } = await supabase
      .from("sales")
      .delete()
      .eq("product_id", id);
    if (sErr) throw sErr;

    // 3. Delete the product itself
    const { error: prodErr } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (prodErr) throw prodErr;

    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;