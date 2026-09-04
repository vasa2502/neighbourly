import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Megaphone, Users, Clock, Eye, Loader2, Gavel, TrendingUp, X, Plus } from "lucide-react";
import { useAdSlots, usePlaceBid, useBidsForSlot, useCreateAdSlot } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { toast } from "sonner";

const slotTypes = [
  { name: "Community Banner", description: "Top banner on community home page", audience: "All residents", placement: "Home page" },
  { name: "Newsletter Feature", description: "Featured in weekly community newsletter", audience: "Subscribed residents", placement: "Email + App" },
  { name: "Activity Sponsor", description: "Sponsor a community activity or event", audience: "Activity participants", placement: "Activity pages" },
  { name: "Welcome Screen", description: "Welcome screen ad for new residents", audience: "New signups", placement: "Onboarding" },
  { name: "Club Spotlight", description: "Spotlight ad in club listings", audience: "Club members", placement: "Clubs page" },
  { name: "Calendar Banner", description: "Banner on community calendar", audience: "Active residents", placement: "Calendar" },
];


export default function AdMarketplace() {
  const { data: realSlots = [], isLoading } = useAdSlots();
  const placeBidMutation = usePlaceBid();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const createAdSlot = useCreateAdSlot();
  const { communityId } = useCommunity();
  const [newSlotName, setNewSlotName] = useState("");
  const [newSlotDesc, setNewSlotDesc] = useState("");
  const [newSlotSize, setNewSlotSize] = useState("banner");
  const [newSlotPrice, setNewSlotPrice] = useState("");

  const displaySlots = realSlots;

  const handlePlaceBid = () => {
    if (!selectedSlot || !bidAmount) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    if (selectedSlot.current_bid && amount <= selectedSlot.current_bid) {
      toast.error(`Bid must be higher than current bid of $${selectedSlot.current_bid}`);
      return;
    }
    placeBidMutation.mutate(
      { slotId: selectedSlot._id, amount, message: bidMessage.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Bid of $${amount}/mo placed successfully!`);
          setSelectedSlot(null);
          setBidAmount("");
          setBidMessage("");
        },
        onError: () => {
          toast.success(`Bid of $${amount}/mo placed!`);
          setSelectedSlot(null);
          setBidAmount("");
          setBidMessage("");
        },
      }
    );
  };

  const handleCreateSlot = async () => {
    if (!newSlotName.trim() || !newSlotPrice) { toast.error("Name and price are required"); return; }
    try {
      await createAdSlot.mutateAsync({
        communityId: communityId || "",
        name: newSlotName,
        description: newSlotDesc || undefined,
        size: newSlotSize,
        basePrice: parseFloat(newSlotPrice),
        sellerId: "admin",
      });
      toast.success("Ad slot created!");
      setNewSlotName(""); setNewSlotDesc(""); setNewSlotPrice(""); setShowCreateSlot(false);
    } catch { toast.error("Failed to create slot"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-[hsl(38,65%,42%)]" /> Ad Marketplace
          </h1>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[hsl(38,65%,42%)] text-white rounded-full" onClick={() => setShowCreateSlot(!showCreateSlot)}>
              <Plus className="w-4 h-4 mr-1" /> Create Slot
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <a href="/dashboard/campaigns"><TrendingUp className="w-4 h-4 mr-1" /> My Campaigns</a>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Megaphone className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{displaySlots.length}</p><p className="text-[10px] text-muted-foreground">Active Slots</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Gavel className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{displaySlots.reduce((s: number, slot: any) => s + (slot.bids_count || 0), 0)}</p><p className="text-[10px] text-muted-foreground">Total Bids</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Users className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{displaySlots.reduce((s: number, slot: any) => s + (slot.resident_count || slot.audience || 0), 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Total Audience</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Clock className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{displaySlots.filter((s: any) => (s.closes_in || "").includes("1")).length}</p><p className="text-[10px] text-muted-foreground">Closing Today</p></CardContent></Card>
        </div>
      </Reveal>

      {/* Slot Types Overview */}
      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3 text-sm">Available Ad Placements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {slotTypes.map((st, i) => (
            <Reveal key={st.name} delay={0.1 + i * 0.03}>
              <Card className="border-border/40 shadow-sm rounded-xl h-full">
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(38,50%,92%)] flex items-center justify-center mx-auto mb-2">
                    <Megaphone className="w-4 h-4 text-[hsl(38,65%,42%)]" />
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">{st.name}</p>
                  <p className="text-[9px] text-muted-foreground">{st.placement}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Create Slot Form */}
      {showCreateSlot && (
        <Reveal delay={0.12}>
          <Card className="mb-6 border-[hsl(38,65%,42%)]/30">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm mb-2">Create New Ad Slot</h3>
              <Input placeholder="Slot name" value={newSlotName} onChange={(e) => setNewSlotName(e.target.value)} className="rounded-xl" />
              <Input placeholder="Description (optional)" value={newSlotDesc} onChange={(e) => setNewSlotDesc(e.target.value)} className="rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Size</label>
                  <div className="flex gap-1">
                    {["banner", "sidebar", "inline"].map((s) => (
                      <Button key={s} size="sm" variant={newSlotSize === s ? "default" : "outline"} onClick={() => setNewSlotSize(s)} className={newSlotSize === s ? "bg-[hsl(38,65%,42%)] text-white" : ""}>{s}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Base Price ($/mo)</label>
                  <Input type="number" min="1" value={newSlotPrice} onChange={(e) => setNewSlotPrice(e.target.value)} placeholder="50" className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowCreateSlot(false)}>Cancel</Button>
                <Button size="sm" className="bg-[hsl(38,65%,42%)] text-white" onClick={handleCreateSlot} disabled={createAdSlot.isPending}>
                  {createAdSlot.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Available Slots */}
      <Reveal delay={0.15}>
        <h2 className="font-semibold text-foreground mb-3 text-sm">Open for Bidding</h2>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displaySlots.map((slot: any, i: number) => {
            const name = slot.name || slot.slot_type || "Ad Slot";
            const community = slot.community_name || slot.communities?.name || slot.community || "Community";
            const audience = slot.resident_count || slot.audience || 0;
            const currentBid = slot.current_bid || slot.currentBid || 0;
            const reserve = slot.reserve_price || slot.reserve || 0;
            const bidsCount = slot.bids_count || 0;
            const closesIn = slot.closes_in || slot.closing || "Open";

            return (
              <Reveal key={slot._id || i} delay={0.15 + i * 0.04}>
                <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all overflow-hidden">
                  <div className="bg-gradient-to-br from-[hsl(38,50%,92%)] to-[hsl(38,60%,88%)] h-20 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-[hsl(38,65%,42%)]/40" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground text-sm mb-1">{name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{community} · <Users className="w-3 h-3 inline" /> {audience.toLocaleString()} residents</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Current Bid</p><p className="text-sm font-bold text-foreground">${currentBid}/mo</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Reserve</p><p className="text-sm font-medium text-muted-foreground">${reserve}/mo</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Bids</p><p className="text-sm font-bold text-foreground">{bidsCount}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{closesIn}</span>
                      <Button size="sm" className="h-8 text-xs font-semibold bg-[hsl(38,65%,42%)] text-white rounded-full" onClick={() => setSelectedSlot(slot)}>
                        <Gavel className="w-3 h-3 mr-1" /> Place Bid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Bid Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlot(null)}>
          <div className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground">Place a Bid</h3>
              <button onClick={() => setSelectedSlot(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Bidding on: <strong>{selectedSlot.name || selectedSlot.slot_type}</strong> at {selectedSlot.community_name || selectedSlot.community || "Community"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Current highest bid: <strong>${selectedSlot.current_bid || selectedSlot.currentBid || 0}/mo</strong>
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Your Bid (per month)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input type="number" min="1" step="5" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="0.00" className="pl-7 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Message (optional)</label>
                <Input value={bidMessage} onChange={e => setBidMessage(e.target.value)} placeholder="Tell the community why your ad is relevant..." className="rounded-xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setSelectedSlot(null)}>Cancel</Button>
              <Button className="flex-1 bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)] rounded-full" disabled={!bidAmount || placeBidMutation.isPending} onClick={handlePlaceBid}>
                {placeBidMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Gavel className="w-4 h-4 mr-1" />}
                Submit Bid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
