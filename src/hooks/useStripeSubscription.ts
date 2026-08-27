import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Price IDs — these would come from your Stripe dashboard
// After setting up Stripe, replace these with your actual price IDs
const STRIPE_PRICES = {
  resident_plus_monthly: import.meta.env.VITE_STRIPE_PRICE_RESIDENT_PLUS_MONTHLY ?? "",
  resident_plus_annual: import.meta.env.VITE_STRIPE_PRICE_RESIDENT_PLUS_ANNUAL ?? "",
  host_pro_monthly: import.meta.env.VITE_STRIPE_PRICE_HOST_PRO_MONTHLY ?? "",
  community_partner_monthly: import.meta.env.VITE_STRIPE_PRICE_COMMUNITY_PARTNER_MONTHLY ?? "",
};

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

/**
 * Detects the user's region from browser language for currency display.
 */
function detectRegion(): string {
  const lang = navigator.language || "en-US";
  if (lang.startsWith("en-IN")) return "IN";
  if (lang.startsWith("en-GB")) return "GB";
  if (lang.startsWith("de") || lang.startsWith("fr") || lang.startsWith("es") || lang.startsWith("it") || lang.startsWith("nl") || lang.startsWith("pt")) return "EU";
  return "US";
}

/**
 * Formats USD price to local currency at checkout time.
 */
export function formatLocalPrice(usdAmount: number, region?: string): string {
  const r = region || detectRegion();
  const rates: Record<string, { symbol: string; rate: number }> = {
    IN: { symbol: "₹", rate: 83.5 },
    GB: { symbol: "£", rate: 0.79 },
    EU: { symbol: "€", rate: 0.92 },
    US: { symbol: "$", rate: 1 },
  };
  const { symbol, rate } = rates[r] || rates.US;
  return `${symbol}${(usdAmount * rate).toFixed(2)}`;
}

/**
 * Creates a Stripe Checkout session via Supabase Edge Function.
 * Falls back to showing a setup message if Stripe isn't configured.
 */
export function useCreateCheckoutSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceId, tier }: { priceId: string; tier: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: {
          price_id: priceId,
          user_id: user.id,
          tier,
          success_url: `${window.location.origin}/dashboard/subscription?success=true`,
          cancel_url: `${window.location.origin}/dashboard/subscription?canceled=true`,
        },
      });

      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not start checkout. Please ensure Stripe is configured.");
    },
  });
}

/**
 * Manages the current user's subscription status.
 */
export function useStripeSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stripeSubscription", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data as any;
    },
    enabled: !!user,
  });
}

/**
 * Manages subscription lifecycle (cancel, update billing cycle).
 */
export function useManageSubscription() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ action }: { action: "cancel" | "reactivate" }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("manage-stripe-subscription", {
        body: { user_id: user.id, action },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stripeSubscription"] });
      qc.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to manage subscription");
    },
  });
}

/**
 * Creates a billing portal session for managing payment methods and invoices.
 */
export function useBillingPortal() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("create-stripe-portal", {
        body: {
          user_id: user.id,
          return_url: `${window.location.origin}/dashboard/subscription`,
        },
      });

      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not open billing portal");
    },
  });
}

export { STRIPE_PRICES, STRIPE_PUBLISHABLE_KEY, detectRegion };
