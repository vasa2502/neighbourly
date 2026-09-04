import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Communities ───
  communities: defineTable({
    name: v.string(),
    type: v.string(), // apartment | gated | villa | street | neighborhood
    area: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    postalCode: v.optional(v.string()),
    description: v.optional(v.string()),
    approximateResidents: v.optional(v.number()),
    buildings: v.optional(v.array(v.string())),
    founderId: v.string(),
    adminId: v.optional(v.string()),
    verified: v.boolean(),
    status: v.string(), // active | pending | suspended
    residentCount: v.number(),
    verifiedResidentCount: v.number(),
    invitationCode: v.optional(v.string()),
    coordinates: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    createdAt: v.number(),
  })
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_area", { searchField: "area" })
    .searchIndex("search_city", { searchField: "city" })
    .index("by_status", ["status"])
    .index("by_city", ["city"])
    .index("by_founderId", ["founderId"]),

  // ─── User Profiles ───
  user_profiles: defineTable({
    _id: v.string(), // matches Convex auth userId
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    building: v.optional(v.string()),
    floor: v.optional(v.string()),
    interests: v.array(v.string()),
    sports: v.array(
      v.object({
        name: v.string(),
        skill: v.string(),
        format: v.string(),
      })
    ),
    availability: v.optional(
      v.object({
        times: v.array(v.string()),
        days: v.array(v.string()),
      })
    ),
    privacy: v.optional(v.any()), // Record<string, number>
    referralCode: v.string(),
    referralCredits: v.number(),
    subscription: v.optional(
      v.object({
        tier: v.string(),
        billingCycle: v.optional(v.string()),
        expiresAt: v.optional(v.string()),
        credits: v.number(),
        country: v.string(),
      })
    ),
    country: v.string(),
    notificationPrefs: v.optional(v.any()), // Record<string, { enabled: boolean; push: boolean }>
    onboardingCompleted: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"]),

  // ─── Community Memberships ───
  community_memberships: defineTable({
    userId: v.string(),
    communityId: v.string(),
    role: v.string(), // resident | founder | admin | moderator | host
    verified: v.boolean(),
    verificationStatus: v.string(), // none | pending | approved | rejected
    verificationMethod: v.optional(v.string()),
    joinedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    status: v.string(), // active | suspended
    suspensionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_community", ["communityId"])
    .index("by_user_community", ["userId", "communityId"]),

  // ─── Activities ───
  activities: defineTable({
    communityId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    date: v.string(),
    time: v.string(),
    endTime: v.optional(v.string()),
    location: v.string(),
    maxParticipants: v.number(),
    currentParticipants: v.number(),
    hostId: v.string(),
    skillLevel: v.optional(v.string()),
    format: v.optional(v.string()),
    isFree: v.boolean(),
    price: v.optional(v.number()),
    status: v.string(), // active | cancelled | completed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_host", ["hostId"])
    .index("by_community_status", ["communityId", "status"])
    .index("by_community_category", ["communityId", "category"]),

  // ─── Activity Participants ───
  activity_participants: defineTable({
    activityId: v.string(),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_activity", ["activityId"])
    .index("by_user", ["userId"])
    .index("by_activity_user", ["activityId", "userId"]),

  // ─── Activity Messages (Chat) ───
  activity_messages: defineTable({
    activityId: v.string(),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_activity", ["activityId"]),

  // ─── Activity Feedback ───
  activity_feedback: defineTable({
    activityId: v.string(),
    userId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_activity", ["activityId"]),

  // ─── Clubs ───
  clubs: defineTable({
    communityId: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    memberCount: v.number(),
    createdBy: v.string(),
    status: v.string(), // active | inactive
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_createdBy", ["createdBy"]),

  // ─── Club Members ───
  club_members: defineTable({
    clubId: v.string(),
    userId: v.string(),
    role: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_user", ["userId"])
    .index("by_club_user", ["clubId", "userId"]),

  // ─── Posts ───
  posts: defineTable({
    communityId: v.string(),
    authorId: v.string(),
    type: v.string(), // ask | help | offer | looking_for | recommendation | discussion | interest | lost_found | buy_sell | urgent
    title: v.string(),
    body: v.string(),
    images: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    likes: v.optional(v.array(v.string())),
    status: v.string(), // active | resolved | expired | removed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_community_type", ["communityId", "type"])
    .index("by_author", ["authorId"]),

  // ─── Post Comments ───
  post_comments: defineTable({
    postId: v.string(),
    authorId: v.string(),
    body: v.string(),
    parentId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  // ─── Conversations ───
  conversations: defineTable({
    communityId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Conversation Members ───
  conversation_members: defineTable({
    conversationId: v.string(),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  // ─── Messages ───
  messages: defineTable({
    conversationId: v.string(),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),

  // ─── Notifications ───
  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  // ─── Referrals ───
  referrals: defineTable({
    referrerId: v.string(),
    referredEmail: v.string(),
    referredUserId: v.optional(v.string()),
    communityId: v.optional(v.string()),
    type: v.string(), // existing_resident | new_community
    status: v.string(), // pending | verified | credited | expired
    creditAmount: v.number(),
    createdAt: v.number(),
    creditedAt: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referredEmail", ["referredEmail"])
    .index("by_referrer_date", ["referrerId", "createdAt"]),

  // ─── Subscriptions ───
  subscriptions: defineTable({
    userId: v.string(),
    tier: v.string(), // free | resident_plus | host_pro | community_partner
    status: v.string(), // active | canceled | past_due
    billingCycle: v.optional(v.string()), // monthly | annual
    stripeSubscriptionId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ─── Verification Requests ───
  verification_requests: defineTable({
    userId: v.string(),
    communityId: v.string(),
    method: v.string(), // invite_code | invitation | email | admin_approval | proof | address
    status: v.string(), // pending | approved | rejected
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    data: v.any(), // Record<string, string>
    rejectionReason: v.optional(v.string()),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"])
    .index("by_community_status", ["communityId", "status"]),

  // ─── Polls ───
  polls: defineTable({
    communityId: v.string(),
    creatorId: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    anonymous: v.boolean(),
    status: v.string(), // active | closed
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Poll Votes ───
  poll_votes: defineTable({
    pollId: v.string(),
    userId: v.string(),
    optionIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_poll", ["pollId"])
    .index("by_poll_user", ["pollId", "userId"]),

  // ─── Announcements ───
  announcements: defineTable({
    communityId: v.string(),
    authorId: v.string(),
    title: v.string(),
    body: v.string(),
    pinned: v.boolean(),
    status: v.string(), // active | archived
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Community Rules ───
  community_rules: defineTable({
    communityId: v.string(),
    title: v.string(),
    description: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Community Documents ───
  community_documents: defineTable({
    communityId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    type: v.string(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Community Facilities ───
  community_facilities: defineTable({
    communityId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    hours: v.optional(v.string()),
    rules: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Community Contacts ───
  community_contacts: defineTable({
    communityId: v.string(),
    name: v.string(),
    type: v.string(), // emergency | maintenance | management
    phone: v.string(),
    email: v.optional(v.string()),
    available24x7: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Moderation Reports ───
  moderation_reports: defineTable({
    communityId: v.string(),
    reporterId: v.string(),
    targetType: v.string(), // post | comment | user
    targetId: v.string(),
    reason: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // pending | resolved | dismissed
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_community_status", ["communityId", "status"]),

  // ─── Player Availability ───
  player_availability: defineTable({
    userId: v.string(),
    communityId: v.string(),
    sport: v.string(),
    dayOfWeek: v.string(),
    timeStart: v.string(),
    timeEnd: v.string(),
    skillLevel: v.optional(v.string()),
    notes: v.optional(v.string()),
    isAvailable: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_user_community", ["userId", "communityId"]),

  // ─── Ad Slots (legacy marketplace) ───
  ad_slots: defineTable({
    communityId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    size: v.string(),
    basePrice: v.number(),
    currentBid: v.optional(v.number()),
    currentBidderId: v.optional(v.string()),
    sellerId: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"]),

  // ─── Ad Bids ───
  ad_bids: defineTable({
    slotId: v.string(),
    userId: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slot", ["slotId"]),

  // ─── Ad Campaigns ───
  ad_campaigns: defineTable({
    advertiserId: v.string(),
    slotId: v.string(),
    communityId: v.string(),
    name: v.string(),
    budget: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    creativeUrl: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    status: v.string(),
    impressions: v.number(),
    clicks: v.number(),
    leads: v.number(),
    createdAt: v.number(),
  })
    .index("by_advertiser", ["advertiserId"])
    .index("by_community", ["communityId"]),

  // ─── Ad Campaign Analytics ───
  ad_campaign_analytics: defineTable({
    campaignId: v.string(),
    date: v.string(),
    impressions: v.number(),
    clicks: v.number(),
    leads: v.number(),
  })
    .index("by_campaign", ["campaignId"]),

  // ─── Push Subscriptions ───
  push_subscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // ─── Community Claims ───
  community_claims: defineTable({
    communityId: v.string(),
    claimantId: v.string(),
    organizationName: v.string(),
    roleTitle: v.string(),
    evidence: v.string(),
    status: v.string(), // pending | approved | rejected
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_community", ["communityId"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════
  // SPONSORSHIP / ADVERTISING SYSTEM
  // ═══════════════════════════════════════════════

  // ─── Sponsor Profiles (advertisers) ───
  sponsor_profiles: defineTable({
    userId: v.string(),
    companyName: v.string(),
    contactEmail: v.string(),
    websiteUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ─── Sponsorship Placements (configurable ad positions) ───
  sponsor_placements: defineTable({
    slug: v.string(), // e.g. "app_left_rail", "app_right_rail"
    name: v.string(), // e.g. "Left Rail"
    description: v.optional(v.string()),
    position: v.string(), // left_rail | right_rail | inline_mobile | homepage
    price: v.number(), // $299 / 30 days
    durationDays: v.number(), // 30
    maxSlots: v.number(), // total slots for this placement
    active: v.boolean(),
    communityId: v.optional(v.string()), // null = global placement
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_community", ["communityId"]),

  // ─── Sponsorships (the core entity) ───
  sponsorships: defineTable({
    sponsorId: v.string(), // sponsor_profiles._id
    userId: v.string(), // the user who purchased
    placementId: v.string(), // sponsor_placements._id
    // Advertiser content
    companyName: v.string(),
    headline: v.optional(v.string()),
    description: v.string(),
    ctaText: v.string(),
    ctaUrl: v.string(),
    logoUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    promoMessage: v.optional(v.string()),
    // Lifecycle
    status: v.string(), // draft | pending_payment | paid | pending_review | approved | active | paused | expired | cancelled | rejected
    price: v.number(),
    currency: v.string(),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    // Payment
    autoRenew: v.boolean(),
    stripeSubscriptionId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    // Admin notes
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sponsor", ["sponsorId"])
    .index("by_placement", ["placementId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // ─── Sponsor Payments ───
  sponsor_payments: defineTable({
    sponsorshipId: v.string(),
    userId: v.string(),
    provider: v.string(), // stripe
    providerPaymentId: v.optional(v.string()),
    providerSubscriptionId: v.optional(v.string()),
    amount: v.number(), // cents
    currency: v.string(),
    status: v.string(), // succeeded | pending | failed | refunded
    paymentType: v.string(), // initial | renewal | refund
    createdAt: v.number(),
  })
    .index("by_sponsorship", ["sponsorshipId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ─── Sponsor Events (analytics) ───
  sponsor_events: defineTable({
    sponsorshipId: v.string(),
    eventType: v.string(), // impression | click
    page: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_sponsorship", ["sponsorshipId"])
    .index("by_sponsorship_type", ["sponsorshipId", "eventType"])
    .index("by_created", ["createdAt"]),

  // ─── Sponsor Waitlist (notify when slot opens) ───
  sponsor_waitlist: defineTable({
    email: v.string(),
    companyName: v.optional(v.string()),
    placementSlug: v.optional(v.string()),
    notified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),
});
