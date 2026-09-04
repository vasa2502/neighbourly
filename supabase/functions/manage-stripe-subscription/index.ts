import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, action } = await req.json(); // action: "cancel" | "reactivate"

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the active subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user_id)
      .eq("status", "active")
      .not("stripe_subscription_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      throw new Error("No active Stripe subscription found");
    }

    // Update subscription on Stripe
    const updateBody: Record<string, string> = {};
    if (action === "cancel") {
      updateBody["cancel_at_period_end"] = "true";
    } else if (action === "reactivate") {
      updateBody["cancel_at_period_end"] = "false";
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(updateBody).toString(),
      }
    );

    const stripeSub = await stripeRes.json();
    if (stripeSub.error) throw new Error(stripeSub.error.message);

    // Update local subscription record
    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", sub.stripe_subscription_id);

    return new Response(
      JSON.stringify({ success: true, cancel_at_period_end: stripeSub.cancel_at_period_end }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
