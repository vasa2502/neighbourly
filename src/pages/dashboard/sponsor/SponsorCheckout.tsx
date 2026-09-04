import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/sponsor/SponsorCard";
import { useSponsorPlacements, useSponsorProfile, useUpsertSponsorProfile, useCreateSponsorship, usePlacementAvailability, useFetchWebsiteMetadata, useSeedPlacements } from "@/hooks/useConvexData";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Loader2, Upload, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Step = "placement" | "info" | "preview" | "payment";

export default function SponsorCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPlacementSlug = searchParams.get("placementId");

  const { data: dbPlacements = [], isLoading: placementsLoading } = useSponsorPlacements();
  const { data: existingProfile } = useSponsorProfile();
  const upsertProfile = useUpsertSponsorProfile();
  const createSponsorship = useCreateSponsorship();
  const seedPlacements = useSeedPlacements();

  // Auto-seed placements if none exist yet
  useEffect(() => {
    if (dbPlacements.length === 0 && !placementsLoading) {
      seedPlacements.mutate({});
    }
  }, [dbPlacements.length, placementsLoading, seedPlacements]);

  // Fallback placements when DB is empty or Convex is not connected
  const fallbackPlacements = [
    { _id: "fallback_left_rail", slug: "app_left_rail", name: "Left Rail", description: "Premium placement in the left sidebar — visible to all users on desktop", position: "left_rail", price: 29900, durationDays: 30, maxSlots: 5, active: true, createdAt: Date.now() },
    { _id: "fallback_right_rail", slug: "app_right_rail", name: "Right Rail", description: "Premium placement in the right sidebar — visible to all users on desktop", position: "right_rail", price: 29900, durationDays: 30, maxSlots: 5, active: true, createdAt: Date.now() },
  ];
  const placements = dbPlacements.length > 0 ? dbPlacements : fallbackPlacements;

  const [step, setStep] = useState<Step>(preselectedPlacementSlug ? "info" : "placement");
  const [selectedPlacementId, setSelectedPlacementId] = useState("");

  // Resolve slug to real _id once placements load
  useEffect(() => {
    if (preselectedPlacementSlug && placements.length > 0 && !selectedPlacementId) {
      const match = placements.find((p: any) => p.slug === preselectedPlacementSlug);
      if (match) {
        setSelectedPlacementId(match._id);
      }
    }
  }, [preselectedPlacementSlug, placements, selectedPlacementId]);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaUrl, setCtaUrl] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from existing profile
  useEffect(() => {
    if (existingProfile) {
      setCompanyName((existingProfile as any).companyName || "");
      setContactEmail((existingProfile as any).contactEmail || "");
      setWebsiteUrl((existingProfile as any).websiteUrl || "");
      setLogoPreview((existingProfile as any).logoUrl || "");
    }
  }, [existingProfile]);

  const selectedPlacement = placements.find((p: any) => p._id === selectedPlacementId);

  const fetchMetadata = useFetchWebsiteMetadata();

  const handleFetchMetadata = async () => {
    if (!websiteUrl.trim()) { toast.error("Enter a website URL first"); return; }
    setIsFetchingMeta(true);
    try {
      const result = await fetchMetadata.mutateAsync({ url: websiteUrl });
      if ((result as any).error) {
        toast.error((result as any).error);
        return;
      }
      const meta = result as any;
      if (meta.title && !companyName) setCompanyName(meta.title);
      if (meta.description && !description) setDescription(meta.description.slice(0, 200));
      if (meta.image && !logoPreview) setLogoPreview(meta.image);
      if (meta.url && !ctaUrl) setCtaUrl(meta.url);
      toast.success("Website info fetched!");
    } catch {
      toast.error("Failed to fetch website info");
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (step === "placement") {
      if (!selectedPlacementId) {
        toast.error("Please select a placement");
        return;
      }
      setStep("info");
    } else if (step === "info") {
      if (!companyName.trim()) { toast.error("Company name is required"); return; }
      if (!contactEmail.trim()) { toast.error("Contact email is required"); return; }
      if (!description.trim()) { toast.error("Description is required"); return; }
      if (!ctaText.trim()) { toast.error("CTA text is required"); return; }
      if (!ctaUrl.trim()) { toast.error("CTA URL is required"); return; }
      try { new URL(ctaUrl); } catch { toast.error("Please enter a valid URL"); return; }
      setStep("preview");
    } else if (step === "preview") {
      setStep("payment");
    }
  };

  const handleSubmitPayment = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    setIsSubmitting(true);
    try {
      // Save sponsor profile
      await upsertProfile.mutateAsync({
        userId: user.id,
        companyName,
        contactEmail,
        websiteUrl: websiteUrl || undefined,
        logoUrl: logoPreview || undefined,
      });

      // If using fallback placements, seed real ones first and resolve the real ID
      let realPlacementId = selectedPlacementId;
      if (selectedPlacementId.startsWith("fallback_")) {
        await seedPlacements.mutateAsync({});
        const selectedFallback = placements.find((p: any) => p._id === selectedPlacementId);
        if (selectedFallback) {
          const realPlacement = dbPlacements.find((p: any) => p.slug === (selectedFallback as any).slug);
          if (realPlacement) realPlacementId = realPlacement._id;
        }
      }

      // Create sponsorship
      const sponsorshipId = await createSponsorship.mutateAsync({
        userId: user.id,
        placementId: realPlacementId,
        companyName,
        headline: headline || undefined,
        description,
        ctaText,
        ctaUrl,
        logoUrl: logoPreview || undefined,
        websiteUrl: websiteUrl || undefined,
        discountCode: discountCode || undefined,
        promoMessage: promoMessage || undefined,
        autoRenew,
        category: category || undefined,
      });

      // Try Stripe Checkout if available
      try {
        const createCheckoutSession = useAction((api as any).sponsorPayments?.createCheckoutSession);
        if (createCheckoutSession) {
          const { url } = await createCheckoutSession({
            sponsorshipId,
            userId: user.id,
          });
          if (url) {
            window.location.href = url;
            return;
          }
        }
      } catch {
        // Stripe not configured — fall through to direct navigation
      }

      // Fallback: Stripe not configured, navigate to dashboard
      toast.success("Sponsorship submitted! Payment will be available once Stripe is configured.");
      navigate(`/dashboard/sponsor/dashboard`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create sponsorship");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sponsorCategories = [
    { value: "education", label: "Education & Courses" },
    { value: "realestate", label: "Real Estate & Property" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "food", label: "Food & Restaurants" },
    { value: "services", label: "Home Services" },
    { value: "finance", label: "Finance & Insurance" },
    { value: "retail", label: "Retail & Shopping" },
    { value: "kids", label: "Kids & Family" },
    { value: "tech", label: "Technology" },
    { value: "other", label: "Other" },
  ];

  const previewSponsorship = {
    _id: "preview",
    companyName: companyName || "Your Company",
    headline: headline || undefined,
    description: description || "Your description will appear here.",
    ctaText: ctaText || "Learn More",
    ctaUrl: ctaUrl || "#",
    logoUrl: logoPreview || undefined,
    discountCode: discountCode || undefined,
    promoMessage: promoMessage || undefined,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6">
          Sponsor Your Business
        </h1>
      </Reveal>

      {/* Progress steps */}
      <Reveal delay={0.1}>
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(["placement", "info", "preview", "payment"] as Step[]).map((s, i) => {
            const stepIdx = ["placement", "info", "preview", "payment"].indexOf(step);
            const currentIdx = ["placement", "info", "preview", "payment"].indexOf(s);
            const isCurrent = s === step;
            const isDone = currentIdx < stepIdx;
            return (
              <div key={s} className="flex items-center gap-2 shrink-0">
                {i > 0 && <div className={`w-6 h-px ${isDone || isCurrent ? "bg-[hsl(155,45%,32%)]" : "bg-border"}`} />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isCurrent ? "bg-[hsl(155,45%,32%)] text-white" : isDone ? "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                  <span className="hidden sm:inline capitalize">{s}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Step: Choose Placement */}
      {step === "placement" && (
        <Reveal delay={0.15}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-6">
              <h2 className="font-bold text-foreground text-lg mb-1">Choose your placement</h2>
              <p className="text-sm text-muted-foreground mb-6">Select where your sponsorship will appear.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {placements.map((p: any) => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedPlacementId(p._id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPlacementId === p._id
                        ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,97%)]"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <p className="font-bold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                    <p className="text-lg font-bold text-[hsl(155,45%,32%)] mt-2">${(p.price / 100).toFixed(0)} / {p.durationDays} days</p>
                  </button>
                ))}
              </div>
              {selectedPlacementId && <PlacementAvailabilityCheck placementId={selectedPlacementId} />}
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Step: Business Info */}
      {step === "info" && (
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-border/40 rounded-2xl">
                <CardContent className="p-6 space-y-5">
                  <h2 className="font-bold text-foreground text-lg mb-1">Your business information</h2>
                  <p className="text-sm text-muted-foreground">This information will be used to create your sponsorship card.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">Company Name *</Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Education" className="rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Contact Email *</Label>
                      <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@company.com" className="rounded-xl mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Website URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" className="rounded-xl flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl shrink-0 gap-1.5"
                        onClick={handleFetchMetadata}
                        disabled={isFetchingMeta || !websiteUrl.trim()}
                      >
                        {isFetchingMeta ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span className="text-xs">Fetch</span>
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Click Fetch to auto-fill from your website.</p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]/20 focus:border-[hsl(155,45%,32%)]"
                    >
                      <option value="">Select a category...</option>
                      {sponsorCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">Helps match your sponsorship to relevant audiences.</p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Logo</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <label className="flex items-center gap-2 px-3 py-2 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors text-xs">
                        <Upload className="w-3.5 h-3.5" /> Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoInput} />
                      </label>
                      {logoPreview && (
                        <img src={logoPreview} alt="Logo preview" className="w-10 h-10 rounded-lg object-cover border border-border/30" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Max 2MB. JPG, PNG, or SVG.</p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Headline (optional)</Label>
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Admissions open for 2026" className="rounded-xl mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Description *</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people about your product or service..." className="rounded-xl mt-1 min-h-[80px]" maxLength={200} />
                    <p className="text-[10px] text-muted-foreground mt-1">{description.length}/200 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">Button Text *</Label>
                      <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Learn More" className="rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Button URL *</Label>
                      <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://yourcompany.com" className="rounded-xl mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Discount Code (optional)</Label>
                    <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="SPONSOR20" className="rounded-xl mt-1" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Promo Message (optional)</Label>
                    <Input value={promoMessage} onChange={(e) => setPromoMessage(e.target.value)} placeholder="Get 20% off with code SPONSOR20" className="rounded-xl mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live preview */}
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Live Preview</p>
                <SponsorCard sponsorship={previewSponsorship} variant="rail" />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <Reveal delay={0.15}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                <h2 className="font-bold text-foreground text-lg">Preview your sponsorship</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">This is exactly what your ad will look like.</p>

              <div className="max-w-sm mx-auto">
                <SponsorCard sponsorship={previewSponsorship} variant="rail" />
              </div>

              <div className="mt-6 p-4 bg-[hsl(155,30%,97%)] rounded-xl">
                <h3 className="font-semibold text-foreground text-sm mb-2">Sponsorship Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Placement:</span> <span className="font-medium">{selectedPlacement?.name || "—"}</span></div>
                  <div><span className="text-muted-foreground">Price:</span> <span className="font-medium">${((selectedPlacement?.price || 29900) / 100).toFixed(0)} / 30 days</span></div>
                  <div><span className="text-muted-foreground">Auto-renew:</span> <span className="font-medium">{autoRenew ? "Yes" : "No"}</span></div>
                  <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{companyName}</span></div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="autoRenew" className="text-xs text-muted-foreground">
                  I understand this sponsorship auto-renews every 30 days at $299 unless I cancel.
                </label>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <Reveal delay={0.15}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[hsl(155,45%,32%)]" />
              </div>
              <h2 className="font-bold text-foreground text-xl mb-2">Ready to submit</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Your sponsorship will be submitted for review after payment. Our team will review it within 24 hours.
              </p>

              <div className="max-w-sm mx-auto bg-muted/30 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Featured Sponsorship (30 days)</span>
                  <span className="font-bold">${((selectedPlacement?.price || 29900) / 100).toFixed(0)}</span>
                </div>
                {autoRenew && (
                  <p className="text-[10px] text-muted-foreground">
                    Auto-renews at $299 every 30 days. Cancel anytime.
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full font-semibold px-8 h-11"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  <>Pay ${((selectedPlacement?.price || 29900) / 100).toFixed(0)} & Submit</>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground mt-3">
                Payment is processed securely via Stripe. You will receive a confirmation email.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Navigation buttons */}
      {step !== "payment" && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(step === "info" ? "placement" : step === "preview" ? "info" : "info")} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={handleNext} className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full font-semibold">
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PlacementAvailabilityCheck({ placementId }: { placementId: string }) {
  const { data } = usePlacementAvailability(placementId);
  if (!data) return null;

  return (
    <div className="mt-4 p-3 bg-[hsl(155,30%,97%)] rounded-xl">
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{data.available}</span> of {data.total} slots available
      </p>
      {data.available === 0 && data.nextAvailable && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Next available: {new Date(data.nextAvailable).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
