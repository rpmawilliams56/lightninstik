import express from "express";
import { supabase } from "../../lib/supa.js";

const router = express.Router();

router.post("/leads", async (req, res) => {

  const {
    first_name,
    last_name,
    email,
    phone,
    source,
    utm_source,
    utm_campaign,
    utm_medium,
    qr_id
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "missing email" });
  }

  const payload = {
    first_name,
    last_name,
    email,
    phone,

    source, // EXACT manual tag from form

    // defaults (always false unless later updated elsewhere)
    opt_in_email_sms_push_anytime: false,
    opt_in_email_sms_push_show_only: false,
    opt_in_email_only: false,
    opt_out: false,

    interest_artist_demo: false,
    interest_business_sponsorship: false,

    utm_source,
    utm_campaign,
    utm_medium,
    qr_id
  };

  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return res.json({ success: true, duplicate: true });
  }

  const { error } = await supabase
    .from("leads")
    .insert([payload]);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true });

});

export default router;