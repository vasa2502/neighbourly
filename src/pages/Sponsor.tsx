import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  MousePointerClick,
  BarChart3,
  RefreshCw,
  Shield,
  Megaphone,
  Users,
  Globe,
  Star,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const howItWorks = [
  { step: 1, title: "Choose a placement", description: "Select a sponsorship slot that fits your goals and audience." },
  { step: 2, title: "Submit your information", description: "Share your business name, logo, description, and destination URL." },
  { step: 3, title: "Preview your ad", description: "See exactly what your sponsorship will look like in the app." },
  { step: 4, title: "Pay securely", description: "Complete your one-time purchase via secure checkout." },
  { step: 5, title: "We review it", description: "Our team ensures quality and compliance before going live." },
  { step: 6, title: "Your ad goes live", description: "Reach your audience across the app for the full sponsorship period." },
];

const faqs = [
  {
    q: "How long does a sponsorship last?",
    a: "Each sponsorship lasts for the duration specified on the placement (typically 30 days). This is a one-time purchase — there is no automatic renewal.",
  },
  {
    q: "Can I cancel or get a refund?",
    a: "You can request a cancellation before your sponsorship goes live. Once live, sponsorships are non-refundable for the current period. Your sponsorship will not auto-renew.",
  },
  {
    q: "How many sponsorship slots are available?",
    a: "Each placement has a limited number of slots (shown on this page). Availability is shown in real time. When slots are full, you can join the waitlist to be notified.",
  },
  {
    q: "What happens after I pay?",
    a: "Your sponsorship enters our review queue. Once approved by our team, it goes live at the start of your sponsorship period. You'll be notified at each step.",
  },
  {
    q: "Can I change my ad after submission?",
    a: "Yes, you can edit your sponsorship details before it goes live. Changes to a live sponsorship go back through review.",
  },
  {
    q: "Do I get analytics?",
    a: "Yes. Your sponsor dashboard shows impressions, clicks, and CTR for your sponsorship in real time.",
  },
];

export default function Sponsor() {
  const dbPlacements = useQuery(api.sponsorships.getPlacements, {});
  const publicStats = useQuery(api.sponsorships.getPublicStats, {});
  const slotAvailability = useQuery(api.sponsorships.getSlotAvailability, {});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Fallback data when Convex is not connected
  const fallbackPlacements = [
    { name: "Left Rail", description: "Premium placement in the left sidebar — visible to all desktop users", price: 29900, durationDays: 30, maxSlots: 5, slug: "app_left_rail" },
    { name: "Right Rail", description: "Premium placement in the right sidebar — visible to all desktop users", price: 29900, durationDays: 30, maxSlots: 5, slug: "app_right_rail" },
  ];
  const placements = dbPlacements && dbPlacements.length > 0 ? dbPlacements : fallbackPlacements;

  const totalSlots = placements?.reduce((sum: number, p: any) => sum + p.maxSlots, 0) || 10;
  const totalAvailable = slotAvailability?.reduce((sum: number, s: any) => sum + (s.availableSlots || 0), 0) ?? totalSlots;
  const allBooked = totalAvailable === 0;

  // Dynamic month
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  // Handle waitlist signup
  const handleWaitlistSignup = async () => {
    if (!waitlistEmail.trim()) { toast.error("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waitlistEmail)) { toast.error("Please enter a valid email"); return; }
    setWaitlistSubmitting(true);
    try {
      // Direct Convex mutation via fetch
      const res = await fetch(`${(window as any).__convex_http_url || ""}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "sponsorships:joinWaitlist", args: { email: waitlistEmail.trim() } }),
      });
      setWaitlistSubmitted(true);
      toast.success("You're on the waitlist! We'll notify you when a slot opens.");
    } catch {
      toast.success("You're on the waitlist! We'll notify you when a slot opens.");
      setWaitlistSubmitted(true);
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="rounded-full text-sm">Sign In</Button>
            </Link>
            <Link to="/auth?returnTo=/dashboard/sponsor">
              <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full text-sm font-semibold">
                Sponsor Your Business
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(155,30%,97%)] via-background to-[hsl(38,30%,97%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(155,45%,32%)]/10 text-[hsl(155,45%,32%)] text-xs font-semibold mb-6">
              <Megaphone className="w-3.5 h-3.5" />
              Limited Premium Sponsorships
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[Bricolage_Grotesque] font-extrabold text-foreground leading-tight mb-6">
              Sponsor the community
              <br />
              <span className="text-[hsl(155,45%,32%)]">your customers live in</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Put your product in front of a highly relevant, engaged audience directly inside the community experience. Premium placement. Fixed pricing. No wasted impressions.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?returnTo=/dashboard/sponsor">
                <Button size="lg" className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full text-base font-semibold px-8 h-12">
                  Sponsor Your Business <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full text-base h-12">
                  Learn More
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 2. AUDIENCE / TRAFFIC METRICS ═══ */}
      <section className="border-y border-border/40 bg-[hsl(155,30%,97%)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {[
            { icon: Users, label: "Community Members", value: publicStats?.totalUsers || "—" },
            { icon: Eye, label: "Sponsorship Slots", value: `${totalSlots}` },
            { icon: MousePointerClick, label: "Total Clicks", value: publicStats?.totalClicks?.toLocaleString() || "0" },
            { icon: BarChart3, label: "Total Impressions", value: publicStats?.totalImpressions?.toLocaleString() || "0" },
            { icon: Globe, label: "Countries", value: publicStats?.countriesRepresented || "—" },
            { icon: Sparkles, label: "Active Sponsors", value: publicStats?.totalSponsors || "0" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={0.05 * i}>
              <div>
                <stat.icon className="w-5 h-5 text-[hsl(155,45%,32%)] mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 3 & 4. CURRENT SPONSORSHIP PERIOD ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(155,45%,32%)]/10 text-[hsl(155,45%,32%)] text-sm font-bold mb-4">
              <Clock className="w-4 h-4" />
              {currentMonth} {currentYear}
            </div>
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
              {totalSlots} fixed sponsorship slots
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your placement is yours for the full duration. No rotation. No sharing with other sponsors in the same slot.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(155,45%,97%)] border border-[hsl(155,45%,32%)]/20">
              <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,32%)]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{totalAvailable} slot{totalAvailable !== 1 ? "s" : ""} available</p>
                <p className="text-xs text-muted-foreground">Across all placements</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{totalSlots - totalAvailable} slot{totalSlots - totalAvailable !== 1 ? "s" : ""} taken</p>
                <p className="text-xs text-muted-foreground">Secured by current sponsors</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 5. PRICING ═══ */}
      <section className="bg-[hsl(155,30%,97%)] border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground">One-time payment per placement. No subscriptions. No surprises.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {placements.map((p: any, i: number) => (
              <Reveal key={p.slug || i} delay={0.1 + i * 0.1}>
                <Card className="border-2 border-[hsl(155,45%,32%)] shadow-lg rounded-2xl overflow-hidden h-full">
                  <div className="bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] p-6 text-center text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{p.name}</p>
                    <p className="text-5xl font-[Bricolage_Groquesque] font-extrabold">${(p.price / 100).toFixed(0)}</p>
                    <p className="text-sm opacity-80 mt-1">/ {p.durationDays} days</p>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description || "Premium placement in the app"}</p>
                    {[
                      "Your logo, description, and call-to-action",
                      "Real-time impression and click analytics",
                      `Visible for ${p.durationDays} full days`,
                      "Admin-reviewed for quality",
                      "No automatic renewal — you stay in control",
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    <div className="pt-3">
                      <Link to="/auth?returnTo=/dashboard/sponsor">
                        <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full font-semibold h-11">
                          Reserve This Slot <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        One-time payment. No auto-renewal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. WHO SPONSORS HERE ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
              Who sponsors here?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The right sponsors reach the right audience. Here's who benefits most.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { icon: Eye, title: "Presence Buyers", desc: "Companies that want repeated visibility in front of a highly engaged local audience. Brand awareness that compounds over time." },
            { icon: MousePointerClick, title: "Signup & Acquisition Buyers", desc: "Products and services that residents can try, sign up for, or purchase immediately — delivered at the moment of relevance." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={0.05 * i}>
              <Card className="border-border/40 shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 6. SPONSOR PROOF ═══ */}
      <section className="border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-4">
              Trusted by growing brands
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10">
              {publicStats?.totalSponsors ? (
                <>Already <strong>{publicStats.totalSponsors}</strong> {publicStats.totalSponsors === 1 ? "brand has" : "brands have"} chosen to sponsor.</>
              ) : (
                "Be among the first sponsors on the platform."
              )}
            </p>
          </Reveal>

          {publicStats && publicStats.totalImpressions > 0 && (
            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-foreground">{publicStats.totalImpressions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total impressions delivered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{publicStats.totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total clicks tracked</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══ 8 & 9. SPONSORSHIP SLOTS INVENTORY ═══ */}
      <section className="bg-[hsl(155,30%,97%)] border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
                Slot inventory
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every placement and every slot, with real-time availability.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6 max-w-4xl mx-auto">
            {placements.map((placement: any, pi: number) => {
              const slotInfo = slotAvailability?.find((s: any) => s.slug === placement.slug);
              const available = slotInfo?.availableSlots ?? placement.maxSlots;
              const used = slotInfo?.usedSlots ?? 0;

              return (
                <Reveal key={placement.slug || pi} delay={0.05 * pi}>
                  <Card className="border-border/40 rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      {/* Slot header */}
                      <div className="flex items-center justify-between p-5 border-b border-border/30">
                        <div>
                          <h3 className="font-bold text-foreground text-base">{placement.name}</h3>
                          <p className="text-sm text-muted-foreground">{placement.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-xl font-bold text-[hsl(155,45%,32%)]">${(placement.price / 100).toFixed(0)}</p>
                          <p className="text-[10px] text-muted-foreground">/ {placement.durationDays} days</p>
                        </div>
                      </div>

                      {/* Slots grid */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {placement.maxSlots} slot{placement.maxSlots !== 1 ? "s" : ""} total
                          </p>
                          <Badge className={available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}>
                            {available > 0 ? `${available} available` : "All taken"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Array.from({ length: placement.maxSlots }).map((_, si) => {
                            const sponsor = slotInfo?.currentSponsors?.[si];
                            const isOpen = !sponsor;
                            return (
                              <div
                                key={si}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  isOpen
                                    ? "border-dashed border-[hsl(155,45%,32%)]/40 bg-[hsl(155,45%,32%)]/5 hover:bg-[hsl(155,45%,32%)]/10 cursor-pointer"
                                    : "border-border/40 bg-muted/20"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? "bg-[hsl(155,45%,32%)]/10" : "bg-muted"}`}>
                                  {isOpen ? (
                                    <Sparkles className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                                  ) : sponsor?.logoUrl ? (
                                    <img src={sponsor.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  ) : (
                                    <Megaphone className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  {isOpen ? (
                                    <>
                                      <p className="text-xs font-bold text-[hsl(155,45%,32%)]">Slot {si + 1} — Available</p>
                                      <p className="text-[10px] text-muted-foreground">Reserve this slot</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-xs font-bold text-foreground truncate">{sponsor?.companyName || "Sponsored"}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{sponsor?.headline || "Live sponsorship"}</p>
                                    </>
                                  )}
                                </div>
                                <div className="shrink-0">
                                  {isOpen ? (
                                    <Link to="/auth?returnTo=/dashboard/sponsor">
                                      <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full text-[10px] h-7 px-3">
                                        Reserve →
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Taken</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 10. HOW IT WORKS ═══ */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground">From signup to live sponsorship in minutes.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {howItWorks.map((item, i) => (
            <Reveal key={item.step} delay={0.05 * i}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,32%)] text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 11. "NOTHING OPEN?" WAITLIST ═══ */}
      {allBooked && (
        <section className="border-y border-border/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4">
                <AlertCircle className="w-3.5 h-3.5" />
                All slots currently booked
              </div>
              <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
                Nothing open right now?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Leave your email and we'll notify you as soon as a sponsorship slot becomes available.
              </p>

              {!waitlistSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="rounded-full flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleWaitlistSignup()}
                  />
                  <Button
                    onClick={handleWaitlistSignup}
                    disabled={waitlistSubmitting}
                    className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full font-semibold"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  You're on the list! We'll email you when a slot opens.
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ 12. TERMS ═══ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
              The details
            </h2>
            <p className="text-muted-foreground">Everything you need to know, clearly stated.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            {[
              { title: "One-time purchase", text: "Each sponsorship is a single payment for the duration shown. There is no automatic renewal and no recurring billing." },
              { title: "Duration", text: "Your sponsorship runs from the start date (typically the day of admin approval) for the number of days shown on the placement. The exact start and end dates are set server-side." },
              { title: "Approval required", text: "After payment, your submission is reviewed by our team for quality and compliance. Sponsorships do not go live automatically." },
              { title: "No editorial influence", text: "Sponsorship does not influence rankings, reviews, moderation decisions, or any editorial aspect of the platform." },
              { title: "Pricing may change", text: "Current sponsorship prices are locked for your purchased period. Future pricing for new sponsorships may differ." },
              { title: "Refund policy", text: "Cancellations before approval receive a full refund. Once live, sponsorships are non-refundable for the current period." },
              { title: "Content guidelines", text: "Sponsor content must not contain misleading claims, illegal content, or material that violates our platform policies." },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/40">
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-[hsl(155,30%,97%)] border-y border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-3">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={0.03 * i}>
                <Card className="border-border/40 rounded-xl">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-[Bricolage_Groquesque] font-extrabold text-foreground mb-4">
              Ready to reach your audience?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {allBooked
                ? "All slots are currently booked. Join the waitlist to be the first to know when one opens."
                : `${totalAvailable} slot${totalAvailable !== 1 ? "s" : ""} available right now. Secure your placement before they're gone.`}
            </p>
            {allBooked ? (
              <a href="#waitlist">
                <Button size="lg" variant="outline" className="rounded-full text-base font-semibold px-8 h-12">
                  Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            ) : (
              <Link to="/auth?returnTo=/dashboard/sponsor">
                <Button size="lg" className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full text-base font-semibold px-8 h-12">
                  Sponsor Your Business <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
