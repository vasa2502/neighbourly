import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { price_id, user_id, tier, success_url, cancel_url } = await req.json();

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to your Supabase Edge Function secrets.");
    }

    // Get or create Stripe customer
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email, name")
      .eq("id", user_id)
      .single();

    if (!profile) throw new Error("User profile not found");

    // Create Stripe Checkout Session
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        customer_email: profile.email,
        success_url: success_url || `${req.headers.get("origin")}/dashboard/subscription?success=true`,
        cancel_url: cancel_url || `${req.headers.get("origin")}/dashboard/subscription?canceled=true`,
        metadata: JSON.stringify({ user_id, tier }),
      }).toString(),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error.message);
    }

    // Store subscription record in Supabase
    await supabase.from("subscriptions").upsert({
      user_id,
      stripe_session_id: session.id,
      tier,
      status: "pending",
      billing_cycle: price_id.includes("annual") ? "annual" : "monthly",
    }, { onConflict: "user_id,tier" });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
