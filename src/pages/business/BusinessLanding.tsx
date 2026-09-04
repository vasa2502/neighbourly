import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Megaphone, Users, BarChart3, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BusinessLanding() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/auth">Log in</Link></Button>
            <Button className="text-sm font-semibold bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)]" asChild><Link to="/auth?role=business">Sign Up</Link></Button>
          </div>
        </div>
      </header>

      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6 bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase">
              <Megaphone className="w-4 h-4" /> For Businesses
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.03em] leading-[1.02] mb-6">
              Reach verified residents<br />in specific communities.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Advertise directly to verified residents. Bid for community ad slots and run targeted campaigns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="text-base font-semibold px-8 h-13 bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)]" asChild><Link to="/auth?role=business">Start Advertising <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
              <Button size="lg" variant="outline" className="text-base font-medium px-8 h-13" asChild><Link to="/auth?role=business">Manage My Business</Link></Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Community-Specific Ads", description: "Target specific residential communities with relevant advertising." },
              { icon: Users, title: "Verified Audience", description: "Every resident is verified. No bots, no fake accounts." },
              { icon: BarChart3, title: "Campaign Analytics", description: "Track impressions, clicks, and leads in real-time." },
              { icon: Megaphone, title: "Ad Marketplace", description: "Bid for ad slots through an auction system." },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.1}>
                  <Card className="border-0 shadow-sm rounded-2xl h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-[hsl(38,50%,92%)] flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-[hsl(38,65%,42%)]" /></div>
                      <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
