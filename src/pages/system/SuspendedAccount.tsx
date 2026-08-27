import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Ban, Mail } from "lucide-react";

export default function SuspendedAccount() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Reveal>
          <Logo size="lg" className="justify-center mb-8" />
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6"><Ban className="w-8 h-8 text-destructive" /></div>
          <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Account suspended</h1>
          <p className="text-muted-foreground text-sm mb-6">Your account has been suspended. Please contact support for more information.</p>
          <Card className="border-border/40 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-muted-foreground" /><div><p className="text-sm font-semibold text-foreground">Contact Support</p><p className="text-xs text-muted-foreground">support@joinn.app</p></div></div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
