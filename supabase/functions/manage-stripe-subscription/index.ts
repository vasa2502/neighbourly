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
    const { user_id, action } = await req.json();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find active subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!sub || !(sub as any).stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    if (action === "cancel") {
      // Cancel at period end (don't revoke immediately)
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${(sub as any).stripe_subscription_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ "cancel_at_period_end": "true" }).toString(),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);

      await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("id", (sub as any).id);
    } else if (action === "reactivate") {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${(sub as any).stripe_subscription_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ "cancel_at_period_end": "false" }).toString(),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);

      await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: false })
        .eq("id", (sub as any).id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
