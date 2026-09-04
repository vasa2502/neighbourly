import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";
import { AuthProvider } from "@/contexts/AuthContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGate } from "@/components/RoleGate";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import FindCommunity from "./pages/FindCommunity";
import CommunityPreview from "./pages/CommunityPreview";
import CreateCommunity from "./pages/CreateCommunity";
import ClaimCommunity from "./pages/ClaimCommunity";
import Sponsor from "./pages/Sponsor";
import NotFound from "./pages/NotFound";
// Onboarding
import OnboardingVerification from "./pages/onboarding/VerificationMethod";
import OnboardingVerificationPending from "./pages/onboarding/VerificationPending";
import OnboardingVerificationRejected from "./pages/onboarding/VerificationRejected";
import OnboardingProfile from "./pages/onboarding/ProfileSetup";
import OnboardingInterests from "./pages/onboarding/InterestsSelection";
import OnboardingSports from "./pages/onboarding/SportsSetup";
import OnboardingAvailability from "./pages/onboarding/AvailabilitySetup";
import OnboardingPrivacy from "./pages/onboarding/PrivacySetup";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";
// Growth & Referrals
import CommunityGrowth from "./pages/dashboard/CommunityGrowth";
import Referrals from "./pages/dashboard/Referrals";
import Subscription from "./pages/dashboard/Subscription";
// Dashboard pages
import ResidentHome from "./pages/dashboard/ResidentHome";
import Discover from "./pages/dashboard/Discover";
import Activities from "./pages/dashboard/Activities";
import ActivityDetail from "./pages/dashboard/ActivityDetail";
import ActivityJoinConfirmation from "./pages/dashboard/activity/ActivityJoinConfirmation";
import ActivityJoinPending from "./pages/dashboard/activity/ActivityJoinPending";
import ActivityWaitlist from "./pages/dashboard/activity/ActivityWaitlist";
import ActivityParticipants from "./pages/dashboard/activity/ActivityParticipants";
import ActivityChat from "./pages/dashboard/activity/ActivityChat";
import CreateActivity from "./pages/dashboard/activity/CreateActivity";
import ManageActivity from "./pages/dashboard/activity/ManageActivity";
import ActivityFeedback from "./pages/dashboard/activity/ActivityFeedback";
import Clubs from "./pages/dashboard/Clubs";
import ClubDetail from "./pages/dashboard/ClubDetail";
import CreateClub from "./pages/dashboard/clubs/CreateClub";
import ClubMembers from "./pages/dashboard/clubs/ClubMembers";
import Posts from "./pages/dashboard/Posts";
import CreatePost from "./pages/dashboard/CreatePost";
import PostDetail from "./pages/dashboard/posts/PostDetail";
import Messages from "./pages/dashboard/Messages";
import Notifications from "./pages/dashboard/Notifications";
import SettingsPage from "./pages/dashboard/SettingsPage";
// Sports
import SportsHub from "./pages/dashboard/sports/SportsHub";
import PlayerAvailability from "./pages/dashboard/sports/PlayerAvailability";
import LookingForPlayers from "./pages/dashboard/sports/LookingForPlayers";
import TeamFormation from "./pages/dashboard/sports/TeamFormation";
import GameResults from "./pages/dashboard/sports/GameResults";
// Polls & Calendar
import Polls from "./pages/dashboard/polls/Polls";
import CreatePoll from "./pages/dashboard/polls/CreatePoll";
import PollResults from "./pages/dashboard/polls/PollResults";
import CommunityCalendar from "./pages/dashboard/calendar/CommunityCalendar";
// Community Info
import CommunityInfo from "./pages/dashboard/community/CommunityInfo";
import Announcements from "./pages/dashboard/community/Announcements";
import AnnouncementDetail from "./pages/dashboard/community/AnnouncementDetail";
import CommunityRules from "./pages/dashboard/community/CommunityRules";
import Facilities from "./pages/dashboard/community/Facilities";
import Documents from "./pages/dashboard/community/Documents";
import EmergencyContacts from "./pages/dashboard/community/EmergencyContacts";
// Messaging
import ResidentDirectory from "./pages/dashboard/messaging/ResidentDirectory";
import DirectConversation from "./pages/dashboard/messaging/DirectConversation";
// Profile
import MyProfile from "./pages/dashboard/profile/MyProfile";
import EditProfile from "./pages/dashboard/profile/EditProfile";
import MyParticipation from "./pages/dashboard/profile/MyParticipation";
import PrivacySettings from "./pages/dashboard/profile/PrivacySettings";
import AccountSettings from "./pages/dashboard/profile/AccountSettings";
// Premium & Host
import ResidentPlus from "./pages/dashboard/premium/ResidentPlus";
import ResidentPlusBilling from "./pages/dashboard/premium/ResidentPlusBilling";
import HostDashboard from "./pages/dashboard/host/HostDashboard";
import HostAnalytics from "./pages/dashboard/host/HostAnalytics";
import HostPro from "./pages/dashboard/host/HostPro";
// Admin
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import ResidentManagement from "./pages/dashboard/admin/ResidentManagement";
import VerificationQueue from "./pages/dashboard/admin/VerificationQueue";
import AdminActivityManagement from "./pages/dashboard/admin/AdminActivityManagement";
import ModerationQueue from "./pages/dashboard/admin/ModerationQueue";
import CommunityAnalytics from "./pages/dashboard/admin/CommunityAnalytics";
// Billing
import CommunityBilling from "./pages/dashboard/billing/CommunityBilling";
import CommunityPartner from "./pages/dashboard/billing/CommunityPartner";
// Sponsorship
import SponsorCheckout from "./pages/dashboard/sponsor/SponsorCheckout";
import SponsorDashboard from "./pages/dashboard/sponsor/SponsorDashboard";
import AdminSponsorships from "./pages/dashboard/admin/AdminSponsorships";
import SponsorClickRedirect from "./pages/dashboard/sponsor/SponsorClickRedirect";
// Business
import BusinessLanding from "./pages/business/BusinessLanding";
import AdMarketplace from "./pages/business/AdMarketplace";
import CampaignManagement from "./pages/business/CampaignManagement";
// Partner
import PartnerDashboard from "./pages/partner/PartnerDashboard";
// System
import AccessDenied from "./pages/system/AccessDenied";
import VerificationRequired from "./pages/system/VerificationRequired";
import GenericError from "./pages/system/GenericError";
import SuspendedAccount from "./pages/system/SuspendedAccount";
import NotificationPreferences from "./pages/dashboard/settings/NotificationPreferences";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (
  <ConvexProvider client={convex}>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="app-theme">
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SmoothScroll />
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/find-community" element={<FindCommunity />} />
            <Route path="/community/:id" element={<CommunityPreview />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/claim-community" element={<ClaimCommunity />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/sponsor/click/:sponsorshipId" element={<SponsorClickRedirect />} />
            {/* ── Business ── */}
            <Route path="/business" element={<BusinessLanding />} />
            {/* ── System pages ── */}
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/verification-required" element={<VerificationRequired />} />
            <Route path="/error" element={<GenericError />} />
            <Route path="/suspended" element={<SuspendedAccount />} />
            {/* ── Onboarding ── */}
            <Route path="/onboarding/verification" element={<ProtectedRoute><OnboardingVerification /></ProtectedRoute>} />
            <Route path="/onboarding/pending" element={<ProtectedRoute><OnboardingVerificationPending /></ProtectedRoute>} />
            <Route path="/onboarding/rejected" element={<ProtectedRoute><OnboardingVerificationRejected /></ProtectedRoute>} />
            <Route path="/onboarding/profile" element={<ProtectedRoute><OnboardingProfile /></ProtectedRoute>} />
            <Route path="/onboarding/interests" element={<ProtectedRoute><OnboardingInterests /></ProtectedRoute>} />
            <Route path="/onboarding/sports" element={<ProtectedRoute><OnboardingSports /></ProtectedRoute>} />
            <Route path="/onboarding/availability" element={<ProtectedRoute><OnboardingAvailability /></ProtectedRoute>} />
            <Route path="/onboarding/privacy" element={<ProtectedRoute><OnboardingPrivacy /></ProtectedRoute>} />
            <Route path="/onboarding/complete" element={<ProtectedRoute><OnboardingComplete /></ProtectedRoute>} />
            {/* ── Dashboard (protected) ── */}
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/home" replace /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <CommunityProvider>
                <DashboardLayout>
                  <Routes>
                    <Route path="home" element={<ResidentHome />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="activities/create" element={<CreateActivity />} />
                    <Route path="activities/:id" element={<ActivityDetail />} />
                    <Route path="activities/:id/join" element={<ActivityJoinConfirmation />} />
                    <Route path="activities/:id/pending" element={<ActivityJoinPending />} />
                    <Route path="activities/:id/waitlist" element={<ActivityWaitlist />} />
                    <Route path="activities/:id/participants" element={<ActivityParticipants />} />
                    <Route path="activities/:id/chat" element={<ActivityChat />} />
                    <Route path="activities/:id/manage" element={<ManageActivity />} />
                    <Route path="activities/:id/feedback" element={<ActivityFeedback />} />
                    <Route path="clubs" element={<Clubs />} />
                    <Route path="clubs/create" element={<CreateClub />} />
                    <Route path="clubs/:id" element={<ClubDetail />} />
                    <Route path="clubs/:id/members" element={<ClubMembers />} />
                    <Route path="clubs/:id/activities" element={<ClubDetail />} />
                    <Route path="clubs/:id/discussion" element={<ClubDetail />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="posts/create" element={<CreatePost />} />
                    <Route path="posts/giveaway" element={<CreatePost />} />
                    <Route path="posts/lost-found" element={<CreatePost />} />
                    <Route path="posts/:id" element={<PostDetail />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="messages/direct" element={<DirectConversation />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="growth" element={<CommunityGrowth />} />
                    <Route path="referrals" element={<Referrals />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="settings/notifications" element={<NotificationPreferences />} />
                    <Route path="settings/privacy" element={<PrivacySettings />} />
                    <Route path="settings/account" element={<AccountSettings />} />
                    <Route path="profile" element={<MyProfile />} />
                    <Route path="profile/edit" element={<EditProfile />} />
                    <Route path="profile/participation" element={<MyParticipation />} />
                    <Route path="sports" element={<SportsHub />} />
                    <Route path="sports/players" element={<PlayerAvailability />} />
                    <Route path="sports/looking" element={<LookingForPlayers />} />
                    <Route path="sports/teams" element={<TeamFormation />} />
                    <Route path="sports/results" element={<GameResults />} />
                    <Route path="polls" element={<Polls />} />
                    <Route path="polls/create" element={<CreatePoll />} />
                    <Route path="polls/:id/results" element={<PollResults />} />
                    <Route path="calendar" element={<CommunityCalendar />} />
                    <Route path="community" element={<CommunityInfo />} />
                    <Route path="community/announcements" element={<Announcements />} />
                    <Route path="community/announcements/:id" element={<AnnouncementDetail />} />
                    <Route path="community/documents" element={<Documents />} />
                    <Route path="community/rules" element={<CommunityRules />} />
                    <Route path="community/facilities" element={<Facilities />} />
                    <Route path="community/contacts" element={<EmergencyContacts />} />
                    <Route path="directory" element={<ResidentDirectory />} />
                    <Route path="premium" element={<ResidentPlus />} />
                    <Route path="premium/billing" element={<ResidentPlusBilling />} />
                    <Route path="host" element={<HostDashboard />} />
                    <Route path="host/analytics" element={<HostAnalytics />} />
                    <Route path="host/pro" element={<HostPro />} />
                    <Route path="admin" element={<RoleGate allowedRoles={["admin"]}><AdminDashboard /></RoleGate>} />
                    <Route path="admin/residents" element={<RoleGate allowedRoles={["admin"]}><ResidentManagement /></RoleGate>} />
                    <Route path="admin/verification" element={<RoleGate allowedRoles={["admin"]}><VerificationQueue /></RoleGate>} />
                    <Route path="admin/activities" element={<RoleGate allowedRoles={["admin"]}><AdminActivityManagement /></RoleGate>} />
                    <Route path="admin/moderation" element={<RoleGate allowedRoles={["admin", "moderator"]}><ModerationQueue /></RoleGate>} />
                    <Route path="admin/sponsorships" element={<RoleGate allowedRoles={["admin"]}><AdminSponsorships /></RoleGate>} />
                    <Route path="admin/announcements" element={<RoleGate allowedRoles={["admin"]}><Announcements /></RoleGate>} />
                    <Route path="admin/analytics" element={<RoleGate allowedRoles={["admin"]}><CommunityAnalytics /></RoleGate>} />
                    <Route path="billing" element={<CommunityBilling />} />
                    <Route path="billing/partner" element={<CommunityPartner />} />
                    <Route path="marketplace" element={<AdMarketplace />} />
                    <Route path="sponsor" element={<ProtectedRoute><SponsorCheckout /></ProtectedRoute>} />
                    <Route path="sponsor/dashboard" element={<ProtectedRoute><SponsorDashboard /></ProtectedRoute>} />
                    <Route path="campaigns" element={<CampaignManagement />} />
                    <Route path="partner" element={<PartnerDashboard />} />
                  </Routes>
                </DashboardLayout>
                </CommunityProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
  </ConvexProvider>
);
export default App;
