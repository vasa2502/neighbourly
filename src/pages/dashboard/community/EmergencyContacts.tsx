import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Phone, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { useCommunityContacts, useCreateContact } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

const typeColors: Record<string, string> = { Emergency: "bg-destructive/10 text-destructive", Admin: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]", Service: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]" };

const fallbackContacts = [
  { id: "1", name: "Security Control Room", phone: "080-1234-5678", type: "Emergency" },
  { id: "2", name: "Fire Department", phone: "101", type: "Emergency" },
  { id: "3", name: "Police", phone: "100", type: "Emergency" },
  { id: "4", name: "Ambulance", phone: "108", type: "Emergency" },
  { id: "5", name: "RWA Office", phone: "080-1234-5679", type: "Admin" },
  { id: "6", name: "Maintenance Office", phone: "080-1234-5680", type: "Admin" },
  { id: "7", name: "Electrician (On-call)", phone: "+91 98765 43210", type: "Service" },
  { id: "8", name: "Plumber (On-call)", phone: "+91 98765 43211", type: "Service" },
];

export default function EmergencyContacts() {
  const { communityId } = useCommunity();
  const { data: dbContacts = [] } = useCommunityContacts(communityId || "");
  const createContact = useCreateContact();
  const isAdmin = useIsAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactType, setContactType] = useState("maintenance");
  const contacts = dbContacts.length > 0 ? dbContacts : fallbackContacts;

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone are required"); return; }
    try {
      await createContact.mutateAsync({ communityId: communityId || "", name, phone, type: contactType, available24x7: false });
      toast.success("Contact added!");
      setName(""); setPhone(""); setShowAdd(false);
    } catch { toast.error("Failed to add contact"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3 flex-1">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h1 className="text-xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-1">Emergency Contacts</h1>
              <p className="text-xs text-muted-foreground">For life-threatening emergencies, always call 112 (India Emergency Number) first.</p>
            </div>
          </div>
          {isAdmin && <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full ml-3 shrink-0" onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-1" /> Add</Button>}
        </div>
      </Reveal>

      {showAdd && isAdmin && (
        <Reveal delay={0.05}>
          <Card className="mb-6 border-[hsl(155,45%,32%)]/30">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Contact name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
              <div className="flex gap-2">
                {['emergency', 'maintenance', 'management'].map((t) => (
                  <Button key={t} size="sm" variant={contactType === t ? "default" : "outline"} onClick={() => setContactType(t)} className={contactType === t ? "bg-[hsl(155,45%,32%)] text-white" : ""}>{t}</Button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white" onClick={handleAdd} disabled={createContact.isPending}>
                  {createContact.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      <div className="space-y-3">
        {contacts.map((c: any, i: number) => (
          <Reveal key={c._id || c.name} delay={i * 0.04}>
            <Card className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[c.type] || typeColors.Service}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1"><p className="text-sm font-semibold text-foreground">{c.name}</p><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.type}</span></div>
                <a href={`tel:${c.phone}`} className="text-sm font-semibold text-[hsl(155,45%,32%)] hover:underline">{c.phone}</a>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
