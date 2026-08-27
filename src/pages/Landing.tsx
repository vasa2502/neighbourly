import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Shield,
  Calendar,
  Trophy,
  MessageCircle,
  Heart,
  Lock,
  Eye,
  Star,
  Zap,
  CheckCircle2,
  Building2,
  Megaphone,
  Sparkles,
  Dumbbell,
  Gamepad2,
  BookOpen,
  Dog,
  Baby,
  UtensilsCrossed,
  Camera,
  TreePine,
  Home,
  Search,
  Bell,
  Settings,
  UserCheck,
  Clock,
  Globe,
  BarChart3,
  Crown,
  TrendingUp,
} from "lucide-react";

/* ─── Animated word cycle ─── */
const rotatingWords = ["Activities", "Sports", "Clubs", "Community"];

/* ─── Feature cards data ─── */
const features = [
  {
    icon: Calendar,
    title: "Activities",
    description:
      "Organize badminton, football, yoga, book clubs — anything your community enjoys. Find participants, manage sign-ups, and build recurring events.",
    color: "bg-[hsl(155,45%,92%)]",
    iconColor: "text-[hsl(155,45%,32%)]",
  },
  {
    icon: Trophy,
    title: "Sports",
    description:
      "Find players for tonight's game, track skill levels, form teams, and manage waitlists. From casual pick-up games to competitive leagues.",
    color: "bg-[hsl(38,60%,92%)]",
    iconColor: "text-[hsl(38,65%,42%)]",
  },
  {
    icon: Users,
    title: "Clubs",
    description:
      "Create clubs around shared interests — fitness, photography, gardening, kids' activities. Grow membership and host regular meetups.",
    color: "bg-[hsl(210,50%,92%)]",
    iconColor: "text-[hsl(210,55%,42%)]",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description:
      "Buy, sell, give away, share recommendations, ask for help, and start conversations — all within your verified residential community.",
    color: "bg-[hsl(340,50%,92%)]",
    iconColor: "text-[hsl(340,55%,45%)]",
  },
];

/* ─── How it works steps ─── */
const howItWorks = [
  {
    step: "1",
    title: "Find Your Community",
    description:
      "Search by name, area, or city to locate your residential community. Can't find it? Request it in seconds.",
    icon: Search,
  },
  {
    step: "2",
    title: "Verify You Live Here",
    description:
      "Quick verification through community invite codes, admin approval, or residency proof. Your privacy is always protected.",
    icon: Shield,
  },
  {
    step: "3",
    title: "Set Up Your Profile",
    description:
      "Add your interests, sports, availability, and privacy preferences. The more you share, the better your recommendations.",
    icon: UserCheck,
  },
  {
    step: "4",
    title: "Join In",
    description:
      "Discover activities, join clubs, meet neighbours, and become part of an active community right where you live.",
    icon: Heart,
  },
];

/* ─── Example activity cards ─── */
const exampleActivities = [
  {
    title: "Morning Badminton",
    category: "Sports",
    time: "Today · 7:00 AM",
    spots: "3 spots left",
    host: "Rajesh K.",
    color: "bg-[hsl(155,40%,94%)]",
  },
  {
    title: "Weekend Yoga Session",
    category: "Fitness",
    time: "Sat · 8:00 AM",
    spots: "8 spots left",
    host: "Priya S.",
    color: "bg-[hsl(38,50%,94%)]",
  },
  {
    title: "Kids Art Workshop",
    category: "Kids",
    time: "Sun · 10:00 AM",
    spots: "5 spots left",
    host: "Ananya M.",
    color: "bg-[hsl(210,40%,94%)]",
  },
  {
    title: "Community Book Club",
    category: "Social",
    time: "Fri · 6:30 PM",
    spots: "Open",
    host: "Sarah L.",
    color: "bg-[hsl(340,40%,94%)]",
  },
];

/* ─── Example club cards ─── */
const exampleClubs = [
  {
    name: "Green Valley Fitness",
    members: 42,
    category: "Fitness",
    activity: "3 activities/week",
    color: "from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)]",
  },
  {
    name: "Photography Enthusiasts",
    members: 18,
    category: "Hobby",
    activity: "1 activity/week",
    color: "from-[hsl(38,65%,42%)] to-[hsl(38,75%,32%)]",
  },
  {
    name: "Parents Network",
    members: 65,
    category: "Family",
    activity: "2 activities/week",
    color: "from-[hsl(210,55%,42%)] to-[hsl(210,65%,32%)]",
  },
];

/* ─── Community posts examples ─── */
const examplePosts = [
  {
    type: "Offer",
    title: "Giving away kids' bicycle",
    author: "Devika R.",
    time: "2h ago",
    replies: 5,
  },
  {
    type: "Recommendation",
    title: "Best plumber in our area?",
    author: "Amit P.",
    time: "4h ago",
    replies: 12,
  },
  {
    type: "Looking For",
    title: "Tennis partner for Saturday morning",
    author: "Vikram S.",
    time: "1d ago",
    replies: 3,
  },
];

/* ─── Pricing plans (resident-based, region-aware) ─── */
const pricingPlans = [
  {
    name: "Resident",
    price: "Free",
    period: "",
    description: "For every community member",
    features: [
      "Find and join your community",
      "Discover activities and clubs",
      "Connect with verified neighbours",
      "Create and join activities",
      "Community posts and discussions",
      "Basic messaging",
      "Community calendar",
      "Basic notifications",
    ],
    cta: "Join Free",
    highlighted: false,
  },
  {
    name: "Resident Plus",
    price: "$6.99",
    period: "/month",
    description: "Your community membership",
    features: [
      "Everything in Free",
      "Priority activity booking",
      "Advanced profile features",
      "Enhanced privacy controls",
      "Priority support",
      "No ads",
      "Referral credit rewards",
    ],
    cta: "Upgrade",
    highlighted: true,
  },
  {
    name: "Host Pro",
    price: "$9.99",
    period: "/month",
    description: "For activity hosts",
    features: [
      "Everything in Resident Plus",
      "Recurring activities",
      "Waitlists and co-hosts",
      "Activity analytics",
      "Advanced scheduling",
      "Host dashboard",
    ],
    cta: "Go Pro",
    highlighted: false,
  },
  {
    name: "Community Partner",
    price: "$199",
    period: "/month per community",
    description: "For businesses & admins",
    features: [
      "Complete community management",
      "Resident verification system",
      "Announcements and official info",
      "Moderation tools and analytics",
      "Community advertising revenue",
      "Custom branding and rules",
      "Dedicated support",
    ],
    cta: "Partner Up",
    highlighted: false,
  },
];

/* ─── FAQ data ─── */
const faqs = [
  {
    q: "What is JOINN?",
    a: "JOINN is a private community platform built around where you live. It helps you discover activities, join clubs, and connect with verified neighbours — all within your residential community.",
  },
  {
    q: "How does verification work?",
    a: "Each community configures its own verification method. This could be a community invite code, admin approval, supported email verification, or residency proof submission. Your personal information is always kept private.",
  },
  {
    q: "Is my information private?",
    a: "Yes. JOINN is designed with privacy at its core. You control what information is visible to other residents — your building, activity history, interests, and more can all be configured in your privacy settings.",
  },
  {
    q: "Can I join multiple communities?",
    a: "Yes, if you live in multiple residential communities, you can join and switch between them. Each community maintains its own separate space.",
  },
  {
    q: "Can I create activities and clubs?",
    a: "Yes! Any verified resident can create activities and clubs. Host Pro ($9.99/month) unlocks advanced features like recurring activities, waitlists, co-hosts, and analytics.",
  },
  {
    q: "How do businesses advertise?",
    a: "Businesses can bid for advertising slots within specific communities through an auction system. This ensures ads are relevant and community admins control what appears in their space.",
  },
];

/* ─── Accordion FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-[Plus_Jakarta_Sans] font-semibold text-foreground pr-4 group-hover:text-[hsl(155,45%,32%)] transition-colors">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground text-sm leading-relaxed pb-5 max-w-3xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Interactive Demo Steps ─── */
const demoSteps = [
  { icon: Search, title: "Find your community", desc: "Search by name, area, or city to find where you live." },
  { icon: Shield, title: "Verify that you live there", desc: "Quick verification keeps your community private and trusted." },
  { icon: Building2, title: "Enter your private community", desc: "Get access to your verified residential space." },
  { icon: Users, title: "Discover residents", desc: "Meet neighbours who share your interests." },
  { icon: Calendar, title: "Find activities", desc: "Sports, fitness, social, kids — something for everyone." },
  { icon: Trophy, title: "Join sports and clubs", desc: "Find players, form teams, join clubs." },
  { icon: Zap, title: "Create activities", desc: "Start something your community will love." },
  { icon: Heart, title: "Invite neighbours", desc: "Grow your community with referral rewards." },
  { icon: TrendingUp, title: "Grow your community", desc: "Watch your verified resident count rise." },
  { icon: Crown, title: "Build a real local community", desc: "Be part of something meaningful where you live." },
];

function DemoSteps() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % demoSteps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Reveal delay={0.15}>
      <div className="relative">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {demoSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeStep ? "w-8 bg-[hsl(155,45%,32%)]" : i < activeStep ? "w-4 bg-[hsl(155,45%,60%)]" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Demo card */}
        <Card className="max-w-2xl mx-auto border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-[hsl(155,45%,95%)] to-[hsl(155,35%,90%)] p-8 lg:p-12 text-center min-h-[280px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-5">
                    {(() => { const Icon = demoSteps[activeStep].icon; return <Icon className="w-8 h-8 text-[hsl(155,45%,32%)]" />; })()}
                  </div>
                  <p className="text-xs font-bold text-[hsl(155,45%,32%)] tracking-[0.15em] uppercase mb-2">
                    Step {activeStep + 1} of {demoSteps.length}
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-[hsl(155,35%,18%)] mb-3">
                    {demoSteps[activeStep].title}
                  </h3>
                  <p className="text-[hsl(155,10%,45%)] text-base max-w-md">
                    {demoSteps[activeStep].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-5 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="text-[hsl(155,45%,32%)]"
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(Math.min(demoSteps.length - 1, activeStep + 1))}
                  disabled={activeStep === demoSteps.length - 1}
                  className="text-[hsl(155,45%,32%)]"
                >
                  Next
                </Button>
                {activeStep === demoSteps.length - 1 && (
                  <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,50%,28%)]" asChild>
                    <Link to="/find-community">Get Started <ArrowRight className="ml-1 w-4 h-4" /></Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </Reveal>
  );
}

/* ─── Main Landing Page ─── */
const Landing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [wordIndex, setWordIndex] = useState(0);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard/home", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavVisible(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!authLoading && !!user) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ── */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-transparent"
        initial={{ y: -100 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sm font-medium"
              asChild
            >
              <Link to="/auth">Log in</Link>
            </Button>
            <Button
              className="hidden sm:inline-flex text-sm font-semibold bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)]"
              asChild
            >
              <Link to="/find-community">
                Find My Community
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── Static top bar for non-scrolled state ── */}
      <div className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-sm lg:hidden" style={{ pointerEvents: navVisible ? 'none' : 'auto', opacity: navVisible ? 0 : 1, transition: 'opacity 0.3s' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 lg:pt-32 pb-16 lg:pb-24">
        {/* Radial brand glow */}
        <div className="absolute inset-x-0 top-0 -z-0 pointer-events-none" aria-hidden="true">
          <div className="mx-auto h-[700px] w-[120%] -translate-x-[10%] hero-glow" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute top-[15%] left-[8%] w-20 h-20 rounded-full bg-[hsl(155,45%,85%)]/40 blur-sm"
            animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[25%] right-[10%] w-14 h-14 rounded-2xl bg-[hsl(38,60%,85%)]/40 rotate-12 blur-sm"
            animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[12%] w-16 h-16 rounded-full bg-[hsl(210,50%,85%)]/40 blur-sm"
            animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-[30%] right-[6%] w-12 h-12 rounded-full bg-[hsl(155,45%,88%)]/40 blur-sm"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          {/* Floating preview cards - left side */}
          <div className="hidden xl:block absolute left-0 top-12 w-[240px]">
            <motion.div
              className="rounded-2xl bg-white shadow-lg border border-border/40 overflow-hidden rotate-[-4deg]"
              initial={{ opacity: 0, x: -60, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            >
              <div className="h-24 bg-[hsl(155,45%,92%)] flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-[hsl(155,45%,32%)]" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sports
                </span>
                <p className="text-xs font-semibold mt-1.5">Morning Badminton</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Today · 7:00 AM · 3 spots left</p>
              </div>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute right-0 bottom-12 w-[240px]">
            <motion.div
              className="rounded-2xl bg-white shadow-lg border border-border/40 overflow-hidden rotate-[4deg]"
              initial={{ opacity: 0, x: 60, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.45 }}
            >
              <div className="h-24 bg-[hsl(38,50%,92%)] flex items-center justify-center">
                <Users className="w-8 h-8 text-[hsl(38,65%,42%)]" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold text-[hsl(38,65%,42%)] bg-[hsl(38,50%,92%)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Club
                </span>
                <p className="text-xs font-semibold mt-1.5">Green Valley Fitness</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">42 members · 3 activities/week</p>
              </div>
            </motion.div>
          </div>

          <div className="text-center max-w-3xl mx-auto relative z-10">
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-6 bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(155,45%,32%)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(155,45%,32%)]" />
                </span>
                Private Community Platform
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-[Plus_Jakarta_Sans] font-extrabold tracking-[-0.03em] leading-[0.95] text-foreground mb-6">
                Where you live,{" "}
                <span className="inline-block relative">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingWords[wordIndex]}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35 }}
                      className="text-[hsl(155,45%,32%)] inline-block"
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="invisible inline-block h-0 overflow-hidden" aria-hidden="true">
                    {rotatingWords.reduce((a, b) => (a.length >= b.length ? a : b), "")}
                  </span>
                </span>
                {" "}comes alive.
              </h1>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                A private, verified platform for your residential community.
                Find activities, join clubs, and connect with neighbours — all
                where you live.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="text-base font-semibold px-8 h-13 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] shadow-xl shadow-[hsl(155,45%,32%)]/20"
                  asChild
                >
                  <Link to="/find-community">
                    Find My Community
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="text-base font-semibold px-8 h-13 bg-[hsl(155,35%,18%)] text-white hover:bg-[hsl(155,40%,15%)] shadow-xl shadow-[hsl(155,35%,18%)]/20"
                  asChild
                >
                  <Link to="/create-community">
                    Bring My Community
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-medium px-8 h-13 border-border hover:bg-muted"
                  asChild
                >
                  <a href="#demo">
                    See How JOINN Works
                  </a>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="flex items-center justify-center gap-6 mt-8">
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link to="/auth?role=admin">
                    For Communities
                  </Link>
                </Button>
                <span className="text-gray-300">·</span>
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link to="/auth?role=business">
                    Advertise
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" className="py-20 lg:py-28 bg-muted/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                Interactive Demo
              </span>
              <h2 className="text-3xl sm:text-4xl font-[Plus_Jakarta_Sans] font-extrabold mb-4 text-foreground tracking-[-0.02em]">
                See How JOINN Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Experience the full product flow — from finding your community to growing it — without creating an account.
              </p>
            </div>
          </Reveal>

          <DemoSteps />
        </div>
      </section>

      {/* ── Visual: Activities, Sports, Clubs, Community ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={i * 0.1}>
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
                    <CardContent className="p-0">
                      <div className={`${feature.color} h-36 flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                        <Icon className={`w-12 h-12 ${feature.iconColor}`} />
                      </div>
                      <div className="p-6">
                        <h3 className="font-[Plus_Jakarta_Sans] font-bold text-lg text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.02]">
                From sign-up to
                <br />
                community in minutes
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Joining your community on JOINN is quick, private, and
                designed around real residential life.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.step} delay={i * 0.12}>
                  <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] mb-5">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="absolute top-0 right-0 w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center -translate-y-1 translate-x-1">
                      {step.step}
                    </div>
                    <h3 className="font-[Plus_Jakarta_Sans] font-bold text-lg text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {i < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-8 -right-4 w-8 h-[1px] bg-border" />
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust & Verification ── */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                  Trust & Safety
                </span>
                <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.05]">
                  Only real neighbours.
                  <br />
                  Always verified.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Every member is verified as a resident of their community.
                  No anonymous accounts, no strangers — just verified people
                  who live where you live.
                </p>
                <div className="space-y-4">
                  {[
                    "Community-managed verification process",
                    "Multiple verification methods supported",
                    "Admin review and approval workflows",
                    "Your personal details stay private",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-[hsl(155,45%,92%)] rounded-3xl -rotate-2" />
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-border/40">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-[Plus_Jakarta_Sans] font-bold text-foreground">
                        Verified Resident
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Green Valley Residency
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-[hsl(155,50%,38%)] ml-auto" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Home, label: "Tower B · Floor 12" },
                      { icon: Trophy, label: "Badminton, Yoga, Book Club" },
                      { icon: Clock, label: "Available evenings & weekends" },
                      { icon: Lock, label: "Profile visible to community only" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <item.icon className="w-4 h-4 shrink-0 text-[hsl(155,45%,32%)]/60" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-[hsl(210,50%,92%)] rounded-3xl rotate-2" />
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-border/40">
                  <p className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-4">
                    Privacy Controls
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Profile visibility", value: "Community only" },
                      { label: "Building/tower", value: "Visible to verified residents" },
                      { label: "Activity history", value: "Visible to participants" },
                      { label: "Sports & interests", value: "Community only" },
                      { label: "Who can message", value: "Community members" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-b-0">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="order-1 lg:order-2">
                <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                  Your Data, Your Rules
                </span>
                <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.05]">
                  Privacy is built in,
                  <br />
                  not bolted on.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  JOINN intentionally minimizes residential information.
                  You control exactly what other residents can see about you.
                  Your address, personal details, and activity patterns are
                  always under your control.
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                  <span>Data is encrypted, never sold, and community-scoped.</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Community Examples: Activities ── */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                What's Happening
              </span>
              <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.02]">
                Activities happening
                <br />
                in real communities
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleActivities.map((activity, i) => (
              <Reveal key={activity.title} delay={i * 0.1}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group cursor-pointer">
                  <CardContent className="p-0">
                    <div className={`${activity.color} h-32 flex items-center justify-center`}>
                      {i === 0 && <Dumbbell className="w-10 h-10 text-[hsl(155,45%,32%)] group-hover:scale-110 transition-transform" />}
                      {i === 1 && <Heart className="w-10 h-10 text-[hsl(38,65%,42%)] group-hover:scale-110 transition-transform" />}
                      {i === 2 && <Baby className="w-10 h-10 text-[hsl(210,55%,42%)] group-hover:scale-110 transition-transform" />}
                      {i === 3 && <BookOpen className="w-10 h-10 text-[hsl(340,55%,45%)] group-hover:scale-110 transition-transform" />}
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(155,45%,32%)]">
                        {activity.category}
                      </span>
                      <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mt-1 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                        <span className="text-xs text-[hsl(155,50%,38%)] font-medium">{activity.spots}</span>
                        <span className="text-xs text-muted-foreground">by {activity.host}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Clubs ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                Community Clubs
              </span>
              <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.02]">
                Find your people.
                <br />
                Start a club.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exampleClubs.map((club, i) => (
              <Reveal key={club.name} delay={i * 0.1}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group cursor-pointer">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${club.color} h-40 flex items-center justify-center`}>
                      <Users className="w-14 h-14 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {club.category}
                      </span>
                      <h3 className="font-[Plus_Jakarta_Sans] font-bold text-xl text-foreground mt-1 mb-2">
                        {club.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {club.members} members
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {club.activity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Posts ── */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                  Community Conversation
                </span>
                <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.05]">
                  More than a feed.
                  <br />
                  Real conversations.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Ask for help, share recommendations, give things away, or
                  just chat with your neighbours. Every post is from a verified
                  resident of your community.
                </p>
                <div className="space-y-3">
                  {["Ask · Help · Offer", "Recommendations", "Lost & Found", "Buy / Sell / Giveaway"].map(
                    (tag) => (
                      <div key={tag} className="inline-flex items-center gap-2 bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] text-xs font-semibold px-3 py-1.5 rounded-full mr-2 mb-1">
                        {tag}
                      </div>
                    )
                  )}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-4">
                {examplePosts.map((post, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-border/40 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">
                        {post.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{post.time}</span>
                    </div>
                    <p className="font-[Plus_Jakarta_Sans] font-semibold text-foreground mb-1">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.replies} replies
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── For Communities / Admin Value Prop ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 bg-[hsl(155,45%,92%)] rounded-3xl -rotate-1" />
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-border/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,32%)] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-[Plus_Jakarta_Sans] font-bold text-foreground">
                      Admin Dashboard
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Residents", value: "847" },
                      { label: "Verified", value: "623" },
                      { label: "Active", value: "412" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 bg-muted/40 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Activities this week", value: "24", bar: "75%" },
                      { label: "New residents", value: "12", bar: "40%" },
                      { label: "Community posts", value: "38", bar: "60%" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-36 shrink-0">{item.label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(155,45%,32%)] rounded-full" style={{ width: item.bar }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="order-1 lg:order-2">
                <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                  For Community Admins
                </span>
                <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.05]">
                  Manage your community
                  <br />
                  with confidence.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Full admin tools to verify residents, publish announcements,
                  moderate content, manage facilities, and build an active
                  community. Everything your community needs in one platform.
                </p>
                <div className="space-y-3">
                  {[
                    "Resident verification and management",
                    "Official announcements and rules",
                    "Content moderation and reports",
                    "Community analytics and growth tracking",
                    "Facility and contact management",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── For Businesses / Advertising ── */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(38,65%,42%)] mb-4">
                  For Businesses
                </span>
                <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.05]">
                  Reach verified residents
                  <br />
                  in specific communities.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Advertise directly to verified residents of specific
                  communities. Bid for ad slots, run targeted campaigns, and
                  connect with the people most likely to need your services.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Community-specific ad placements",
                    "Auction-based ad marketplace",
                    "Campaign performance analytics",
                    "Community Partner program",
                    "Verified, engaged audience",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(38,65%,42%)] shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="font-semibold border-[hsl(38,65%,42%)]/30 text-[hsl(38,65%,42%)] hover:bg-[hsl(38,50%,92%)]"
                  asChild
                >
                  <Link to="/auth?role=business">
                    Start Advertising
                    <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative">
                <div className="absolute -inset-4 bg-[hsl(38,50%,92%)] rounded-3xl rotate-1" />
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-border/40">
                  <div className="flex items-center gap-3 mb-6">
                    <Megaphone className="w-6 h-6 text-[hsl(38,65%,42%)]" />
                    <p className="font-[Plus_Jakarta_Sans] font-bold text-foreground">
                      Ad Marketplace
                    </p>
                  </div>
                  {[
                    { slot: "Community Banner", community: "Green Valley", bid: "$120/mo", status: "Leading" },
                    { slot: "Newsletter Feature", community: "Sunrise Heights", bid: "$85/mo", status: "Outbid" },
                    { slot: "Event Sponsor", community: "Oak Park", bid: "$200/mo", status: "Won" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.slot}</p>
                        <p className="text-xs text-muted-foreground">{item.community}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{item.bid}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "Won"
                            ? "text-[hsl(155,50%,38%)]"
                            : item.status === "Leading"
                              ? "text-[hsl(38,65%,42%)]"
                              : "text-destructive"
                        }`}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                Simple Pricing
              </span>
              <h2 className="text-4xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-5 text-foreground tracking-[-0.03em] leading-[1.02]">
                Simple, transparent pricing
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <Card className={`h-full rounded-2xl overflow-hidden ${
                  plan.highlighted
                    ? "border-2 border-[hsl(155,45%,32%)] shadow-lg shadow-[hsl(155,45%,32%)]/10"
                    : "border border-border/60 shadow-sm"
                }`}>
                  <CardContent className="p-8">
                    {plan.highlighted && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2.5 py-1 rounded-full mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-[Plus_Jakarta_Sans] font-bold text-xl text-foreground mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      )}
                    </div>
                    <Button
                      className={`w-full mb-6 font-semibold ${
                        plan.highlighted
                          ? "bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)]"
                          : "bg-foreground text-background hover:bg-foreground/90"
                      }`}
                      asChild
                    >
                      <Link to="/auth">{plan.cta}</Link>
                    </Button>
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[hsl(155,50%,38%)] shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Advertising ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="bg-gradient-to-r from-[hsl(210,50%,96%)] to-[hsl(155,45%,96%)] rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(210,55%,42%)] mb-3">
                    For Businesses
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-4">
                    Reach residents where they live
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Advertise directly to verified residential communities through monthly auctioned ad slots. Banner placements, newsletter sponsorships, welcome messages, and more — all targeted by community and location.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-[hsl(210,55%,42%)] text-white hover:bg-[hsl(210,55%,36%)]" asChild>
                      <Link to="/business">
                        Explore Ad Marketplace
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Banner Ads", desc: "Top placement in community feeds" },
                    { label: "Newsletter", desc: "Sponsored community digests" },
                    { label: "Welcome Ads", desc: "First impression for new residents" },
                    { label: "Event Sponsors", desc: "Sponsor community activities" },
                  ].map((slot) => (
                    <Card key={slot.label} className="border-border/40 shadow-sm rounded-xl">
                      <CardContent className="p-4">
                        <p className="font-semibold text-foreground text-sm">{slot.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{slot.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(155,45%,32%)] mb-4">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em]">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <div className="bg-white rounded-2xl shadow-sm border border-border/40 px-6">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Reveal>
            <div className="community-gradient rounded-3xl p-12 lg:p-16 text-white">
              <h2 className="text-3xl sm:text-5xl font-[Plus_Jakarta_Sans] font-extrabold mb-4 tracking-[-0.03em]">
                Your community is waiting.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of residents who are already building active,
                connected communities right where they live.
              </p>
              <Button
                size="lg"
                className="text-base font-semibold px-8 h-13 bg-white text-[hsl(155,45%,32%)] hover:bg-white/90"
                asChild
              >
                <Link to="/find-community">
                  Find My Community
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                The private community platform built around where you live.
              </p>
            </div>
            <div>
              <h4 className="font-[Plus_Jakarta_Sans] font-bold text-sm text-foreground mb-4">
                Product
              </h4>
              <div className="space-y-2.5">
                {([
                  { label: "Find Community", to: "/find-community" },
                  { label: "Activities", to: "/auth" },
                  { label: "Clubs", to: "/auth" },
                  { label: "Sports", to: "/auth" },
                  { label: "Pricing", to: "/#pricing" },
                ]).map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-[Plus_Jakarta_Sans] font-bold text-sm text-foreground mb-4">
                For Communities
              </h4>
              <div className="space-y-2.5">
                {([
                  { label: "Admin Dashboard", to: "/auth" },
                  { label: "Verification", to: "/auth" },
                  { label: "Analytics", to: "/auth" },
                  { label: "Moderation", to: "/auth" },
                  { label: "Community Plans", to: "/#pricing" },
                ]).map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-[Plus_Jakarta_Sans] font-bold text-sm text-foreground mb-4">
                For Business
              </h4>
              <div className="space-y-2.5">
                {([
                  { label: "Advertise", to: "/business" },
                  { label: "Community Partner", to: "/business" },
                  { label: "Campaign Analytics", to: "/business" },
                  { label: "Ad Marketplace", to: "/business" },
                ]).map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 JOINN. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
