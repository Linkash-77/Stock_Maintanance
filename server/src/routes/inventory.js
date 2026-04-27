import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: products } = await supabase.from("products").select("*");
    const { data: purchases } = await supabase.from("purchases").select("*");
    const { data: sales } = await supabase.from("sales").select("*");
    

    const result = products.map((product) => {
      const totalPurchased = purchases
        .filter(p => p.product_id === product.id)
        .reduce((sum, p) => sum + p.usable_weight, 0);

      const totalSold = sales
        .filter(s => s.product_id === product.id)
        .reduce((sum, s) => sum + s.sold_weight, 0);

      return {
        productId: product.id,
        name: product.name.trim(),
        unit: product.unit,                 
        has_waste: product.has_waste,       
        waste: product.default_waste_percentage || 0,
        stock: totalPurchased - totalSold,
      };    
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;