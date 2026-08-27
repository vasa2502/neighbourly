import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { useSearchCommunities } from "@/hooks/useCommunityData";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Users,
  Building2,
  ArrowRight,
  ArrowLeft,
  Home,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  apartment: "from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)]",
  gated: "from-[hsl(38,65%,42%)] to-[hsl(38,75%,32%)]",
  villa: "from-[hsl(210,55%,42%)] to-[hsl(210,65%,32%)]",
  street: "from-[hsl(340,45%,45%)] to-[hsl(340,55%,35%)]",
  neighborhood: "from-[hsl(280,45%,45%)] to-[hsl(280,55%,35%)]",
};

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment / Condo",
  gated: "Gated Community",
  villa: "Villa Community",
  street: "Residential Street",
  neighborhood: "Neighborhood",
};

export default function FindCommunity() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "city" | "area">("all");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const { data: searchResults, isLoading } = useSearchCommunities(query.length >= 2 ? query : "");

  // Show default communities when no query
  const { data: defaultResults } = useSearchCommunities("");
  const filtered = query.length >= 2 ? (searchResults || []) : (defaultResults || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="mx-auto">
            <Logo size="sm" />
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <Reveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(155,45%,92%)] flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8 text-[hsl(155,45%,32%)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-3">
              Find Your Community
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Search for your residential community by name, area, or city.
              Join verified neighbours and start participating.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by community name, area, or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-13 pl-12 pr-4 rounded-2xl border-border bg-card text-base shadow-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["all", "city", "area"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === f
                    ? "bg-[hsl(155,45%,32%)] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f === "all" ? "All Communities" : f === "city" ? "By City" : "By Area"}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <AnimatePresence mode="popLayout">
            {isLoading && query.length >= 2 && (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}
            {!isLoading && filtered.map((community: any, i: number) => {
              const color = TYPE_COLORS[community.type] || TYPE_COLORS.apartment;
              return (
                <motion.div
                  key={community.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group cursor-pointer">
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-br ${color} h-24 flex items-center justify-center`}>
                        <Home className="w-10 h-10 text-white/70 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground">
                            {community.name}
                          </h3>
                          {community.verified && <span className="text-[10px] font-bold bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {community.area}, {community.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {community.resident_count || 0} residents
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[community.type] || community.type}
                          </span>
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full"
                            onClick={() => navigate(`/community/${community.id}`)}
                          >
                            View
                            <ArrowRight className="ml-1 w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {query && filtered.length === 0 && (
          <Reveal>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No communities found matching "{query}"
              </p>
              <Button
                variant="outline"
                className="rounded-full font-medium"
                onClick={() => setShowRequestForm(true)}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Bring My Community
              </Button>
            </div>
          </Reveal>
        )}

        {/* Can't find your community */}
        <Reveal delay={0.2}>
          <div className="text-center py-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">
              Can't find your community?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full font-medium border-[hsl(155,35%,18%)]/30 text-[hsl(155,35%,18%)] hover:bg-[hsl(155,45%,92%)]"
                asChild
              >
                <Link to="/create-community">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Bring My Community
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="rounded-full font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowRequestForm(true)}
              >
                Request Community Instead
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Request Community Form (inline) */}
        <AnimatePresence>
          {showRequestForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="mt-8 border-border/60 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-[Plus_Jakarta_Sans] font-bold text-xl text-foreground">
                      Bring Your Community to JOINN
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    We'll set up your community and notify you when it's ready.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Community name *</label>
                      <Input placeholder="e.g. Green Valley Residency" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Area *</label>
                      <Input placeholder="e.g. Whitefield" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">City *</label>
                      <Input placeholder="e.g. Bangalore" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Community type</label>
                      <Input placeholder="e.g. Apartment Complex" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Approximate residents</label>
                      <Input placeholder="e.g. 500" type="number" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Your name *</label>
                      <Input placeholder="Your full name" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">Your email *</label>
                      <Input placeholder="you@example.com" type="email" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">Message (optional)</label>
                      <textarea
                        placeholder="Any additional information..."
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)] focus:ring-offset-0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full"
                      onClick={() => {
                        setShowRequestForm(false);
                      }}
                    >
                      Bring My Community
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
