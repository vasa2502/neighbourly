import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Crown, CheckCircle2, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useMessagingData";
import { Link } from "react-router-dom";

const benefits = [
  "Priority activity booking",
  "Advanced profile features",
  "Enhanced privacy controls",
  "Priority support",
  "No ads",
  "Early access to new features",
];

export default function ResidentPlus() {
  const { data: subscription } = useSubscription();
  const isActive = subscription?.status === "active";
  const savings = Math.round((1 - 69.90 / (6.99 * 12)) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
      <Reveal>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(45,65%,42%)] to-[hsl(38,65%,42%)] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Resident Plus</h1>
          <p className="text-muted-foreground">Enhanced community experience</p>
          {isActive && <span className="inline-block mt-2 text-xs font-bold bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] px-3 py-1 rounded-full">Active Subscriber</span>}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="text-center mb-8">
          <span className="text-5xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground">$6.99</span>
          <span className="text-muted-foreground text-lg">/month</span>
          <p className="text-xs text-[hsl(155,50%,38%)] mt-1">Save {savings}% with annual billing ($69.90/year)</p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
          <CardContent className="p-6 space-y-3">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[hsl(155,50%,38%)] shrink-0" />
                <span className="text-sm text-foreground">{b}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="space-y-3">
          {isActive ? (
            <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-13 text-base" asChild>
              <Link to="/dashboard/premium/billing">Manage Subscription <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          ) : (
            <Button className="w-full bg-gradient-to-r from-[hsl(45,65%,42%)] to-[hsl(38,65%,42%)] text-white hover:opacity-90 font-semibold rounded-full h-13 text-base">Upgrade <ArrowRight className="w-4 h-4 ml-2" /></Button>
          )}
          {!isActive && <Button variant="ghost" className="w-full text-muted-foreground rounded-full h-12">Continue without Plus</Button>}
        </div>
      </Reveal>
    </div>
  );
}
