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
    const { price_id, user_id, tier, success_url, cancel_url } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Get or create Stripe customer
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing subscription with stripe_customer_id
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(user_id);
      const email = userData?.user?.email;

      if (!email) throw new Error("User email not found");

      // Create Stripe customer
      const customerRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email,
          metadata: JSON.stringify({ user_id }),
        }).toString(),
      });

      const customer = await customerRes.json();
      if (customer.error) throw new Error(customer.error.message);
      customerId = customer.id;

      // Store customer ID
      await supabase.from("subscriptions").upsert({
        user_id,
        stripe_customer_id: customerId,
        plan_type: "free",
        status: "inactive",
      });
    }

    // Create checkout session
    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId!,
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        success_url: success_url || `${req.headers.get("origin")}/dashboard/subscription?success=true`,
        cancel_url: cancel_url || `${req.headers.get("origin")}/dashboard/subscription?canceled=true`,
        "metadata[user_id]": user_id,
        "metadata[tier]": tier || "resident_plus",
      }).toString(),
    });

    const session = await sessionRes.json();
    if (session.error) throw new Error(session.error.message);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
