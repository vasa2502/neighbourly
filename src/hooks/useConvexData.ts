import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { api } from "../../convex/_generated/api";

/* ═══════════════════════════════════════════
   Auth-aware helpers
   ═══════════════════════════════════════════ */
function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

function useActiveCommunityId() {
  const { communityId } = useCommunity();
  return communityId;
}

/** Wrap a Convex mutation to provide isPending + mutate/mutateAsync with callbacks */
function useConvexMutation(mutationFn: any) {
  const [isPending, setIsPending] = useState(false);
  const rawMutate = useMutation(mutationFn);

  const mutateAsync = useCallback(async (args: any) => {
    setIsPending(true);
    try {
      const result = await rawMutate(args);
      return result;
    } finally {
      setIsPending(false);
    }
  }, [rawMutate]);

  const mutate = useCallback((args: any, options?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
    setIsPending(true);
    rawMutate(args)
      .then((result: any) => { setIsPending(false); options?.onSuccess?.(); return result; })
      .catch((err: any) => { setIsPending(false); options?.onError?.(err); });
  }, [rawMutate]);

  return { mutateAsync, mutate, isPending };
}

/** Unwrap paginated Convex results — returns data array or empty array */
function unwrapPaginated(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "data" in result) return result.data || [];
  return [];
}

/* ═══════════════════════════════════════════
   USER PROFILE HOOKS
   ═══════════════════════════════════════════ */
export function useProfile() {
  const userId = useUserId();
  const data = useQuery(api.users.get, userId ? { userId } : "skip");
  return { data, isLoading: data === undefined && !!userId };
}

export function useUpdateProfile() {
  return useConvexMutation(api.users.update);
}

/* ═══════════════════════════════════════════
   COMMUNITY HOOKS
   ═══════════════════════════════════════════ */
export function useSearchCommunities(query: string, filters?: { city?: string; area?: string; type?: string }) {
  const data = useQuery(
    api.communities.search,
    query.length >= 2 ? { query, city: filters?.city } : "skip"
  );
  return { data: data || [], isLoading: data === undefined };
}

export function useCommunityDetail(id: string) {
  const data = useQuery(api.communities.get, id ? { communityId: id } : "skip");
  return { data, isLoading: data === undefined && !!id };
}

export function useCreateCommunity() {
  return useConvexMutation(api.communities.create);
}

export function useUserMemberships() {
  const userId = useUserId();
  const data = useQuery(api.memberships.getUserMemberships, userId ? { userId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!userId };
}

export function useJoinCommunity() {
  return useConvexMutation(api.memberships.join);
}

/* ═══════════════════════════════════════════
   ACTIVITY HOOKS
   ═══════════════════════════════════════════ */
export function useActivities(communityId: string, filters?: { date?: string; category?: string }) {
  const raw = useQuery(api.activities.list, communityId ? { communityId, date: filters?.date, category: filters?.category } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

export function useActivityDetail(id: string) {
  const isValidId = id.includes(":");
  const data = useQuery(api.activities.get, isValidId ? { activityId: id } : "skip");
  return { data, isLoading: data === undefined && isValidId };
}

export function useCreateActivity() {
  return useConvexMutation(api.activities.create);
}

export function useJoinActivity() {
  return useConvexMutation(api.activities.join);
}

export function useLeaveActivity() {
  return useConvexMutation(api.activities.leave);
}

export function useUpdateActivity() {
  return useConvexMutation(api.activities.update);
}

export function useDeleteActivity() {
  return useConvexMutation(api.activities.remove);
}

export function useActivityParticipants(activityId: string) {
  const isValidId = activityId.includes(":");
  const raw = useQuery(api.activities.participants, isValidId ? { activityId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && isValidId };
}

export function useSubmitActivityFeedback() {
  return useConvexMutation(api.activities.submitFeedback);
}

export function useActivityMessages(activityId: string) {
  const data = useQuery(api.activities.messages, activityId ? { activityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!activityId };
}

export function useSendActivityMessage() {
  return useConvexMutation(api.activities.sendMessage);
}

export function useActivitiesByCategory(communityId: string, category: string) {
  const raw = useQuery(api.activities.listByCategory, communityId && category ? { communityId, category } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined };
}

/* ═══════════════════════════════════════════
   CLUB HOOKS
   ═══════════════════════════════════════════ */
export function useClubs(communityId: string) {
  const raw = useQuery(api.clubs.list, communityId ? { communityId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

export function useCreateClub() {
  return useConvexMutation(api.clubs.create);
}

export function useJoinClub() {
  return useConvexMutation(api.clubs.join);
}

export function useClubMembers(clubId: string) {
  const data = useQuery(api.clubs.members, clubId ? { clubId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!clubId };
}

/* ═══════════════════════════════════════════
   POST HOOKS
   ═══════════════════════════════════════════ */
export function usePosts(communityId: string, type?: string) {
  const raw = useQuery(api.posts.list, communityId ? { communityId, type } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

export function usePostDetail(postId: string) {
  const isValidId = postId.includes(":");
  const data = useQuery(api.posts.get, isValidId ? { postId } : "skip");
  return { data, isLoading: data === undefined && isValidId };
}

export function useCreatePost() {
  return useConvexMutation(api.posts.create);
}

export function usePostComments(postId: string) {
  const isValidId = postId.includes(":");
  const data = useQuery(api.posts.comments, isValidId ? { postId } : "skip");
  return { data: data || [], isLoading: data === undefined && isValidId };
}

export function useAddComment() {
  return useConvexMutation(api.posts.addComment);
}

export function usePostLikeStatus(postId: string, userId?: string) {
  const isValidId = postId.includes(":");
  const data = useQuery(
    api.posts.getLikeStatus,
    isValidId ? { postId, userId: userId || undefined } : "skip"
  );
  return { liked: data?.liked ?? false, likeCount: data?.likeCount ?? 0 };
}

export function useToggleLike() {
  return useConvexMutation(api.posts.toggleLike);
}

/* ═══════════════════════════════════════════
   MESSAGE HOOKS
   ═══════════════════════════════════════════ */
export function useConversations() {
  const userId = useUserId();
  const raw = useQuery(api.messages.conversations, userId ? { userId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!userId };
}

export function useMessages(conversationId: string) {
  const raw = useQuery(api.messages.messages, conversationId ? { conversationId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!conversationId };
}

export function useSendMessage() {
  return useConvexMutation(api.messages.send);
}

/* ═══════════════════════════════════════════
   NOTIFICATION HOOKS
   ═══════════════════════════════════════════ */
export function useNotifications() {
  const userId = useUserId();
  const data = useQuery(api.notifications.list, userId ? { userId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!userId };
}

export function useMarkNotificationRead() {
  return useConvexMutation(api.notifications.markRead);
}

/* ═══════════════════════════════════════════
   POLL HOOKS
   ═══════════════════════════════════════════ */
export function usePolls(communityId: string) {
  const raw = useQuery(api.polls.list, communityId ? { communityId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

export function useCreatePoll() {
  return useConvexMutation(api.polls.create);
}

export function useVotePoll() {
  return useConvexMutation(api.polls.vote);
}

export function useClosePoll() {
  return useConvexMutation(api.polls.close);
}

export function usePollResults(pollId: string) {
  const data = useQuery(api.polls.results, pollId ? { pollId } : "skip");
  return { data: data || { total: 0, counts: {} }, isLoading: data === undefined && !!pollId };
}

/* ═══════════════════════════════════════════
   ANNOUNCEMENT HOOKS
   ═══════════════════════════════════════════ */
export function useAnnouncements(communityId: string) {
  const raw = useQuery(api.announcements.list, communityId ? { communityId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

export function useAnnouncementDetail(id: string) {
  const data = useQuery(api.announcements.get, id ? { announcementId: id } : "skip");
  return { data, isLoading: data === undefined && !!id };
}

export function useCreateAnnouncement() {
  return useConvexMutation(api.announcements.create);
}

/* ═══════════════════════════════════════════
   COMMUNITY INFO HOOKS
   ═══════════════════════════════════════════ */
export function useCommunityRules(communityId: string) {
  const data = useQuery(api.communityInfo.getRules, communityId ? { communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useCommunityDocuments(communityId: string) {
  const data = useQuery(api.communityInfo.getDocuments, communityId ? { communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useCommunityFacilities(communityId: string) {
  const data = useQuery(api.communityInfo.getFacilities, communityId ? { communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useCommunityContacts(communityId: string) {
  const data = useQuery(api.communityInfo.getContacts, communityId ? { communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

/* ═══════════════════════════════════════════
   PEOPLE DIRECTORY
   ═══════════════════════════════════════════ */
export function useCommunityMembers(communityId: string) {
  const raw = useQuery(api.memberships.getCommunityMembers, communityId ? { communityId } : "skip");
  return { data: unwrapPaginated(raw), isLoading: raw === undefined && !!communityId };
}

/* ═══════════════════════════════════════════
   USER ROLE
   ═══════════════════════════════════════════ */
export function useUserRole() {
  const userId = useUserId();
  const communityId = useActiveCommunityId();
  const membership = useQuery(api.memberships.getMembership, userId && communityId ? { userId, communityId } : "skip");
  if (!membership) return { data: { role: "resident" as const, verified: false, verificationStatus: "none" as const } };
  return {
    data: {
      role: (membership.role || "resident") as "resident" | "founder" | "admin" | "moderator" | "host",
      verified: membership.verified || false,
      verificationStatus: (membership.verificationStatus || "none") as "none" | "pending" | "approved" | "rejected",
    },
    isLoading: false,
  };
}

/* ═══════════════════════════════════════════
   VERIFICATION
   ═══════════════════════════════════════════ */
export function useSubmitVerification() {
  return useConvexMutation(api.verification.submit);
}

export function useVerificationStatus(communityId: string) {
  const userId = useUserId();
  const data = useQuery(api.verification.getStatus, userId && communityId ? { userId, communityId } : "skip");
  return { data, isLoading: data === undefined };
}

/* ═══════════════════════════════════════════
   REFERRALS
   ═══════════════════════════════════════════ */
export function useReferrals() {
  const userId = useUserId();
  const data = useQuery(api.referrals.list, userId ? { referrerId: userId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!userId };
}

export function useCreateReferral() {
  return useConvexMutation(api.referrals.create);
}

export function useReferralCredits() {
  const userId = useUserId();
  const data = useQuery(api.referrals.getCredits, userId ? { userId } : "skip");
  return { data: data || { totalCredits: 0, pendingReferrals: 0, completedReferrals: 0 }, isLoading: data === undefined };
}

/* ═══════════════════════════════════════════
   SUBSCRIPTIONS
   ═══════════════════════════════════════════ */
export function useSubscription() {
  const userId = useUserId();
  const data = useQuery(api.subscriptions.get, userId ? { userId } : "skip");
  return { data, isLoading: data === undefined && !!userId };
}

/* ═══════════════════════════════════════════
   MODERATION
   ═══════════════════════════════════════════ */
export function useModerationReports(communityId: string) {
  const data = useQuery(api.moderation.list, communityId ? { communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useDismissReport() {
  return useConvexMutation(api.moderation.dismiss);
}

export function useRemoveReportContent() {
  return useConvexMutation(api.moderation.removeContent);
}

export function useSuspendUser() {
  return useConvexMutation(api.moderation.suspendUser);
}

/* ═══════════════════════════════════════════
   SPORTS
   ═══════════════════════════════════════════ */
export function usePlayerAvailability(communityId: string, sport?: string) {
  const data = useQuery(api.sports.getAvailability, communityId ? { communityId, sport } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useMyAvailability() {
  const userId = useUserId();
  const communityId = useActiveCommunityId();
  const data = useQuery(api.sports.getMyAvailability, userId && communityId ? { userId, communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!userId };
}

export function useSetPlayerAvailability() {
  return useConvexMutation(api.sports.setAvailability);
}

/* ═══════════════════════════════════════════
   ADS / MARKETPLACE (legacy)
   ═══════════════════════════════════════════ */
export function useAdSlots(communityId?: string) {
  const data = useQuery(api.ads.getSlots, { communityId: communityId || "" });
  return { data: data || [], isLoading: data === undefined };
}

export function usePlaceBid() {
  return useConvexMutation(api.ads.placeBid);
}

export function useBidsForSlot(slotId: string) {
  const data = useQuery(api.ads.getBids, slotId ? { slotId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!slotId };
}

export function useCampaigns() {
  const communityId = useActiveCommunityId();
  const data = useQuery(api.ads.getCampaigns, communityId ? { advertiserId: communityId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!communityId };
}

export function useCreateCampaign() {
  return useConvexMutation(api.ads.createCampaign);
}

export function useUpdateCampaign() {
  return useConvexMutation(api.ads.updateCampaign);
}

export function usePartnerStats() {
  const communityId = useActiveCommunityId();
  const data = useQuery(api.ads.getPartnerStats, communityId ? { communityId } : "skip");
  return { data: data || { totalSlots: 0, activeSlots: 0, totalRevenue: 0, totalCampaigns: 0, activeCampaigns: 0, totalImpressions: 0, totalClicks: 0 }, isLoading: data === undefined };
}

/* ═══════════════════════════════════════════
   CLAIMS
   ═══════════════════════════════════════════ */
export function useSubmitClaim() {
  return useConvexMutation(api.claims.submit);
}

export function useCommunityClaims() {
  const data = useQuery(api.claims.list, {});
  return { data: data || [], isLoading: data === undefined };
}

export function useApproveClaim() {
  return useConvexMutation(api.claims.approve);
}

export function useRejectClaim() {
  return useConvexMutation(api.claims.reject);
}

/* ═══════════════════════════════════════════
   HOST STATS
   ═══════════════════════════════════════════ */
export function useHostStats(communityId: string) {
  const userId = useUserId();
  const raw = useQuery(api.activities.list, userId && communityId ? { communityId } : "skip");
  const allActivities = unwrapPaginated(raw);
  const myActivities = allActivities.filter((a: any) => a.hostId === userId);
  return {
    data: {
      totalCreated: myActivities.length,
      totalParticipants: myActivities.reduce((s: number, a: any) => s + (a.currentParticipants || 0), 0),
      upcoming: myActivities.filter((a: any) => a.status === "active"),
      activities: myActivities,
    },
    isLoading: raw === undefined,
  };
}

/* ═══════════════════════════════════════════
   USER SPORTS PROFILE
   ═══════════════════════════════════════════ */
export function useUserSportsProfile() {
  const userId = useUserId();
  const data = useQuery(api.users.get, userId ? { userId } : "skip");
  return { data: data ? { sports: data.sports, interests: data.interests } : null, isLoading: data === undefined && !!userId };
}

/* ═══════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════ */
export function useHasSeedData() {
  const data = useQuery(api.seed.hasSeedData, {});
  return { data: data ?? false, isLoading: data === undefined };
}

export function useSeedDemoCommunity() {
  return useConvexMutation(api.seed.seedDemoCommunity);
}

/* ═══════════════════════════════════════════
   TYPING INDICATORS
   ═══════════════════════════════════════════ */
export function useTypingUsers(conversationId: string) {
  const userId = useUserId();
  const data = useQuery(api.typing.getTypingUsers, conversationId && userId ? { conversationId, currentUserId: userId } : "skip");
  return { data: data || [], isLoading: data === undefined };
}

export function useSetTyping() {
  return useConvexMutation(api.typing.setTyping);
}

export function useActivityTypingUsers(activityId: string) {
  const userId = useUserId();
  const data = useQuery(api.typing.getActivityTypingUsers, activityId && userId ? { activityId, currentUserId: userId } : "skip");
  return { data: data || [], isLoading: data === undefined };
}

export function useSetActivityTyping() {
  return useConvexMutation(api.typing.setActivityTyping);
}

/* ═══════════════════════════════════════════
   GLOBAL SEARCH
   ═══════════════════════════════════════════ */
export function useGlobalSearch(searchQuery: string, communityId?: string) {
  const communities = useQuery(api.communities.search, searchQuery.length >= 2 ? { query: searchQuery } : "skip");
  const rawActivities = useQuery(api.activities.list, communityId ? { communityId } : "skip");
  const rawClubs = useQuery(api.clubs.list, communityId ? { communityId } : "skip");
  const rawPosts = useQuery(api.posts.list, communityId ? { communityId } : "skip");
  const term = searchQuery.toLowerCase();
  const activities = unwrapPaginated(rawActivities);
  const clubs = unwrapPaginated(rawClubs);
  const posts = unwrapPaginated(rawPosts);
  return {
    data: {
      communities: (communities || []).slice(0, 5),
      activities: activities.filter((a: any) => a.title?.toLowerCase().includes(term)).slice(0, 5),
      clubs: clubs.filter((c: any) => c.name?.toLowerCase().includes(term)).slice(0, 5),
      posts: posts.filter((p: any) => p.title?.toLowerCase().includes(term) || p.body?.toLowerCase().includes(term)).slice(0, 5),
    },
    isLoading: communities === undefined,
  };
}

/* ═══════════════════════════════════════════
   FIND DUPLICATE / NEARBY
   ═══════════════════════════════════════════ */
export function useFindDuplicates(name: string, city: string, area: string) {
  const data = useQuery(api.communities.findDuplicates, name && city && area ? { name, city, area } : "skip");
  return { data: data || [], isLoading: data === undefined };
}

export function useFindNearby(lat: number, lng: number) {
  const data = useQuery(api.communities.findNearby, lat && lng ? { lat, lng, radius: 50 } : "skip");
  return { data: data || [], isLoading: data === undefined };
}

/* ═══════════════════════════════════════════
   NOTIFICATION PREFERENCES
   ═══════════════════════════════════════════ */
export function useNotificationPrefs() {
  const { data } = useProfile();
  return { data: (data as any)?.notificationPrefs || null };
}

export function useSaveNotificationPrefs() {
  return useConvexMutation(api.users.update);
}

/* ═══════════════════════════════════════════
   ATTENDANCE
   ═══════════════════════════════════════════ */
export function useCheckIn() {
  return useConvexMutation(api.attendance.checkIn);
}

export function useAttendance(activityId: string) {
  const data = useQuery(api.attendance.getAttendance, activityId ? { activityId } : "skip");
  return { data, isLoading: data === undefined && !!activityId };
}

/* ═══════════════════════════════════════════
   REPORT CONTENT (MODERATION)
   ═══════════════════════════════════════════ */
export function useReportContent() {
  return useConvexMutation(api.moderation.create);
}

/* ═══════════════════════════════════════════
   COMMUNITY INFO CREATE HOOKS
   ═══════════════════════════════════════════ */
export function useCreateRule() {
  return useConvexMutation(api.communityInfo.createRule);
}

export function useCreateDocument() {
  return useConvexMutation(api.communityInfo.createDocument);
}

export function useCreateFacility() {
  return useConvexMutation(api.communityInfo.createFacility);
}

export function useCreateContact() {
  return useConvexMutation(api.communityInfo.createContact);
}

/* ═══════════════════════════════════════════
   AD SLOT CREATION
   ═══════════════════════════════════════════ */
export function useCreateAdSlot() {
  return useConvexMutation(api.ads.createSlot);
}

/* ═══════════════════════════════════════════
   SUBSCRIPTION HISTORY
   ═══════════════════════════════════════════ */
export function useSubscriptionHistory() {
  const userId = useUserId();
  const data = useQuery(api.subscriptions.getHistory, userId ? { userId } : "skip");
  return { data, isLoading: data === undefined && !!userId };
}

/* ═══════════════════════════════════════════
   USER GET-OR-CREATE (signup flow)
   ═══════════════════════════════════════════ */
export function useGetOrCreateUser() {
  return useConvexMutation(api.users.getOrCreate);
}

/** Automatically create a Convex user profile on first sign-in */
export function useEnsureUserProfile() {
  const { user } = useAuth();
  const getOrCreate = useGetOrCreateUser();
  const [ensured, setEnsured] = useState(false);

  useEffect(() => {
    if (user && !ensured) {
      setEnsured(true);
      getOrCreate.mutateAsync({
        userId: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      }).catch(() => {
        // Profile may already exist — that's fine
      });
    }
  }, [user, ensured, getOrCreate]);
}

/* ═══════════════════════════════════════════
   SPONSORSHIP HOOKS
   ═══════════════════════════════════════════ */

/** Get all active placements */
export function useSponsorPlacements() {
  const data = useQuery(api.sponsorships.getPlacements, {});
  return { data: data || [], isLoading: data === undefined };
}

/** Get placement availability */
export function usePlacementAvailability(placementId: string) {
  const data = useQuery(api.sponsorships.getPlacementAvailability, placementId ? { placementId } : "skip");
  return { data, isLoading: data === undefined && !!placementId };
}

/** Seed default placements (admin) */
export function useSeedPlacements() {
  return useConvexMutation(api.sponsorships.seedPlacements);
}

/** Get sponsor profile */
export function useSponsorProfile() {
  const userId = useUserId();
  const data = useQuery(api.sponsorships.getSponsorProfile, userId ? { userId } : "skip");
  return { data, isLoading: data === undefined && !!userId };
}

/** Upsert sponsor profile */
export function useUpsertSponsorProfile() {
  return useConvexMutation(api.sponsorships.upsertSponsorProfile);
}

/** Create sponsorship */
export function useCreateSponsorship() {
  return useConvexMutation(api.sponsorships.createSponsorship);
}

/** Update sponsorship */
export function useUpdateSponsorship() {
  return useConvexMutation(api.sponsorships.updateSponsorship);
}

/** Get my sponsorships */
export function useMySponsorships() {
  const userId = useUserId();
  const data = useQuery(api.sponsorships.getMySponsorships, userId ? { userId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!userId };
}

/** Get sponsorship detail */
export function useSponsorshipDetail(sponsorshipId: string) {
  const data = useQuery(api.sponsorships.getSponsorship, sponsorshipId ? { sponsorshipId } : "skip");
  return { data, isLoading: data === undefined && !!sponsorshipId };
}

/** Get active sponsors for a placement (for ad rails) */
export function useActiveSponsors(placementSlug: string) {
  const data = useQuery(api.sponsorships.getActiveByPlacement, { placementSlug });
  return { data: data || [], isLoading: data === undefined };
}

/** Admin: approve sponsorship */
export function useApproveSponsorship() {
  return useConvexMutation(api.sponsorships.approve);
}

/** Admin: reject sponsorship */
export function useRejectSponsorship() {
  return useConvexMutation(api.sponsorships.reject);
}

/** Admin: pause sponsorship */
export function usePauseSponsorship() {
  return useConvexMutation(api.sponsorships.pause);
}

/** Admin: resume sponsorship */
export function useResumeSponsorship() {
  return useConvexMutation(api.sponsorships.resume);
}

/** Admin: get all sponsorships with stats */
export function useAdminSponsorships() {
  const data = useQuery(api.sponsorships.adminGetAll, {});
  return { data, isLoading: data === undefined };
}

/** Sponsor: cancel auto-renew */
export function useCancelAutoRenew() {
  return useConvexMutation(api.sponsorships.cancelAutoRenew);
}

/** Sponsor: cancel sponsorship */
export function useCancelSponsorship() {
  return useConvexMutation(api.sponsorships.cancelSponsorship);
}

/** Record payment */
export function useRecordPayment() {
  return useConvexMutation(api.sponsorships.recordPayment);
}

/** Record failed payment */
export function useRecordFailedPayment() {
  return useConvexMutation(api.sponsorships.recordFailedPayment);
}

/** Track sponsor event */
export function useTrackSponsorEvent() {
  return useConvexMutation(api.sponsorships.trackEvent);
}

/** Get sponsorship analytics */
export function useSponsorAnalytics(sponsorshipId: string) {
  const data = useQuery(api.sponsorships.getAnalytics, sponsorshipId ? { sponsorshipId } : "skip");
  return { data, isLoading: data === undefined && !!sponsorshipId };
}

/** Fetch website metadata from a URL */
export function useFetchWebsiteMetadata() {
  const rawAction = useAction(api.sponsorActions.fetchWebsiteMetadata);
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (args: { url: string }) => {
    setIsPending(true);
    try {
      const result = await rawAction(args);
      return result;
    } finally {
      setIsPending(false);
    }
  }, [rawAction]);

  return { mutateAsync, isPending };
}

/** Auto-expire stale sponsorships */
export function useExpireStaleSponsorships() {
  return useConvexMutation(api.sponsorships.expireStale);
}

/** Get sponsorship payments */
export function useSponsorPayments(sponsorshipId: string) {
  const data = useQuery(api.sponsorships.getPayments, sponsorshipId ? { sponsorshipId } : "skip");
  return { data: data || [], isLoading: data === undefined && !!sponsorshipId };
}

// ═══════════════════════════════════════════════
// SPONSOR PAGE (public)
// ═══════════════════════════════════════════════

/** Public stats for the sponsor landing page */
export function useSponsorPublicStats() {
  const data = useQuery(api.sponsorships.getPublicStats, {});
  return { data: data || { totalUsers: 0, activeSponsorships: 0, totalSponsors: 0, totalImpressions: 0, totalClicks: 0, countriesRepresented: 0 }, isLoading: data === undefined };
}

/** Per-slot availability for the sponsor page */
export function useSlotAvailability() {
  const data = useQuery(api.sponsorships.getSlotAvailability, {});
  return { data: data || [], isLoading: data === undefined };
}

/** Waitlist count */
export function useWaitlistCount() {
  const data = useQuery(api.sponsorships.getWaitlistCount, {});
  return data ?? 0;
}

/** Join the waitlist */
export function useJoinWaitlist() {
  return useConvexMutation(api.sponsorships.joinWaitlist);
}

/** Track a sponsor click */
export function useTrackSponsorClick() {
  return useConvexMutation(api.sponsorships.trackClick);
}

/** Admin: create placement */
export function useCreatePlacement() {
  return useConvexMutation(api.sponsorships.createPlacement);
}

/** Admin: update placement */
export function useUpdatePlacement() {
  return useConvexMutation(api.sponsorships.updatePlacement);
}

/** Admin: delete placement */
export function useDeletePlacement() {
  return useConvexMutation(api.sponsorships.deletePlacement);
}

/** Admin: end a sponsorship early */
export function useEndSponsorship() {
  return useConvexMutation(api.sponsorships.endSponsorship);
}

/** Admin: extend an active sponsorship */
export function useExtendSponsorship() {
  return useConvexMutation(api.sponsorships.extendSponsorship);
}
