import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useConvexData";
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

function detectRegion(): string {
  const lang = navigator.language || "en-US";
  if (lang.startsWith("en-IN")) return "IN";
  if (lang.startsWith("en-GB")) return "GB";
  if (lang.startsWith("de") || lang.startsWith("fr") || lang.startsWith("es") || lang.startsWith("it") || lang.startsWith("nl") || lang.startsWith("pt")) return "EU";
  return "US";
}

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
 * Checkout session — requires Stripe Edge Functions to be deployed.
 * Returns a stub that shows a setup message if Stripe is not configured.
 */
export function useCreateCheckoutSession() {
  const { user } = useAuth();
  const isStripeConfigured = !!STRIPE_PUBLISHABLE_KEY;

  return {
    mutate: ({ priceId, tier }: { priceId: string; tier: string }) => {
      if (!user) {
        toast.error("Please sign in first");
        return;
      }
      if (!isStripeConfigured) {
        toast.info("Stripe is not yet configured. Contact the administrator to set up billing.");
        return;
      }
      // When Stripe is configured, this would redirect to a checkout URL
      toast.info("Stripe checkout is not yet connected. Please configure the Stripe integration.");
    },
    mutateAsync: async ({ priceId, tier }: { priceId: string; tier: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (!isStripeConfigured) throw new Error("Stripe is not configured");
      throw new Error("Stripe Edge Functions not deployed yet");
    },
    isPending: false,
  };
}

/**
 * Returns the current user's subscription from Convex.
 */
export function useStripeSubscription() {
  const { data: subscription, isLoading } = useSubscription();
  return { data: subscription, isLoading };
}

/**
 * Manages subscription lifecycle — requires Stripe Edge Functions.
 */
export function useManageSubscription() {
  return {
    mutate: ({ action }: { action: "cancel" | "reactivate" }) => {
      toast.info("Subscription management requires Stripe integration. Contact the administrator.");
    },
    mutateAsync: async ({ action }: { action: "cancel" | "reactivate" }) => {
      throw new Error("Stripe integration not deployed yet");
    },
    isPending: false,
  };
}

/**
 * Creates a billing portal session — requires Stripe Edge Functions.
 */
export function useBillingPortal() {
  return {
    mutate: () => {
      toast.info("Billing portal requires Stripe integration. Contact the administrator.");
    },
    mutateAsync: async () => {
      throw new Error("Stripe integration not deployed yet");
    },
    isPending: false,
  };
}

export { STRIPE_PRICES, STRIPE_PUBLISHABLE_KEY, detectRegion };
