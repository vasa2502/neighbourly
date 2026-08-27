import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ShieldX, Home } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6"><ShieldX className="w-8 h-8 text-destructive" /></div>
          <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Access denied</h1>
          <p className="text-muted-foreground text-sm mb-8">You don&apos;t have permission to access this resource. This may be because it belongs to a different community or requires verified residency.</p>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild><Link to="/dashboard/home"><Home className="w-4 h-4 mr-2" /> Go Home</Link></Button>
        </Reveal>
      </div>
    </div>
  );
}
