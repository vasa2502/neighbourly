import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Clock, Shield, Mail, ArrowRight } from "lucide-react";

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-[hsl(38,50%,92%)] flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-[hsl(38,65%,42%)]" />
          </div>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Verification pending</h1>
          <p className="text-muted-foreground text-sm mb-8">Your request has been submitted. The community admin will review it shortly.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8 text-left">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-[hsl(38,65%,42%)]" /><div><p className="text-sm font-semibold text-foreground">Status: Under Review</p><p className="text-xs text-muted-foreground">Green Valley Residency</p></div></div>
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">Submitted: Today</p><p className="text-xs text-muted-foreground">Typically reviewed within 24 hours</p></div></div>
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">What's next?</p><p className="text-xs text-muted-foreground">You'll receive an email once verified</p></div></div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-xs text-muted-foreground mb-4">While waiting, you can explore limited community information.</p>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/home">Return Home <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
