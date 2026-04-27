import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/products.js";
import purchaseRoutes from "./routes/purchase.js";
import salesRoutes from "./routes/sales.js";
import inventoryRoutes from "./routes/inventory.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);   
app.use("/api/purchase", purchaseRoutes);  
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});