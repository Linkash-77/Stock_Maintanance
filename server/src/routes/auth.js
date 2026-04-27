import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* =========================
   LOGIN WITH PIN ✅
========================= */
router.post("/login", async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: "Phone and PIN required" });
    }

    // 🔥 Normalize phone (IMPORTANT FIX)
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : `+91${phone}`;

    console.log("Incoming:", formattedPhone, pin);

    // 🔍 Find user
    const { data: user, error } = await supabase
      .from("authorized_users")
      .select("*")
      .eq("phone", formattedPhone)
      .single();

    console.log("User from DB:", user);

    if (error || !user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // 🔐 Check PIN (IMPORTANT FIX)
    if (String(user.pin) !== String(pin)) {
      return res.status(400).json({ error: "Invalid PIN" });
    }

    // ✅ SUCCESS
    res.json({
      message: "Login successful",
      token: "dummy-token",
      user: {
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-pin", async (req, res) => {
  try {
    const { phone, newPin, secret } = req.body;

    if (!phone || !newPin || !secret) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (secret !== process.env.SHOP_SECRET) {
      return res.status(403).json({ error: "Invalid shop code" });
    }

    // 🔍 CHECK USER
    const { data: user, error } = await supabase
      .from("authorized_users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔄 UPDATE PIN
    const { error: updateError } = await supabase
      .from("authorized_users")
      .update({ pin: newPin })
      .eq("phone", phone);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({ message: "PIN reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;