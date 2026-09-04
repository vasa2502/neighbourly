import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { Building2, CheckCircle2, ArrowRight, ArrowLeft, Shield, BarChart3, Megaphone } from "lucide-react";
import { useSubscription } from "@/hooks/useMessagingData";
import { useNavigate } from "react-router-dom";

const features = [
  "Complete community management dashboard",
  "Resident verification system",
  "Announcements and official information",
  "Moderation tools and content review",
  "Community analytics and insights",
  "Community advertising revenue share",
  "Custom branding and community rules",
  "Dedicated priority support",
  "API access for integrations",
  "Custom integrations and webhooks",
];

export default function CommunityPartner() {
  const navigate = useNavigate();
  const { data: subscription } = useSubscription();
  const isActive = subscription?.status === "active" && subscription?.tier === "community_partner";

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[hsl(155,45%,32%)] hover:text-[hsl(155,50%,28%)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Community Partner</h1>
      </div>

      <Reveal>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(210,55%,42%)] to-[hsl(210,55%,32%)] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Community Partner</h2>
          <p className="text-muted-foreground">For property managers, RWAs, and community admins</p>
          {isActive && (
            <Badge className="mt-2 bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]">Active Subscription</Badge>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="text-center mb-8">
          <span className="text-5xl font-[Bricolage_Grotesque] font-extrabold text-foreground">$199</span>
          <span className="text-muted-foreground text-lg">/month per community</span>
          <p className="text-xs text-muted-foreground mt-1">Billed monthly. Cancel anytime.</p>
        </div>
      </Reveal>

      {/* Quick Stats */}
      <Reveal delay={0.12}>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: "Verification", desc: "Manage resident access" },
            { icon: BarChart3, label: "Analytics", desc: "Community insights" },
            { icon: Megaphone, label: "Advertising", desc: "Revenue from partners" },
          ].map((item) => (
            <Card key={item.label} className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-3 text-center">
                <item.icon className="w-5 h-5 text-[hsl(210,55%,42%)] mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
          <CardContent className="p-6 space-y-3">
            {features.map((b) => (
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
            <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-13 text-base">
              Manage Subscription
            </Button>
          ) : (
            <Button className="w-full bg-gradient-to-r from-[hsl(210,55%,42%)] to-[hsl(210,55%,32%)] text-white hover:opacity-90 font-semibold rounded-full h-13 text-base">
              Upgrade to Community Partner — $199/month
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {!isActive && (
            <Button variant="ghost" className="w-full text-muted-foreground rounded-full h-12" onClick={() => navigate("/dashboard/subscription")}>
              View all plans
            </Button>
          )}
        </div>
      </Reveal>
    </div>
  );
}
