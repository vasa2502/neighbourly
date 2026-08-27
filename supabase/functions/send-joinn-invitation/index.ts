import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailData {
  to: string;
  communityName: string;
  inviterName: string;
  inviteLink: string;
  type: "community_invite" | "referral_invite" | "verification_approved" | "verification_rejected";
}

function buildEmailHtml(data: InvitationEmailData): string {
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8faf9; }
    .container { max-width: 560px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, hsl(155,45%,32%), hsl(155,45%,28%)); padding: 40px 32px; text-align: center; }
    .header h1 { color: white; font-size: 24px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0; }
    .content { padding: 32px; }
    .content h2 { font-size: 18px; color: #1a3d2a; margin: 0 0 16px; }
    .content p { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px; }
    .cta { display: inline-block; background: hsl(155,45%,32%); color: white; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 24px; }
    .footer { padding: 24px 32px; border-top: 1px solid #eee; text-align: center; }
    .footer p { font-size: 12px; color: #999; margin: 0; }
  `;

  let body = "";

  switch (data.type) {
    case "community_invite":
      body = `
        <h2>You're invited to join ${data.communityName}</h2>
        <p><strong>${data.inviterName}</strong> has invited you to join their community on JOINN — a private platform for verified residents.</p>
        <p>You'll be able to discover activities, join clubs, connect with neighbors, and be part of a real local community.</p>
        <a href="${data.inviteLink}" class="cta">Join ${data.communityName}</a>
        <p style="font-size:12px;color:#999;">This link is valid for 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
      `;
      break;
    case "referral_invite":
      body = `
        <h2>${data.inviterName} thinks you'd love JOINN</h2>
        <p>JOINN is a private community platform built around where you live. It helps you discover activities, join clubs, and connect with verified neighbors.</p>
        <p>Use ${data.inviterName}'s referral link to get started:</p>
        <a href="${data.inviteLink}" class="cta">Try JOINN Free</a>
        <p style="font-size:12px;color:#999;">When you verify your residence, ${data.inviterName} earns a referral credit.</p>
      `;
      break;
    case "verification_approved":
      body = `
        <h2>Your verification has been approved ✅</h2>
        <p>Great news! Your residency verification for <strong>${data.communityName}</strong> has been approved.</p>
        <p>You now have full access to your community on JOINN — activities, clubs, posts, messaging, and more.</p>
        <a href="${data.inviteLink}" class="cta">Enter Your Community</a>
      `;
      break;
    case "verification_rejected":
      body = `
        <h2>Verification update</h2>
        <p>Your residency verification for <strong>${data.communityName}</strong> was not approved.</p>
        <p>This could be because the documentation provided was unclear or didn't match our verification requirements.</p>
        <p>You can resubmit your verification at any time from your profile settings.</p>
        <a href="${data.inviteLink}" class="cta">Try Again</a>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>JOINN</h1>
          <p>Your Community Platform</p>
        </div>
        <div class="content">
          ${body}
        </div>
        <div class="footer">
          <p>© 2026 JOINN. All rights reserved.</p>
          <p style="margin-top:8px;">Private community platform built around where you live.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, communityName, inviterName, inviteLink, type } = await req.json() as InvitationEmailData;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("EMAIL_FROM") || "JOINN <notifications@joinn.app>";

    if (!resendApiKey) {
      console.log("[JOINN] Email not configured. Logging invitation instead:", { to, type, communityName });
      // Store the email intent in the database even if email isn't configured
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("email_send_log").insert({
        recipient_email: to,
        template_name: type,
        status: "pending_config",
        metadata: { communityName, inviterName, inviteLink },
      });

      return new Response(
        JSON.stringify({ success: true, message: "Email queued (Resend not configured)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend API
    const html = buildEmailHtml({ to, communityName, inviterName, inviteLink, type });
    const subjectMap: Record<string, string> = {
      community_invite: `You're invited to join ${communityName} on JOINN`,
      referral_invite: `${inviterName} invited you to try JOINN`,
      verification_approved: `Your verification for ${communityName} has been approved`,
      verification_rejected: `Verification update for ${communityName}`,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subjectMap[type] || "JOINN Invitation",
        html,
      }),
    });

    const result = await response.json();

    // Log the email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("email_send_log").insert({
      recipient_email: to,
      template_name: type,
      status: result.id ? "sent" : "failed",
      message_id: result.id || null,
      error_message: result.error || null,
      metadata: { communityName, inviterName, inviteLink },
    });

    if (result.error) throw new Error(result.error);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
