import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GenericError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-8 h-8 text-muted-foreground" /></div>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm mb-8">We couldn&apos;t load this page. Please try again or return to the homepage.</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
            <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild><Link to="/dashboard/home"><Home className="w-4 h-4 mr-2" /> Go Home</Link></Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
