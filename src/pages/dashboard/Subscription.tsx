import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Check, Crown, Gift, Zap, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useMessagingData";
import { useReferrals } from "@/hooks/useMessagingData";

// ─── USD pricing (all marketing/display prices in USD) ───
const USD_PRICES = {
  resident_plus: { monthly: 6.99, annual: 69.90 },
  host_pro: { monthly: 9.99, annual: 0 },
  community_partner: { monthly: 199, annual: 0 },
};

// ─── Currency conversion rates (approximate, used only at checkout) ───
const CURRENCY_RATES: Record<string, { symbol: string; rate: number; locale: string }> = {
  US: { symbol: "$", rate: 1, locale: "en-US" },
  IN: { symbol: "₹", rate: 83.5, locale: "en-IN" },
  GB: { symbol: "£", rate: 0.79, locale: "en-GB" },
  EU: { symbol: "€", rate: 0.92, locale: "de-DE" },
};

function detectUserRegion(): string {
  try {
    const lang = navigator.language || "";
    if (lang.includes("IN")) return "IN";
    if (lang.includes("GB") || lang.includes("UK")) return "GB";
    if (lang.includes("de") || lang.includes("fr") || lang.includes("es") || lang.includes("it") || lang.includes("pt") || lang.includes("nl")) return "EU";
    return "US";
  } catch {
    return "US";
  }
}

function formatCurrency(usdAmount: number, region: string): string {
  const curr = CURRENCY_RATES[region] || CURRENCY_RATES.US;
  const converted = usdAmount * curr.rate;
  return `${curr.symbol}${converted.toFixed(2)}`;
}

const tierConfig = {
  resident_plus: {
    label: "Resident Plus",
    icon: Crown,
    description: "Your community membership — premium personal features",
    hasAnnual: true,
    features: [
      "Access to your private community",
      "Join and create activities",
      "Join and create clubs",
      "Community posts and conversations",
      "Resident directory access",
      "Direct messaging",
      "Community announcements",
      "Priority activity booking",
      "Advanced profile features",
      "Enhanced privacy controls",
      "Priority support",
      "No ads",
      "Referral credit rewards",
    ],
  },
  host_pro: {
    label: "Host Pro",
    icon: Zap,
    description: "Advanced tools for activity hosts and organizers",
    hasAnnual: false,
    features: [
      "Everything in Resident Plus",
      "Recurring activities",
      "Waitlists and co-hosts",
      "Activity analytics dashboard",
      "Advanced scheduling tools",
      "Host management dashboard",
      "Participant communication",
      "Event promotion tools",
    ],
  },
  community_partner: {
    label: "Community Partner",
    icon: Building2,
    description: "Complete community management for businesses & admins",
    hasAnnual: false,
    features: [
      "Complete community management",
      "Resident verification system",
      "Announcements and official info",
      "Moderation tools and analytics",
      "Community advertising revenue",
      "Custom branding and rules",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
  },
};

type TierKey = keyof typeof tierConfig;

export default function Subscription() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [selectedTier, setSelectedTier] = useState<TierKey>("resident_plus");
  const [userRegion, setUserRegion] = useState("US");

  const { data: subscription } = useSubscription();
  const { data: referrals = [] } = useReferrals();

  useEffect(() => {
    setUserRegion(detectUserRegion());
  }, []);

  const tier = tierConfig[selectedTier];
  const prices = USD_PRICES[selectedTier];

  // Calculate USD price
  const usdPrice = tier.hasAnnual && billing === "annual" ? prices.annual : prices.monthly;
  const usdMonthlyEquiv = tier.hasAnnual && billing === "annual" ? prices.annual / 12 : prices.monthly;
  const savings = tier.hasAnnual && billing === "annual"
    ? Math.round((1 - prices.annual / (prices.monthly * 12)) * 100)
    : 0;

  // Referral credits in USD
  const totalCreditsUSD = referrals
    .filter((r: any) => r.status === "verified" || r.status === "credited")
    .reduce((s: number, r: any) => s + (r.credit_amount || 0), 0);
  const finalUsdPrice = Math.max(0, usdPrice - (selectedTier === "resident_plus" ? totalCreditsUSD : 0));

  // Convert to local currency for checkout display
  const localPrice = formatCurrency(usdPrice, userRegion);
  const localFinalPrice = formatCurrency(finalUsdPrice, userRegion);
  const localMonthlyEquiv = formatCurrency(usdMonthlyEquiv, userRegion);
  const localCredits = formatCurrency(totalCreditsUSD, userRegion);

  const isActive = subscription?.status === "active";
  const TierIcon = tier.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 lg:pb-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[hsl(155,45%,32%)] hover:text-[hsl(155,50%,28%)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)]">JOINN Plans</h1>
      </div>

      {/* Tier Selector */}
      <Reveal>
        <Tabs value={selectedTier} onValueChange={(v) => setSelectedTier(v as TierKey)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resident_plus" className="text-xs sm:text-sm">
              <Crown className="w-4 h-4 mr-1 hidden sm:inline" />
              Resident Plus
            </TabsTrigger>
            <TabsTrigger value="host_pro" className="text-xs sm:text-sm">
              <Zap className="w-4 h-4 mr-1 hidden sm:inline" />
              Host Pro
            </TabsTrigger>
            <TabsTrigger value="community_partner" className="text-xs sm:text-sm">
              <Building2 className="w-4 h-4 mr-1 hidden sm:inline" />
              Community Partner
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Reveal>

      {/* Pricing Card */}
      <Reveal delay={0.1}>
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(155,45%,32%)] to-[hsl(155,45%,28%)] p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TierIcon className="w-5 h-5" />
              <span className="font-semibold">{tier.label}</span>
            </div>
            <p className="text-white/70 text-sm">{tier.description}</p>
          </div>
          <CardContent className="p-6">
            {/* Billing Toggle (only for tiers with annual option) */}
            {tier.hasAnnual && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    billing === "monthly" ? "bg-white shadow-sm text-[hsl(155,35%,18%)]" : "text-gray-500"
                  }`}
                  onClick={() => setBilling("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    billing === "annual" ? "bg-white shadow-sm text-[hsl(155,35%,18%)]" : "text-gray-500"
                  }`}
                  onClick={() => setBilling("annual")}
                >
                  Annual {savings > 0 && <Badge className="ml-1 bg-green-100 text-green-700 text-xs">Save {savings}%</Badge>}
                </button>
              </div>
            )}

            {/* USD Price Display */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[hsl(155,35%,18%)]">
                ${usdPrice.toFixed(2)}
                <span className="text-lg font-normal text-gray-400">
                  /{tier.hasAnnual && billing === "annual" ? "year" : "month"}
                </span>
              </div>
              {tier.hasAnnual && billing === "annual" && (
                <p className="text-sm text-[hsl(155,10%,45%)] mt-1">
                  ${usdMonthlyEquiv.toFixed(2)}/month equivalent
                </p>
              )}
            </div>

            {/* Referral Credits (Resident Plus only) */}
            {selectedTier === "resident_plus" && totalCreditsUSD > 0 && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Referral Credits Applied</span>
                  </div>
                  <span className="font-bold text-green-700">-${totalCreditsUSD.toFixed(2)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200 flex items-center justify-between">
                  <span className="text-sm text-green-700">Amount due today</span>
                  <span className="text-xl font-bold text-green-800">${finalUsdPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3 mb-6">
              <p className="font-semibold text-[hsl(155,35%,18%)]">What's included:</p>
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[hsl(155,45%,95%)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[hsl(155,45%,32%)]" />
                  </div>
                  <span className="text-sm text-[hsl(155,10%,45%)]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Subscribe Button — shows local currency at checkout */}
            <Button className="w-full h-12 bg-[hsl(155,45%,32%)] hover:bg-[hsl(155,50%,28%)] text-white text-base">
              {selectedTier === "resident_plus"
                ? `Subscribe — ${localFinalPrice}/${billing === "annual" ? "year" : "month"}`
                : `Subscribe — ${localPrice}/month`
              }
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">
              {selectedTier === "resident_plus" && totalCreditsUSD > 0 && (
                <>Prices shown in your local currency. USD ${usdPrice.toFixed(2)} {tier.hasAnnual && billing === "annual" ? `/year` : `/month`} base price. </>
              )}
              Cancel anytime. {tier.hasAnnual ? `Billed ${billing === "monthly" ? "monthly" : "annually"}.` : "Billed monthly."}
            </p>
          </CardContent>
        </Card>
      </Reveal>

      {/* Current Subscription Status */}
      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-[hsl(155,10%,45%)]">Status</span>
              <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {subscription ? (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-[hsl(155,10%,45%)]">Plan</span>
                  <span className="font-medium text-[hsl(155,35%,18%)]">
                    {subscription.plan_type === "annual" ? "Annual" : subscription.plan_type === "monthly" ? "Monthly" : subscription.plan_type}
                  </span>
                </div>
                {subscription.current_period_end && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[hsl(155,10%,45%)]">Renewal Date</span>
                    <span className="font-medium text-[hsl(155,35%,18%)]">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[hsl(155,10%,45%)] py-2">You don't have an active subscription yet.</p>
            )}
            <div className="flex justify-between py-2">
              <span className="text-[hsl(155,10%,45%)]">Referral Credit Balance</span>
              <span className="font-medium text-green-600">${totalCreditsUSD.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
