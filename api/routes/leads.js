import express from "express";
import { supabase } from "../../lib/supa.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    qr_id,

    opt_in_email_sms_push_anytime,
    opt_in_email_sms_push_show_only,
    opt_in_email_only,
    opt_out,

    interest_artist_demo,
    interest_business_sponsorship

  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "missing email" });
  }

  const payload = {
    first_name,
    last_name,
    email,
    phone,
    source,

    opt_in_email_sms_push_anytime: !!opt_in_email_sms_push_anytime,
    opt_in_email_sms_push_show_only: !!opt_in_email_sms_push_show_only,
    opt_in_email_only: !!opt_in_email_only,
    opt_out: !!opt_out,

    interest_artist_demo: !!interest_artist_demo,
    interest_business_sponsorship: !!interest_business_sponsorship,

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

  // EMAIL (must be inside route)
  await resend.emails.send({
    from: "Lightnin Stik <noreply@lightninstik.com>",
    to: "rick@lightninstik.com",
    subject: "New Lead Submission",

    html: `
      <h2>New Lead</h2>

      <p><b>Name:</b> ${first_name} ${last_name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>

      <hr />

      <h3>Opt-In Selection</h3>
      <ul>
        <li>Anytime Notifications: ${opt_in_email_sms_push_anytime ? "YES" : "NO"}</li>
        <li>Show Only Notifications: ${opt_in_email_sms_push_show_only ? "YES" : "NO"}</li>
        <li>Email Only: ${opt_in_email_only ? "YES" : "NO"}</li>
        <li>Opt-Out: ${opt_out ? "YES" : "NO"}</li>
      </ul>

      <h3>Interest Tags</h3>
      <ul>
        <li>Artist Demo: ${interest_artist_demo ? "YES" : "NO"}</li>
        <li>Business Sponsorship: ${interest_business_sponsorship ? "YES" : "NO"}</li>
      </ul>
    `
  });

  res.json({ success: true });

});

export default router;