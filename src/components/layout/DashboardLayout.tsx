import { useEffect, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SkipToContent } from "@/components/SkipToContent";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Search,
  Calendar,
  Users,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Plus,
  Compass,
  User,
  FileText,
  Shield,
  Building2,
  BarChart3,
} from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SponsorRail } from "@/components/sponsor/SponsorRail";

/* ─── Navigation items ─── */
const primaryNavItems = [
  { title: "Home", url: "/dashboard/home", icon: Home },
  { title: "Discover", url: "/dashboard/discover", icon: Compass },
  { title: "Activities", url: "/dashboard/activities", icon: Calendar },
  { title: "Clubs", url: "/dashboard/clubs", icon: Users },
  { title: "Posts", url: "/dashboard/posts", icon: FileText },
  { title: "Messages", url: "/dashboard/messages", icon: MessageCircle },
];

const secondaryNavItems = [
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Community Growth", url: "/dashboard/growth", icon: BarChart3 },
  { title: "Referrals", url: "/dashboard/referrals", icon: Users },
  { title: "Subscription", url: "/dashboard/subscription", icon: Shield },
  { title: "Sponsor", url: "/dashboard/sponsor", icon: Building2 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { title: "Admin Dashboard", url: "/dashboard/admin", icon: BarChart3 },
  { title: "Manage Residents", url: "/dashboard/admin/residents", icon: Users },
  { title: "Verification", url: "/dashboard/admin/verification", icon: Shield },
  { title: "Sponsorships", url: "/dashboard/admin/sponsorships", icon: Building2 },
  { title: "Announcements", url: "/dashboard/admin/announcements", icon: Bell },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { communityId, communities, setCommunityId } = useCommunity();
  const { data: roleInfo } = useUserRole();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const isAdmin = roleInfo?.role === "admin" || roleInfo?.role === "founder";
  const activeCommunity = communities.find((c: any) => c._id === communityId) || communities[0];
  const communityName = activeCommunity?.name || "My Community";

  useKeyboardShortcuts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="w-full bg-background">
      {/* ═══════════════════════════════════════════════════
          FIXED TOP HEADER / NAVIGATION
          ═══════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center h-full px-3 gap-2">
          {/* Logo */}
          <Link to="/dashboard/home" className="shrink-0 mr-1">
            <Logo size="sm" />
          </Link>

          {/* Community selector (compact) */}
          <div className="hidden md:block shrink-0 mr-2">
            <DropdownMenu open={communityMenuOpen} onOpenChange={setCommunityMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors text-sm"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] flex items-center justify-center shrink-0">
                    <Home className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {communityName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {communities.map((c: any) => (
                  <DropdownMenuItem
                    key={c._id}
                    onClick={() => { setCommunityId(c._id); setCommunityMenuOpen(false); }}
                    className={c._id === communityId ? "bg-accent" : ""}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      {c.area && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {c.area}{c.city ? `, ${c.city}` : ""}
                        </p>
                      )}
                    </div>
                    {c._id === communityId && (
                      <span className="text-[10px] text-primary font-bold">Active</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/find-community">
                    <Plus className="w-4 h-4 mr-2" /> Join Another Community
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-5 bg-border/50 mr-1" />

          {/* Primary navigation (horizontal tabs) */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[hsl(155,45%,32%)] text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.title}
                </Link>
              );
            })}

            {/* Create Activity button (inline) */}
            <Link
              to="/dashboard/activities/create"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[hsl(155,45%,32%)] text-white text-xs font-semibold hover:bg-[hsl(155,45%,26%)] transition-colors ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
            </Link>
          </nav>

          {/* Right side: secondary nav icons + actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Secondary nav (icon-only on desktop) */}
            <div className="hidden lg:flex items-center gap-0.5">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    title={item.title}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[hsl(155,45%,32%)] text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <div className="hidden lg:block w-px h-5 bg-border/50 mx-1" />

            {/* Admin nav (icon-only, if admin) */}
            {isAdmin && (
              <div className="hidden lg:flex items-center gap-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      title={item.title}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[hsl(155,45%,32%)] text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Dark mode toggle */}
            <DarkModeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full" asChild>
              <Link to="/dashboard/notifications">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(340,75%,58%)] rounded-full" />
              </Link>
            </Button>

            {/* Avatar dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[hsl(155,45%,32%)] text-white text-xs font-semibold uppercase">
                        {(user?.email?.[0] ?? "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {user && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile">
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile hamburger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="lg:hidden h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 flex flex-col">
                <div className="h-14 flex items-center px-5 border-b border-border/40">
                  <Logo size="sm" />
                </div>
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.url;
                    return (
                      <Link
                        key={item.url}
                        to={item.url}
                        className={`flex items-center gap-3 px-3 h-11 text-sm font-medium rounded-xl transition-colors ${
                          isActive
                            ? "bg-[hsl(155,45%,32%)] text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {item.title}
                      </Link>
                    );
                  })}
                  <div className="py-2">
                    <div className="h-px bg-border/40" />
                  </div>
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.url}
                        to={item.url}
                        className="flex items-center gap-3 px-3 h-11 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {item.title}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <>
                      <div className="py-2"><div className="h-px bg-border/40" /></div>
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Admin</p>
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.url}
                            to={item.url}
                            className="flex items-center gap-3 px-3 h-11 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-[18px] h-[18px] shrink-0" />
                            {item.title}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </nav>
                <div className="p-3 border-t border-border/40 space-y-1">
                  {user && (
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[hsl(155,45%,32%)] text-white text-xs font-semibold uppercase">
                          {(user.email?.[0] ?? "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 h-11 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          BODY: FIXED LEFT RAIL + NATURAL SCROLL + FIXED RIGHT RAIL
          ═══════════════════════════════════════════════════ */}
      {/*
        Layout strategy:
        - Header: position fixed (already done)
        - Left/Right rails: position fixed, full height below header
        - Main content: normal document flow, body scrolls naturally
        - This gives the same scroll behavior as the landing page
      */}
      <div className="hidden xl:block fixed top-14 left-0 bottom-0 w-[200px] z-30 overflow-hidden border-r border-border/30">
        <SponsorRail side="left" />
      </div>

      <div className="hidden xl:block fixed top-14 right-0 bottom-0 w-[200px] z-30 overflow-hidden border-l border-border/30">
        <SponsorRail side="right" />
      </div>

      <main
        tabIndex={-1}
        id="main-content"
        className="pt-14 outline-none xl:ml-[200px] xl:mr-[200px]"
      >
        <SkipToContent />
        {children}
      </main>

      {/* Spacer for mobile bottom nav so content isn't hidden behind it */}
      <div className="lg:hidden h-16" />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border/40 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { title: "Home", url: "/dashboard/home", icon: Home },
            { title: "Discover", url: "/dashboard/discover", icon: Compass },
            { title: "Create", url: "/dashboard/activities/create", icon: Plus, special: true },
            { title: "Clubs", url: "/dashboard/clubs", icon: Users },
            { title: "Posts", url: "/dashboard/posts", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            if (item.special) {
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center shadow-lg shadow-[hsl(155,45%,32%)]/30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={item.url}
                to={item.url}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[48px]"
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
