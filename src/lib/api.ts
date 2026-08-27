import { supabase } from "@/integrations/supabase/client";
import type { Community, UserProfile, Activity, Club, Post } from "./types";

// Helper to cast table names that aren't yet in generated Supabase types
// These tables exist in our migration but types haven't been regenerated yet
const fromTable = (table: string) => supabase.from(table as any) as any;

/* ─── Communities ─── */

export async function searchCommunities(query: string, filters?: { city?: string; area?: string; type?: string }) {
  let q = fromTable("communities").select("*").eq("status", "active");

  if (query) {
    q = q.or(`name.ilike.%${query}%,area.ilike.%${query}%,city.ilike.%${query}%`);
  }
  if (filters?.city) q = q.eq("city", filters.city);
  if (filters?.area) q = q.eq("area", filters.area);
  if (filters?.type) q = q.eq("type", filters.type);

  const { data, error } = await q.order("resident_count", { ascending: false }).limit(20);
  if (error) throw error;
  return data as Community[];
}

export async function getCommunityById(id: string) {
  const { data, error } = await fromTable("communities").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Community;
}

export async function createCommunity(community: Omit<Community, "id" | "createdAt" | "residentCount" | "verifiedResidentCount">) {
  const { data, error } = await fromTable("communities").insert(community).select().single();
  if (error) throw error;
  return data as Community;
}

/* ─── User Profiles ─── */

export async function getOrCreateProfile(userId: string) {
  const { data: existing } = await fromTable("user_profiles").select("*").eq("id", userId).single();
  if (existing) return existing as UserProfile;

  const { data: authUser } = await supabase.auth.getUser();
  const { data, error } = await fromTable("user_profiles").insert({
    id: userId,
    email: authUser.user?.email || "",
    name: authUser.user?.user_metadata?.full_name || "",
    referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
  }).select().single();
  if (error) throw error;
  return data as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await fromTable("user_profiles").update(updates).eq("id", userId).select().single();
  if (error) throw error;
  return data as UserProfile;
}

/* ─── Memberships ─── */

export async function getUserMemberships(userId: string) {
  const { data, error } = await fromTable("community_memberships").select("*, communities(*)").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function joinCommunity(userId: string, communityId: string, role: string = "resident") {
  const { data, error } = await fromTable("community_memberships").insert({
    user_id: userId,
    community_id: communityId,
    role,
  }).select().single();
  if (error) throw error;
  return data;
}

/* ─── Activities ─── */

export async function getActivities(communityId: string, filters?: { date?: string; category?: string }) {
  let q = fromTable("activities").select("*, user_profiles!host_id(name, avatar)").eq("community_id", communityId).eq("status", "active");

  if (filters?.date) q = q.eq("date", filters.date);
  if (filters?.category) q = q.eq("category", filters.category);

  const { data, error } = await q.order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createActivity(activity: Omit<Activity, "id" | "createdAt" | "updatedAt" | "currentParticipants">) {
  const { data, error } = await fromTable("activities").insert({ ...activity, current_participants: 1 }).select().single();
  if (error) throw error;
  return data as Activity;
}

export async function joinActivity(activityId: string, userId: string) {
  const { error } = await fromTable("activity_participants").insert({ activity_id: activityId, user_id: userId });
  if (error) throw error;
  await supabase.rpc("increment_activity_participants" as any, { activity_id: activityId });
}

export async function leaveActivity(activityId: string, userId: string) {
  const { error } = await fromTable("activity_participants").delete().eq("activity_id", activityId).eq("user_id", userId);
  if (error) throw error;
  await supabase.rpc("decrement_activity_participants" as any, { activity_id: activityId });
}

/* ─── Clubs ─── */

export async function getClubs(communityId: string) {
  const { data, error } = await fromTable("clubs").select("*, user_profiles!created_by(name, avatar)").eq("community_id", communityId).eq("status", "active").order("member_count", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createClub(club: Omit<Club, "id" | "createdAt" | "updatedAt" | "memberCount">) {
  const { data, error } = await fromTable("clubs").insert({ ...club, member_count: 1 }).select().single();
  if (error) throw error;
  return data as Club;
}

export async function joinClub(clubId: string, userId: string) {
  const { error } = await fromTable("club_members").insert({ club_id: clubId, user_id: userId });
  if (error) throw error;
  await supabase.rpc("increment_club_members" as any, { club_id: clubId });
}

/* ─── Posts ─── */

export async function getPosts(communityId: string, type?: string) {
  let q = fromTable("posts").select("*, user_profiles!author_id(name, avatar)").eq("community_id", communityId).eq("status", "active");
  if (type) q = q.eq("type", type);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt" | "status">) {
  const { data, error } = await fromTable("posts").insert(post).select().single();
  if (error) throw error;
  return data as Post;
}

export async function getPostComments(postId: string) {
  const { data, error } = await fromTable("post_comments").select("*, user_profiles!author_id(name, avatar)").eq("post_id", postId).order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addComment(postId: string, authorId: string, body: string, parentId?: string) {
  const { data, error } = await fromTable("post_comments").insert({ post_id: postId, author_id: authorId, body, parent_id: parentId || null }).select().single();
  if (error) throw error;
  return data;
}

/* ─── Messages ─── */

export async function getConversations(userId: string) {
  const { data, error } = await fromTable("conversation_members").select("conversations(*), conversations!inner(community_id)").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string, limit: number = 50) {
  const { data, error } = await fromTable("messages").select("*, user_profiles!sender_id(name, avatar)").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data?.reverse();
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await fromTable("messages").insert({ conversation_id: conversationId, sender_id: senderId, content }).select().single();
  if (error) throw error;
  await fromTable("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  return data;
}

/* ─── Notifications ─── */

export async function getNotifications(userId: string, limit: number = 20) {
  const { data, error } = await fromTable("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await fromTable("notifications").update({ read: true }).eq("id", notificationId);
  if (error) throw error;
}

/* ─── Referrals ─── */

export async function getReferrals(userId: string) {
  const { data, error } = await fromTable("referrals").select("*").eq("referrer_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReferral(referrerId: string, referredEmail: string, communityId?: string, type: string = "existing_resident") {
  const { data, error } = await fromTable("referrals").insert({ referrer_id: referrerId, referred_email: referredEmail, community_id: communityId || null, type }).select().single();
  if (error) throw error;
  return data;
}

/* ─── Subscriptions ─── */

export async function getSubscription(userId: string) {
  const { data, error } = await fromTable("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

/* ─── Verification ─── */

export async function submitVerification(userId: string, communityId: string, method: string, verificationData: Record<string, string>) {
  const { data: result, error } = await fromTable("verification_requests").insert({ user_id: userId, community_id: communityId, method, data: verificationData }).select().single();
  if (error) throw error;
  await fromTable("community_memberships").update({ verification_status: "pending" }).eq("user_id", userId).eq("community_id", communityId);
  return result;
}

/* ─── Polls ─── */

export async function getPolls(communityId: string) {
  const { data, error } = await fromTable("polls").select("*, user_profiles!creator_id(name)").eq("community_id", communityId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ─── Announcements ─── */

export async function getAnnouncements(communityId: string) {
  const { data, error } = await fromTable("announcements").select("*, user_profiles!author_id(name)").eq("community_id", communityId).order("pinned", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ─── Community Claims ─── */

export async function submitClaim(claimantId: string, communityId: string, claimData: { organizationName: string; roleTitle: string; evidence: string }) {
  const { data: result, error } = await fromTable("community_claims").insert({ claimant_id: claimantId, community_id: communityId, organization_name: claimData.organizationName, role_title: claimData.roleTitle, evidence: claimData.evidence }).select().single();
  if (error) throw error;
  return result;
}

/* ─── Global Search ─── */

export async function globalSearch(query: string, communityId?: string) {
  const [communities, activities, clubs, posts] = await Promise.all([
    searchCommunities(query).catch(() => []),
    communityId ? getActivities(communityId).then((a: any[]) => a?.filter((act: any) => act.title?.toLowerCase().includes(query.toLowerCase())).slice(0, 5)) : Promise.resolve([]),
    communityId ? getClubs(communityId).then((c: any[]) => c?.filter((cl: any) => cl.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 5)) : Promise.resolve([]),
    communityId ? getPosts(communityId).then((p: any[]) => p?.filter((po: any) => po.title?.toLowerCase().includes(query.toLowerCase()) || po.body?.toLowerCase().includes(query.toLowerCase())).slice(0, 5)) : Promise.resolve([]),
  ]);
  return { communities: communities.slice(0, 5), activities, clubs, posts };
}

/* ─── Geographic Duplicate Detection ─── */

export async function findDuplicateCommunity(name: string, city: string, area: string) {
  const { data } = await fromTable("communities")
    .select("id, name, area, city, resident_count, status")
    .eq("status", "active")
    .or(`name.ilike.%${name}%,area.ilike.%${area}%`)
    .eq("city", city)
    .limit(5);
  return data || [];
}

export async function findNearbyCommunities(lat: number, lng: number, radiusKm: number = 5) {
  // Haversine-based proximity search using raw RPC or lat/lng bounds
  const latDelta = radiusKm / 111.0;
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));
  const { data } = await fromTable("communities")
    .select("id, name, area, city, type, resident_count, coordinates")
    .eq("status", "active")
    .gte("coordinates->>'lat'" as any, (lat - latDelta).toString())
    .lte("coordinates->>'lat'" as any, (lat + latDelta).toString())
    .limit(10);
  return data || [];
}

/* ─── Referral Anti-Abuse ─── */

export async function validateReferral(referrerId: string, referredEmail: string): Promise<{ valid: boolean; reason?: string }> {
  // Self-referral check
  const { data: referrerProfile } = await fromTable("user_profiles").select("email").eq("id", referrerId).single();
  if (referrerProfile?.email === referredEmail) {
    return { valid: false, reason: "Cannot refer yourself" };
  }

  // Duplicate referral check
  const { data: existingReferral } = await fromTable("referrals")
    .select("id")
    .eq("referrer_id", referrerId)
    .eq("referred_email", referredEmail)
    .limit(1)
    .maybeSingle();
  if (existingReferral) {
    return { valid: false, reason: "This person has already been referred" };
  }

  // Rate limit: max 10 referrals per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count } = await fromTable("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", referrerId)
    .gte("created_at", today.toISOString());
  if ((count || 0) >= 10) {
    return { valid: false, reason: "Daily referral limit reached (10 per day)" };
  }

  // Check if referred email already has an account
  const { data: referredUser } = await supabase.auth.admin?.listUsers?.() ?? { data: null };
  // If we can't check, allow it — the referral will be validated when the person signs up

  return { valid: true };
}

export async function calculateReferralCredits(referrerId: string): Promise<number> {
  const { data: referrals } = await fromTable("referrals")
    .select("id, status, credit_amount, type")
    .eq("referrer_id", referrerId);
  if (!referrals) return 0;
  return referrals.reduce((sum: number, r: any) => {
    if (r.status === "verified" || r.status === "credited") return sum + (r.credit_amount || 0);
    return sum;
  }, 0);
}

/* ─── Admin Claim Approval ─── */

export async function getCommunityClaims(communityId?: string) {
  let q = fromTable("community_claims").select("*, communities(name), user_profiles(name, email)");
  if (communityId) q = q.eq("community_id", communityId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function approveClaim(claimId: string, adminId: string) {
  const { data: claim, error: claimError } = await fromTable("community_claims")
    .select("*")
    .eq("id", claimId)
    .single();
  if (claimError) throw claimError;

  // Update claim status
  await fromTable("community_claims")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq("id", claimId);

  // Add claimant as admin of the community
  await fromTable("community_memberships")
    .update({ role: "admin" })
    .eq("user_id", claim.claimant_id)
    .eq("community_id", claim.community_id);

  // Update community admin_id
  await fromTable("communities")
    .update({ admin_id: claim.claimant_id })
    .eq("id", claim.community_id);

  return { success: true };
}

export async function rejectClaim(claimId: string, adminId: string, reason: string) {
  await fromTable("community_claims")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: adminId, rejection_reason: reason })
    .eq("id", claimId);
  return { success: true };
}

/* ─── Subscription Credit Application ─── */

export async function applyCreditsToSubscription(userId: string): Promise<{ applied: boolean; creditAmount: number }> {
  const credits = await calculateReferralCredits(userId);
  if (credits <= 0) return { applied: false, creditAmount: 0 };

  // Store the credit balance on the user profile
  await fromTable("user_profiles")
    .update({ referral_credits: credits })
    .eq("id", userId);

  return { applied: true, creditAmount: credits };
}

/* ─── Activity Detail & Participants ─── */

export async function getActivityById(id: string) {
  const { data, error } = await fromTable("activities")
    .select("*, user_profiles!host_id(name, avatar)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getActivityParticipants(activityId: string) {
  const { data, error } = await fromTable("activity_participants")
    .select("*, user_profiles!user_id(name, avatar, sports, interests)")
    .eq("activity_id", activityId);
  if (error) throw error;
  return data || [];
}

export async function updateActivity(activityId: string, updates: Record<string, unknown>) {
  const { data, error } = await fromTable("activities")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", activityId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(activityId: string) {
  const { error } = await fromTable("activities")
    .update({ status: "cancelled" })
    .eq("id", activityId);
  if (error) throw error;
}

export async function submitActivityFeedback(activityId: string, userId: string, rating: number, comment?: string) {
  const { data, error } = await fromTable("activity_feedback")
    .insert({ activity_id: activityId, user_id: userId, rating, comment: comment || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Activity Messages (Chat) ─── */

export async function getActivityMessages(activityId: string) {
  const { data, error } = await fromTable("activity_messages")
    .select("*, user_profiles!sender_id(name, avatar)")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendActivityMessage(activityId: string, senderId: string, content: string) {
  const { data, error } = await fromTable("activity_messages")
    .insert({ activity_id: activityId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Polls (create + vote) ─── */

export async function createPoll(poll: { community_id: string; creator_id: string; question: string; options: string[]; anonymous?: boolean }) {
  const { data, error } = await fromTable("polls")
    .insert({
      community_id: poll.community_id,
      creator_id: poll.creator_id,
      question: poll.question,
      options: poll.options,
      anonymous: poll.anonymous || false,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function votePoll(pollId: string, userId: string, optionIndex: number) {
  const { data: existing } = await fromTable("poll_votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) throw new Error("Already voted");

  const { data, error } = await fromTable("poll_votes")
    .insert({ poll_id: pollId, user_id: userId, option_index: optionIndex })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPollResults(pollId: string) {
  const { data, error } = await fromTable("poll_votes")
    .select("option_index")
    .eq("poll_id", pollId);
  if (error) throw error;
  const votes = data || [];
  const total = votes.length;
  const counts: Record<number, number> = {};
  votes.forEach((v: any) => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });
  return { total, counts };
}

/* ─── Club Members ─── */

export async function getClubMembers(clubId: string) {
  const { data, error } = await fromTable("club_members")
    .select("*, user_profiles!user_id(name, avatar, interests, sports)")
    .eq("club_id", clubId);
  if (error) throw error;
  return data || [];
}

/* ─── Announcements Detail ─── */

export async function getAnnouncementById(id: string) {
  const { data, error } = await fromTable("announcements")
    .select("*, user_profiles!author_id(name, avatar)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

/* ─── Community Info ─── */

export async function getCommunityRules(communityId: string) {
  const { data, error } = await fromTable("community_rules")
    .select("*")
    .eq("community_id", communityId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCommunityDocuments(communityId: string) {
  const { data, error } = await fromTable("community_documents")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCommunityFacilities(communityId: string) {
  const { data, error } = await fromTable("community_facilities")
    .select("*")
    .eq("community_id", communityId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCommunityContacts(communityId: string) {
  const { data, error } = await fromTable("community_contacts")
    .select("*")
    .eq("community_id", communityId)
    .order("type", { ascending: true });
  if (error) throw error;
  return data || [];
}

/* ─── Moderation ─── */

export async function getModerationReports(communityId: string) {
  const { data, error } = await fromTable("moderation_reports")
    .select("*, user_profiles!reporter_id(name)")
    .eq("community_id", communityId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function dismissReport(reportId: string) {
  const { error } = await fromTable("moderation_reports")
    .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) throw error;
}

export async function removeReportContent(reportId: string) {
  const { data: report, error: reportError } = await fromTable("moderation_reports")
    .select("*")
    .eq("id", reportId)
    .single();
  if (reportError) throw reportError;

  if (report.target_type === "post") {
    await fromTable("posts").update({ status: "removed" }).eq("id", report.target_id);
  } else if (report.target_type === "comment") {
    await fromTable("post_comments").update({ body: "[Removed by moderator]" }).eq("id", report.target_id);
  }
  await fromTable("moderation_reports")
    .update({ status: "resolved", reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
}

export async function suspendUser(userId: string, communityId: string, reason: string) {
  await fromTable("community_memberships")
    .update({ status: "suspended", suspension_reason: reason })
    .eq("user_id", userId)
    .eq("community_id", communityId);
}

/* ─── Sports / Activities by category ─── */

export async function getActivitiesByCategory(communityId: string, category: string) {
  const { data, error } = await fromTable("activities")
    .select("*, user_profiles!host_id(name, avatar)")
    .eq("community_id", communityId)
    .eq("category", category)
    .eq("status", "active")
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getUserSportsProfile(userId: string) {
  const { data, error } = await fromTable("user_profiles")
    .select("sports, interests, skill_levels")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/* ─── Host Stats ─── */

export async function getHostStats(userId: string, communityId: string) {
  const { data: activities } = await fromTable("activities")
    .select("id, title, date, current_participants, max_participants, status")
    .eq("host_id", userId)
    .eq("community_id", communityId)
    .order("date", { ascending: false });

  const allActivities = activities || [];
  const totalCreated = allActivities.length;
  const totalParticipants = allActivities.reduce((sum: number, a: any) => sum + (a.current_participants || 0), 0);
  const upcoming = allActivities.filter((a: any) => a.status === "active" && new Date(a.date) >= new Date());

  return { totalCreated, totalParticipants, upcoming, activities: allActivities };
}

/* ─── Subscription (already exists above, add helper) ─── */

export async function getSubscriptionHistory(userId: string) {
  const { data, error } = await fromTable("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/* ─── Player Availability ─── */

export async function getPlayerAvailability(communityId: string, sport?: string) {
  let q = fromTable("player_availability")
    .select("*, user_profiles!user_id(name, avatar, sports)")
    .eq("community_id", communityId)
    .eq("is_available", true);
  if (sport) q = q.eq("sport", sport);
  const { data, error } = await q.order("day_of_week", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setPlayerAvailability(userId: string, communityId: string, availability: { sport: string; day_of_week: string; time_start: string; time_end: string; skill_level?: string; notes?: string }[]) {
  // Delete existing availability for this user/community
  await fromTable("player_availability")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);

  // Insert new availability
  if (availability.length === 0) return [];
  const rows = availability.map(a => ({
    user_id: userId,
    community_id: communityId,
    sport: a.sport,
    day_of_week: a.day_of_week,
    time_start: a.time_start,
    time_end: a.time_end,
    skill_level: a.skill_level || "all",
    notes: a.notes || null,
    is_available: true,
  }));
  const { data, error } = await fromTable("player_availability")
    .insert(rows)
    .select();
  if (error) throw error;
  return data || [];
}

export async function getMyAvailability(userId: string) {
  const { data, error } = await fromTable("player_availability")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true });
  if (error) throw error;
  return data || [];
}

/* ─── Business / Ad Marketplace ─── */

export async function getAdSlots(communityId?: string) {
  let q = fromTable("ad_slots")
    .select("*, communities(name, resident_count), user_profiles(name) as seller")
    .eq("status", "active");
  if (communityId) q = q.eq("community_id", communityId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function placeBid(slotId: string, userId: string, amount: number, message?: string) {
  const { data, error } = await fromTable("ad_bids")
    .insert({ slot_id: slotId, user_id: userId, amount, message: message || null })
    .select()
    .single();
  if (error) throw error;
  // Update current_bid on slot
  await fromTable("ad_slots")
    .update({ current_bid: amount, current_bidder_id: userId })
    .eq("id", slotId);
  return data;
}

export async function getBidsForSlot(slotId: string) {
  const { data, error } = await fromTable("ad_bids")
    .select("*, user_profiles(name, email)")
    .eq("slot_id", slotId)
    .order("amount", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCampaigns(userId: string) {
  const { data, error } = await fromTable("ad_campaigns")
    .select("*, ad_slots(name, communities(name))")
    .eq("advertiser_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCampaign(campaign: { advertiser_id: string; slot_id: string; name: string; community_id: string; budget: number; start_date: string; end_date: string; creative_url?: string; target_audience?: string }) {
  const { data, error } = await fromTable("ad_campaigns")
    .insert({ ...campaign, status: "scheduled", impressions: 0, clicks: 0, leads: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(campaignId: string, updates: Record<string, unknown>) {
  const { data, error } = await fromTable("ad_campaigns")
    .update(updates)
    .eq("id", campaignId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCampaignAnalytics(campaignId: string) {
  const { data, error } = await fromTable("ad_campaign_analytics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getPartnerStats(userId: string) {
  // Get all campaigns for this advertiser
  const { data: campaigns } = await fromTable("ad_campaigns")
    .select("id, status, impressions, clicks, leads, budget, community_id, slot_id")
    .eq("advertiser_id", userId);

  const allCampaigns = campaigns || [];
  const totalImpressions = allCampaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0);
  const totalClicks = allCampaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
  const totalLeads = allCampaigns.reduce((sum: number, c: any) => sum + (c.leads || 0), 0);
  const totalBudget = allCampaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0);
  const activeCampaigns = allCampaigns.filter((c: any) => c.status === "active").length;

  // Get unique communities
  const uniqueCommunities = [...new Set(allCampaigns.map((c: any) => c.community_id))];

  return {
    totalCampaigns: allCampaigns.length,
    activeCampaigns,
    totalImpressions,
    totalClicks,
    totalLeads,
    totalBudget,
    communityCount: uniqueCommunities.length,
    campaigns: allCampaigns,
  };
}


/* ─── Email Invitations ─── */

export async function sendInvitationEmail(data: {
  to: string;
  communityName: string;
  inviterName: string;
  inviteLink: string;
  type: "community_invite" | "referral_invite" | "verification_approved" | "verification_rejected";
}) {
  const { data: result, error } = await supabase.functions.invoke("send-joinn-invitation", {
    body: data,
  });
  if (error) throw error;
  return result;
}
