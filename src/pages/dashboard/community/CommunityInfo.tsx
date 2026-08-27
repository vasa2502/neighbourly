import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Megaphone, Shield, Building2, Phone, AlertTriangle, FileText, HelpCircle, Wrench, ChevronRight } from "lucide-react";

const sections = [
  { icon: Megaphone, label: "Announcements", description: "Official community updates", color: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]", count: 5 },
  { icon: Shield, label: "Rules", description: "Community guidelines and rules", color: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]", count: null },
  { icon: Building2, label: "Facilities", description: "Clubhouse, courts, pool, gym", color: "bg-[hsl(210,40%,92%)] text-[hsl(210,55%,42%)]", count: 8 },
  { icon: Phone, label: "Contacts", description: "Important phone numbers", color: "bg-[hsl(280,40%,92%)] text-[hsl(280,50%,42%)]", count: null },
  { icon: AlertTriangle, label: "Emergency", description: "Safety information and emergency contacts", color: "bg-[hsl(0,50%,94%)] text-destructive", count: null },
  { icon: FileText, label: "Documents", description: "Official files and notices", color: "bg-[hsl(45,50%,92%)] text-[hsl(45,65%,42%)]", count: 12 },
  { icon: HelpCircle, label: "FAQ", description: "Community-specific questions", color: "bg-[hsl(170,40%,92%)] text-[hsl(170,50%,38%)]", count: null },
  { icon: Wrench, label: "Maintenance", description: "Maintenance schedules and requests", color: "bg-[hsl(340,40%,94%)] text-[hsl(340,45%,45%)]", count: 3 },
];

export default function CommunityInfo() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Community Information</h1>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <Reveal key={section.label} delay={i * 0.04}>
              <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{section.label}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.count && <span className="text-xs font-semibold text-muted-foreground">{section.count}</span>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
