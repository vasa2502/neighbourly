import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useCommunityData";
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
  MapPin,
  Plus,
  Compass,
  Trophy,
  User,
  FileText,
  Shield,
  Building2,
  BarChart3,
} from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";

/* ─── Navigation items ─── */
const residentNavItems = [
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
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { title: "Admin Dashboard", url: "/dashboard/admin", icon: BarChart3 },
  { title: "Manage Residents", url: "/dashboard/admin/residents", icon: Users },
  { title: "Verification", url: "/dashboard/admin/verification", icon: Shield },
  { title: "Announcements", url: "/dashboard/admin/announcements", icon: Bell },
];

const communityName = "Green Valley Residency";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin] = useState(false);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] bg-[hsl(155,30%,97%)] border-r border-border/60 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border/40">
          <Link to="/dashboard/home">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Community selector */}
        <div className="px-4 py-3 border-b border-border/40">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {communityName}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                Whitefield, Bangalore
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {residentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 h-10 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? "bg-[hsl(155,45%,32%)] text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {item.title}
              </Link>
            );
          })}

          {/* Create Activity button */}
          <div className="pt-2 pb-1">
            <Button
              className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-xl h-10 text-sm"
              asChild
            >
              <Link to="/dashboard/activities/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Activity
              </Link>
            </Button>
          </div>

          {/* Divider */}
          <div className="py-2">
            <div className="h-px bg-border/40" />
          </div>

          {/* Secondary nav */}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 h-10 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? "bg-[hsl(155,45%,32%)] text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {item.title}
              </Link>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="py-2">
                <div className="h-px bg-border/40" />
              </div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Admin
              </p>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 h-10 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-[hsl(155,45%,32%)] text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User profile at bottom */}
        <div className="p-3 border-t border-border/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[hsl(155,45%,32%)] text-white text-xs font-semibold uppercase">
                    {(user?.email?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {(profile as any)?.name || user?.email?.split("@")[0] || "Resident"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Verified Resident
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
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
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 lg:h-16 flex items-center px-4 lg:px-6 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3 flex-1">
            <Link to="/dashboard/home" className="lg:hidden">
              <Logo size="sm" />
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] flex items-center justify-center">
                <Home className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">{communityName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-[18px] h-[18px]" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" asChild>
              <Link to="/dashboard/notifications">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(340,75%,58%)] rounded-full" />
              </Link>
            </Button>

            {/* Avatar dropdown */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-9 w-9">
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
                  className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 flex flex-col">
                <div className="h-14 flex items-center px-5 border-b border-border/40">
                  <Logo size="sm" />
                </div>
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                  {residentNavItems.map((item) => {
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
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-auto">
          {children}
        </main>

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
    </div>
  );
}
