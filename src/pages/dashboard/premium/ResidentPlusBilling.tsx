import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Crown, CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useMessagingData";

export default function ResidentPlusBilling() {
  const { data: subscription } = useSubscription();
  const isActive = subscription?.status === "active";
  const plan = subscription?.tier || "free";
  const renewalDate = subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "—";
  const since = subscription?.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : "—";

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6">Resident Plus Billing</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4"><Crown className="w-6 h-6 text-[hsl(45,65%,42%)]" /><h2 className="font-[Bricolage_Grotesque] font-bold text-foreground">Resident Plus</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"}`}>{isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plan</p><p className="text-lg font-bold text-foreground">{plan === "free" ? "Free" : plan}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Renewal</p><p className="text-lg font-bold text-foreground">{renewalDate}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Since</p><p className="text-lg font-bold text-foreground">{since}</p></div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3">Billing History</h2>
        <div className="space-y-2">
          {!isActive && <p className="text-muted-foreground text-sm text-center py-4">No billing history. Subscribe to Resident Plus to get started.</p>}
        </div>
      </Reveal>
    </div>
  );
}
