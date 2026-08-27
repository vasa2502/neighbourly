import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Compass } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useCommunityData";

export default function OnboardingComplete() {
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    updateProfile.mutateAsync({ onboardingCompleted: true } as any).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, damping: 12 }} className="inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center shadow-xl shadow-[hsl(155,45%,32%)]/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-3">
            You're ready to explore.
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-sm mx-auto">
            Your profile is set up and you're connected to your community. Time to discover what's happening.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="space-y-3">
            <Button size="lg" className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-13 text-base" asChild>
              <Link to="/dashboard/home">Enter My Community <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-full h-13 text-base" asChild>
              <Link to="/dashboard/discover"><Compass className="w-4 h-4 mr-2" /> Discover Activities</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
