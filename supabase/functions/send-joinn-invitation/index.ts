import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, communityName, inviterName, inviteLink, type } = await req.json();

    if (!to || !inviteLink) {
      throw new Error("Missing required fields: to, inviteLink");
    }

    // Build email content based on type
    let subject = "";
    let body = "";

    switch (type) {
      case "community_invite":
        subject = `You're invited to join ${communityName} on JOINN`;
        body = `Hi! ${inviterName} is inviting you to join ${communityName} on JOINN — a private community platform for verified residents.\n\nJoin here: ${inviteLink}\n\nBest,\nThe JOINN Team`;
        break;
      case "referral_invite":
        subject = `${inviterName} invited you to JOINN`;
        body = `Hi! ${inviterName} wants you to join their residential community on JOINN.\n\nJOINN is a private platform where verified residents connect, discover activities, and build community.\n\nUse this link to join: ${inviteLink}\n\nBest,\nThe JOINN Team`;
        break;
      case "verification_approved":
        subject = `Your verification for ${communityName} has been approved!`;
        body = `Great news! Your residency verification for ${communityName} has been approved.\n\nYou now have full access to your community on JOINN.\n\nWelcome aboard!\nThe JOINN Team`;
        break;
      case "verification_rejected":
        subject = `Update on your ${communityName} verification`;
        body = `We wanted to let you know that your residency verification for ${communityName} requires additional information.\n\nPlease log in to JOINN to review and resubmit.\n\nBest,\nThe JOINN Team`;
        break;
      default:
        subject = `Invitation from JOINN`;
        body = `You've been invited to join a community on JOINN.\n\nJoin here: ${inviteLink}`;
    }

    // ─── Email Provider Integration Point ───
    // Currently logs the email. To send real emails, integrate one of:
    //
    // 1. Resend (recommended):
    //    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    //    await resend.emails.send({ from: "JOINN <noreply@joinn.app>", to, subject, text: body });
    //
    // 2. SendGrid:
    //    await fetch("https://api.sendgrid.com/v3/mail/send", { ... });
    //
    // 3. Supabase Auth hooks for verification emails only.
    //
    // Set the RESEND_API_KEY (or SENDGRID_API_KEY) in your Supabase project's Edge Function secrets.

    console.log(`[JOINN Email] To: ${to} | Subject: ${subject}`);
    console.log(`[JOINN Email] Body: ${body}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email queued (provider not yet configured)",
        queued: { to, subject, type },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
