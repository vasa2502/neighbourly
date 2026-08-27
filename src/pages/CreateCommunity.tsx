import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateCommunity, useSearchCommunities } from "@/hooks/useCommunityData";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Building2, Home, MapPin, CheckCircle2, Users, Shield, Loader2 } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

const communityTypes = [
  { id: "apartment", label: "Apartment / Condo", icon: Building2, desc: "Multi-story residential building" },
  { id: "gated", label: "Gated / Villa Community", icon: Home, desc: "Gated compound with villas or houses" },
  { id: "villa", label: "Villa Community", icon: Home, desc: "Independent villa community" },
  { id: "street", label: "Residential Street", icon: MapPin, desc: "A specific street or lane" },
  { id: "neighborhood", label: "Neighborhood", icon: MapPin, desc: "A defined residential area" },
];

const steps = ["Community Type", "Community Info", "Review & Create"];

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createCommunityMutation = useCreateCommunity();
  const [step, setStep] = useState(0);
  const [communityType, setCommunityType] = useState("");
  const [form, setForm] = useState({ name: "", area: "", city: "", state: "", country: "India", description: "", approximateResidents: "", buildings: "" });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [duplicate, setDuplicate] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const checkDuplicate = async () => {
    if (!form.name) return null;
    setSearching(true);
    try {
      const results = await import("@/lib/api").then(m => m.searchCommunities(form.name, { city: form.city }));
      const dup = results?.find((c: any) => c.name.toLowerCase() === form.name.toLowerCase() && c.city.toLowerCase() === form.city.toLowerCase());
      setDuplicate(dup || null);
      setSearching(false);
      return dup;
    } catch {
      setSearching(false);
      return null;
    }
  };

  const handleCreate = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth?returnTo=/create-community"); return; }
    const countryMap: Record<string, string> = { "India": "IN", "United States": "US", "United Kingdom": "GB" };
    try {
      const community = await createCommunityMutation.mutateAsync({
        name: form.name,
        type: communityType as any,
        area: form.area,
        coordinates: coordinates || undefined,
        city: form.city,
        state: form.state,
        country: countryMap[form.country] || "IN",
        description: form.description,
        approximateResidents: Number(form.approximateResidents) || undefined,
        buildings: form.buildings ? form.buildings.split(",").map(b => b.trim()) : [],
        founderId: user.id,
        verified: false,
        status: "active" as const,
        invitationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      } as any);
      // Also create founder membership
      const { joinCommunity } = await import("@/lib/api");
      await joinCommunity(user.id, community.id, "founder");
      toast.success("Community created! You are the Community Founder.");
      navigate(`/community/${community.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create community");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center h-16 px-6">
          <Link to="/find-community" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <div className="mx-auto"><Logo size="sm" /></div>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress */}
        <Reveal>
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${i <= step ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"}`}>{i < step ? "✓" : i + 1}</div>
                <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-border hidden sm:block" />}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Step 0: Community Type */}
        {step === 0 && (
          <Reveal delay={0.05}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(155,45%,92%)] flex items-center justify-center mx-auto mb-4"><Home className="w-8 h-8 text-[hsl(155,45%,32%)]" /></div>
              <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Bring Your Community to JOINN</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Start your community and invite neighbours. No property manager approval needed.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {communityTypes.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} type="button" onClick={() => setCommunityType(t.id)} className={`text-left p-5 rounded-2xl border-2 transition-all ${communityType === t.id ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"}`}>
                    <Icon className={`w-6 h-6 mb-3 ${communityType === t.id ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Step 1: Community Info */}
        {step === 1 && (
          <Reveal delay={0.05}>
            <h2 className="text-xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Tell us about your community</h2>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Community name *</label><Input placeholder="e.g. Green Valley Residency" value={form.name} onChange={e => update("name", e.target.value)} className="rounded-xl h-11" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Area / Locality *</label><AddressAutocomplete value={form.area} onChange={val => update("area", val)} onCoordinates={(lat, lng) => setCoordinates({ lat, lng })} onAddressSelect={r => { const a = r.address; if (a.city) update("city", a.city); if (a.state) update("state", a.state); if (a.country) update("country", a.country); }} placeholder="e.g. Whitefield, Bangalore" className="rounded-xl" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">City *</label><Input placeholder="e.g. Bangalore" value={form.city} onChange={e => update("city", e.target.value)} className="rounded-xl h-11" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">State / Region</label><Input placeholder="e.g. Karnataka" value={form.state} onChange={e => update("state", e.target.value)} className="rounded-xl h-11" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Country</label><Input value={form.country} onChange={e => update("country", e.target.value)} className="rounded-xl h-11" /></div>
                </div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Approximate residents</label><Input type="number" placeholder="e.g. 500" value={form.approximateResidents} onChange={e => update("approximateResidents", e.target.value)} className="rounded-xl h-11" /></div>
                {communityType === "apartment" && <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Buildings / Towers (comma-separated)</label><Input placeholder="e.g. Tower A, Tower B, Tower C" value={form.buildings} onChange={e => update("buildings", e.target.value)} className="rounded-xl h-11" /></div>}
                <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Description</label><textarea placeholder="Tell us about your community..." value={form.description} onChange={e => update("description", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" /></div>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <Reveal delay={0.05}>
            <h2 className="text-xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Review & Create</h2>
            {duplicate && (
              <Card className="border-[hsl(38,65%,42%)]/30 bg-[hsl(38,50%,92%)] shadow-sm rounded-2xl mb-6">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[hsl(38,65%,42%)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">This community may already exist on JOINN</p>
                      <p className="text-xs text-muted-foreground mt-1">We found <strong>{duplicate.name}</strong> in {duplicate.area}, {duplicate.city}. Consider joining the existing community instead.</p>
                      <Link to={`/community/${duplicate.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(155,45%,32%)] mt-2 hover:underline">View existing community <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground capitalize">{communityType}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name</span><span className="font-medium text-foreground">{form.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Location</span><span className="font-medium text-foreground">{form.area}, {form.city}</span></div>
                {form.state && <div className="flex justify-between text-sm"><span className="text-muted-foreground">State</span><span className="font-medium text-foreground">{form.state}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Country</span><span className="font-medium text-foreground">{form.country}</span></div>
                {form.approximateResidents && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Residents</span><span className="font-medium text-foreground">~{form.approximateResidents}</span></div>}
                {form.buildings && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Buildings</span><span className="font-medium text-foreground">{form.buildings.split(",").length} buildings</span></div>}
              </CardContent>
            </Card>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3"><Shield className="w-5 h-5 text-[hsl(155,45%,32%)]" /><p className="font-semibold text-sm text-foreground">Your role: Community Founder</p></div>
                <p className="text-xs text-muted-foreground leading-relaxed">As the founder, you can invite residents, create activities, and help grow your community. You can later invite an official community administrator to take over management.</p>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && <Button variant="outline" className="rounded-full h-12" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>}
          {step < 2 ? (
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" disabled={(step === 0 && !communityType) || (step === 1 && (!form.name || !form.area || !form.city))} onClick={() => { if (step === 1) checkDuplicate(); setStep(step + 1); }}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          ) : (
            <Button className="flex-1 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={handleCreate}>Create Community <ArrowRight className="w-4 h-4 ml-2" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}
