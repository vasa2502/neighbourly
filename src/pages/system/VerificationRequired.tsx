import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, ArrowRight } from "lucide-react";

export default function VerificationRequired() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-[hsl(38,50%,92%)] flex items-center justify-center mx-auto mb-6"><Shield className="w-8 h-8 text-[hsl(38,65%,42%)]" /></div>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Verification required</h1>
          <p className="text-muted-foreground text-sm mb-8">This feature requires verified residency. Please complete your verification to continue.</p>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild><Link to="/onboarding/verification">Complete Verification <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </Reveal>
      </div>
    </div>
  );
}
