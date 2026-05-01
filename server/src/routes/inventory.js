import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: products } = await supabase.from("products").select("*");
    const { data: purchases } = await supabase
      .from("purchases")
      .select("product_id, usable_weight, created_at");
    const { data: sales } = await supabase
      .from("sales")
      .select("product_id, sold_weight, created_at");

    const result = products.map((product) => {
      const productPurchases = purchases.filter(
        (p) => p.product_id === product.id
      );
      const productSales = sales.filter(
        (s) => s.product_id === product.id
      );

      const totalPurchased = productPurchases.reduce(
        (sum, p) => sum + p.usable_weight,
        0
      );
      const totalSold = productSales.reduce(
        (sum, s) => sum + s.sold_weight,
        0
      );

      // find the most recent created_at across purchases and sales
      const allTimestamps = [
        ...productPurchases.map((p) => p.created_at),
        ...productSales.map((s) => s.created_at),
      ]
        .filter(Boolean)
        .map((t) => new Date(t).getTime());

      const last_updated =
        allTimestamps.length > 0
          ? new Date(Math.max(...allTimestamps)).toISOString()
          : null;

      return {
        productId: product.id,
        name: product.name.trim(),
        unit: product.unit,
        has_waste: product.has_waste,
        waste: product.default_waste_percentage || 0,
        stock: totalPurchased - totalSold,
        last_updated,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;