import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { XCircle, ArrowRight, ArrowLeft, Mail } from "lucide-react";

export default function VerificationRejected() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Verification unsuccessful</h1>
          <p className="text-muted-foreground text-sm mb-8">Your verification request was not approved. You may need to provide additional information.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-8 text-left">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Reason</p>
                <p className="text-xs text-muted-foreground">The provided information could not be verified. Please check your details and try again.</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">What to do</p>
                <p className="text-xs text-muted-foreground">Ensure your community name and residency details are correct. If you need help, contact your community admin.</p>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="space-y-3">
            <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
              <Link to="/onboarding/verification">Resubmit Verification <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link to="/dashboard/home"><ArrowLeft className="w-4 h-4 mr-2" /> Return Home</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
