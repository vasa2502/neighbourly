import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { User, Shield, Bell, Lock, LogOut, ChevronRight, Home, Eye, Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const settingSections = [
  {
    title: "Profile",
    items: [
      { icon: User, label: "Edit Profile", description: "Name, photo, bio, building", to: "/dashboard/profile/edit" },
      { icon: Dumbbell, label: "Sports & Interests", description: "Manage your interests and skill levels", to: "/dashboard/profile/edit" },
      { icon: Eye, label: "Privacy Settings", description: "Control what others can see", to: "/dashboard/profile/privacy" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Shield, label: "Verification Status", description: "Manage your residency verification", to: "/dashboard/profile/participation" },
      { icon: Bell, label: "Notification Preferences", description: "Configure what notifications you receive", to: "/dashboard/notifications" },
      { icon: Lock, label: "Security", description: "Password, login methods", to: "/dashboard/profile/account" },
      { icon: Home, label: "Community Membership", description: "Manage your community connections", to: "/dashboard/profile/account" },
    ],
  },
];

export default function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-6">
          Settings
        </h1>
      </Reveal>

      {settingSections.map((section, si) => (
        <Reveal key={section.title} delay={si * 0.1}>
          <section className="mb-8">
            <h2 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>
            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden">
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                      ii < section.items.length - 1 ? "border-b border-border/40" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </Card>
          </section>
        </Reveal>
      ))}

      <Reveal delay={0.2}>
        <Button
          variant="outline"
          className="w-full rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 font-medium"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </Reveal>
    </div>
  );
}
