import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { CreditCard, ArrowRight, FileText, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useMessagingData";
import { useProfile } from "@/hooks/useCommunityData";

export default function CommunityBilling() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: profile } = useProfile();

  const credits = (profile as any)?.referral_credits || profile?.referralCredits || 0;
  const tier = subscription?.tier || "free";
  const billingCycle = subscription?.billing_cycle || null;
  const expiresAt = subscription?.expires_at || null;

  // All prices displayed in USD
  const p = { monthly: 6.99, annual: 69.9, currency: "USD", symbol: "$" };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Community Billing</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[hsl(155,45%,32%)]" />
              <h2 className="font-[Plus_Jakarta_Sans] font-bold text-foreground">
                {tier === "free" ? "Free Plan" : tier === "resident_plus" ? "Resident Plus" : tier === "host_pro" ? "Host Pro" : tier === "community_partner" ? "Community Partner" : tier}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tier === "free" ? "bg-muted text-muted-foreground" : "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]"
              }`}>
                {tier === "free" ? "Active" : "Active"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Monthly</p>
                <p className="text-xl font-bold text-foreground">{p.symbol}{p.monthly}/mo</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Annual</p>
                <p className="text-xl font-bold text-foreground">{p.symbol}{p.annual}/yr</p>
                <p className="text-[10px] text-[hsl(155,50%,38%)]">Save {Math.round((1 - p.annual / (p.monthly * 12)) * 100)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Credits</p>
                <p className="text-xl font-bold text-foreground">{p.symbol}{credits}</p>
                {credits > 0 && <p className="text-[10px] text-[hsl(155,50%,38%)]">From referrals</p>}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-1">
                  {tier === "free" ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[hsl(155,50%,38%)]" />}
                  {tier === "free" ? "Free" : "Active"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full text-sm">
              {tier === "free" ? "Upgrade Plan" : "Manage Plan"} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3">Pricing Plans</h2>
        <div className="space-y-2">
          {[
            { name: "Free", price: "0", period: "forever", features: ["Basic community access", "View activities & posts", "Community info"] },
            { name: "Resident+", price: `${p.symbol}${p.monthly}`, period: "/month", features: ["Create activities & clubs", "Direct messaging", "Priority support", "Community founder tools"] },
            { name: "Resident+ Annual", price: `${p.symbol}${p.annual}`, period: "/year", features: ["All Resident+ features", `Save ${Math.round((1 - p.annual / (p.monthly * 12)) * 100)}% vs monthly`, "Referral credit application"] },
          ].map((plan) => (
            <Card key={plan.name} className={`border-border/40 shadow-sm rounded-xl ${plan.name.includes("Annual") ? "border-[hsl(155,45%,32%)]" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.features.join(" · ")}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{plan.price}</span>
                  <span className="text-[10px] text-muted-foreground">{plan.period}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
