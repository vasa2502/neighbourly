import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// ═══════════════════════════════════════════════
// PLACEMENTS
// ═══════════════════════════════════════════════

/** Get all active placements */
export const getPlacements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sponsor_placements")
      .filter((q: any) => q.eq(q.field("active"), true))
      .collect();
  },
});

/** Get placement by slug */
export const getPlacementBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsor_placements")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
  },
});

/** Get availability for a placement: total slots - active/pending sponsorships */
export const getPlacementAvailability = query({
  args: { placementId: v.string() },
  handler: async (ctx, args) => {
    const placement = await ctx.db.get(args.placementId as any);
    if (!placement) return { total: 0, available: 0, nextAvailable: null };

    const activeSponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_placement", (q: any) => q.eq("placementId", args.placementId))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "pending_review"),
          q.eq(q.field("status"), "paid")
        )
      )
      .collect();

    const p = placement as any;
    const total = p.maxSlots;
    const used = activeSponsorships.length;
    const available = Math.max(0, total - used);

    // Find next expiry if fully booked
    let nextAvailable: number | null = null;
    if (available === 0) {
      const sorted = activeSponsorships
        .filter((s: any) => s.endsAt)
        .sort((a: any, b: any) => (a.endsAt || 0) - (b.endsAt || 0));
      if (sorted.length > 0) {
        nextAvailable = sorted[0].endsAt;
      }
    }

    return { total, available, nextAvailable };
  },
});

/** Seed default placements (admin only) */
export const seedPlacements = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults = [
      { slug: "app_left_rail", name: "Left Rail", description: "Left sidebar sponsorship", position: "left_rail", price: 29900, durationDays: 30, maxSlots: 5, active: true },
      { slug: "app_right_rail", name: "Right Rail", description: "Right sidebar sponsorship", position: "right_rail", price: 29900, durationDays: 30, maxSlots: 5, active: true },
    ];

    const now = Date.now();
    for (const p of defaults) {
      const existing = await ctx.db
        .query("sponsor_placements")
        .withIndex("by_slug", (q: any) => q.eq("slug", p.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("sponsor_placements", { ...p, createdAt: now });
      }
    }
    return { success: true };
  },
});

// ═══════════════════════════════════════════════
// SPONSOR PROFILES
// ═══════════════════════════════════════════════

/** Get or create sponsor profile */
export const getSponsorProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsor_profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsertSponsorProfile = mutation({
  args: {
    userId: v.string(),
    companyName: v.string(),
    contactEmail: v.string(),
    websiteUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    if (!args.companyName.trim()) throw new Error("Company name is required");
    if (!args.contactEmail.trim()) throw new Error("Contact email is required");

    const existing = await ctx.db
      .query("sponsor_profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        companyName: args.companyName.trim(),
        contactEmail: args.contactEmail.trim(),
        websiteUrl: args.websiteUrl,
        logoUrl: args.logoUrl,
        phone: args.phone,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("sponsor_profiles", {
        userId: args.userId,
        companyName: args.companyName.trim(),
        contactEmail: args.contactEmail.trim(),
        websiteUrl: args.websiteUrl,
        logoUrl: args.logoUrl,
        phone: args.phone,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// ═══════════════════════════════════════════════
// SPONSORSHIPS
// ═══════════════════════════════════════════════

/** Create a new sponsorship (starts as draft/pending_payment) */
export const createSponsorship = mutation({
  args: {
    userId: v.string(),
    placementId: v.string(),
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
    autoRenew: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    if (!args.companyName.trim()) throw new Error("Company name is required");
    if (!args.description.trim()) throw new Error("Description is required");
    if (!args.ctaText.trim()) throw new Error("CTA text is required");
    if (!args.ctaUrl.trim()) throw new Error("CTA URL is required");
    if (!isValidUrl(args.ctaUrl)) throw new Error("CTA URL is not valid");

    // Check placement exists and has availability
    const placementDoc = await ctx.db.get(args.placementId as any);
    if (!placementDoc) throw new Error("Placement not found");
    const placement = placementDoc as any;
    if (!placement.active) throw new Error("Placement is not active");

    const activeCount = await ctx.db
      .query("sponsorships")
      .withIndex("by_placement", (q: any) => q.eq("placementId", args.placementId))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "pending_review"),
          q.eq(q.field("status"), "paid")
        )
      )
      .collect();

    if (activeCount.length >= (placement as any).maxSlots) {
      throw new Error("No slots available for this placement");
    }

    // Get or create sponsor profile
    let sponsorProfile = await ctx.db
      .query("sponsor_profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();
    if (!sponsorProfile) {
      const sponsorId = await ctx.db.insert("sponsor_profiles", {
        userId: args.userId,
        companyName: args.companyName.trim(),
        contactEmail: "", 
        websiteUrl: args.websiteUrl,
        logoUrl: args.logoUrl,
        createdAt: now,
        updatedAt: now,
      });
      sponsorProfile = await ctx.db.get(sponsorId);
    }

    const sponsorshipId = await ctx.db.insert("sponsorships", {
      sponsorId: sponsorProfile!._id,
      userId: args.userId,
      placementId: args.placementId,
      companyName: args.companyName.trim(),
      headline: args.headline,
      description: args.description.trim(),
      ctaText: args.ctaText.trim(),
      ctaUrl: args.ctaUrl.trim(),
      logoUrl: args.logoUrl,
      websiteUrl: args.websiteUrl,
      category: args.category,
      discountCode: args.discountCode,
      promoMessage: args.promoMessage,
      status: "pending_payment",
      price: placement.price,
      currency: "USD",
      autoRenew: args.autoRenew,
      createdAt: now,
      updatedAt: now,
    });

    return sponsorshipId;
  },
});

/** Update sponsorship content (admin or owner, before going live) */
export const updateSponsorship = mutation({
  args: {
    sponsorshipId: v.string(),
    userId: v.string(),
    headline: v.optional(v.string()),
    description: v.optional(v.string()),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    promoMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.userId !== args.userId) throw new Error("Not your sponsorship");

    if (args.ctaUrl && !isValidUrl(args.ctaUrl)) throw new Error("CTA URL is not valid");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.headline !== undefined) updates.headline = args.headline;
    if (args.description !== undefined) updates.description = args.description;
    if (args.ctaText !== undefined) updates.ctaText = args.ctaText;
    if (args.ctaUrl !== undefined) updates.ctaUrl = args.ctaUrl;
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;
    if (args.discountCode !== undefined) updates.discountCode = args.discountCode;
    if (args.promoMessage !== undefined) updates.promoMessage = args.promoMessage;

    // If active sponsorship is edited, put back in review
    if (sponsorship.status === "active") {
      updates.status = "pending_review";
    }

    await ctx.db.patch(sponsorship._id, updates);
    return { success: true };
  },
});

/** Get active sponsorships for a placement (for ad rails) */
export const getActiveByPlacement = query({
  args: { placementSlug: v.string() },
  handler: async (ctx, args) => {
    const placement = await ctx.db
      .query("sponsor_placements")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.placementSlug))
      .first();
    if (!placement) return [];

    const now = Date.now();
    const sponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_placement", (q: any) => q.eq("placementId", placement._id))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    // Filter by date range
    return sponsorships.filter((s: any) => {
      if (s.startsAt && s.startsAt > now) return false;
      if (s.endsAt && s.endsAt < now) return false;
      return true;
    });
  },
});

/** Get all sponsorships (for public sponsor page) */
export const getAllSponsorships = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sponsorships").collect();
  },
});

/** Get user's sponsorships */
export const getMySponsorships = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsorships")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();
  },
});

/** Get sponsorship details */
export const getSponsorship = query({
  args: { sponsorshipId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sponsorshipId as any);
  },
});

/** Admin: approve sponsorship */
export const approve = mutation({
  args: { sponsorshipId: v.string(), userId: v.string(), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.status !== "pending_review" && sponsorship.status !== "paid") {
      throw new Error("Sponsorship is not pending review");
    }

    const now = Date.now();
    const placementDoc = await ctx.db.get(sponsorship.placementId as any);
    const durationDays = (placementDoc as any)?.durationDays || 30;

    await ctx.db.patch(sponsorship._id, {
      status: "approved",
      approvedAt: now,
      startsAt: now,
      endsAt: now + durationDays * 24 * 60 * 60 * 1000,
      adminNotes: args.notes,
      updatedAt: now,
    });
    return { success: true };
  },
});

/** Admin: reject sponsorship */
export const reject = mutation({
  args: { sponsorshipId: v.string(), userId: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;

    await ctx.db.patch(sponsorship._id, {
      status: "rejected",
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/** Admin: pause sponsorship */
export const pause = mutation({
  args: { sponsorshipId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.status !== "active") throw new Error("Only active sponsorships can be paused");

    await ctx.db.patch(sponsorship._id, { status: "paused", updatedAt: Date.now() });
    return { success: true };
  },
});

/** Admin: resume sponsorship */
export const resume = mutation({
  args: { sponsorshipId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.status !== "paused") throw new Error("Only paused sponsorships can be resumed");

    await ctx.db.patch(sponsorship._id, { status: "active", updatedAt: Date.now() });
    return { success: true };
  },
});

/** Sponsor: cancel auto-renewal */
export const cancelAutoRenew = mutation({
  args: { sponsorshipId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.userId !== args.userId) throw new Error("Not your sponsorship");

    await ctx.db.patch(sponsorship._id, { autoRenew: false, updatedAt: Date.now() });
    return { success: true };
  },
});

/** Sponsor: cancel sponsorship entirely */
export const cancelSponsorship = mutation({
  args: { sponsorshipId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;
    if (sponsorship.userId !== args.userId) throw new Error("Not your sponsorship");

    await ctx.db.patch(sponsorship._id, {
      status: "cancelled",
      autoRenew: false,
      cancellationReason: "Cancelled by advertiser",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/** Record successful payment (called by webhook or checkout) */
export const recordPayment = mutation({
  args: {
    sponsorshipId: v.string(),
    userId: v.string(),
    providerPaymentId: v.optional(v.string()),
    providerSubscriptionId: v.optional(v.string()),
    amount: v.number(),
    paymentType: v.string(), // initial | renewal
  },
  handler: async (ctx, args) => {
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;

    const now = Date.now();

    // Record payment
    await ctx.db.insert("sponsor_payments", {
      sponsorshipId: args.sponsorshipId,
      userId: args.userId,
      provider: "stripe",
      providerPaymentId: args.providerPaymentId,
      providerSubscriptionId: args.providerSubscriptionId,
      amount: args.amount,
      currency: "USD",
      status: "succeeded",
      paymentType: args.paymentType,
      createdAt: now,
    });

    // Update sponsorship status
    if (args.paymentType === "initial") {
      await ctx.db.patch(sponsorship._id, {
        status: "pending_review",
        stripeSubscriptionId: args.providerSubscriptionId,
        stripeCheckoutSessionId: args.providerPaymentId,
        updatedAt: now,
      });
    } else if (args.paymentType === "renewal") {
      // Extend the sponsorship
      const plDoc = await ctx.db.get(sponsorship.placementId as any);
      const durationDays = (plDoc as any)?.durationDays || 30;
      const currentEnd = sponsorship.endsAt || now;
      const newEnd = Math.max(currentEnd, now) + durationDays * 24 * 60 * 60 * 1000;

      await ctx.db.patch(sponsorship._id, {
        status: "active",
        endsAt: newEnd,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/** Record failed payment */
export const recordFailedPayment = mutation({
  args: {
    sponsorshipId: v.string(),
    userId: v.string(),
    providerPaymentId: v.optional(v.string()),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sponsor_payments", {
      sponsorshipId: args.sponsorshipId,
      userId: args.userId,
      provider: "stripe",
      providerPaymentId: args.providerPaymentId,
      amount: args.amount,
      currency: "USD",
      status: "failed",
      paymentType: "renewal",
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

// ═══════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════

/** Track a sponsor event (impression or click) */
export const trackEvent = mutation({
  args: {
    sponsorshipId: v.string(),
    eventType: v.string(), // impression | click
    page: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic bot filtering: skip known bot user agents
    const ua = (args.userAgent || "").toLowerCase();
    const botPatterns = ["bot", "crawler", "spider", "curl", "wget", "python-requests", "headless", "lighthouse"];
    if (botPatterns.some((p) => ua.includes(p))) {
      return { filtered: true };
    }

    await ctx.db.insert("sponsor_events", {
      sponsorshipId: args.sponsorshipId,
      eventType: args.eventType,
      page: args.page,
      referrer: args.referrer,
      userAgent: args.userAgent,
      ip: args.ip,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

/** Get analytics for a sponsorship */
export const getAnalytics = query({
  args: { sponsorshipId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("sponsor_events")
      .withIndex("by_sponsorship", (q: any) => q.eq("sponsorshipId", args.sponsorshipId))
      .collect();

    const impressions = events.filter((e: any) => e.eventType === "impression").length;
    const clicks = events.filter((e: any) => e.eventType === "click").length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Get recent events (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentEvents = events.filter((e: any) => e.createdAt > thirtyDaysAgo);
    const recentImpressions = recentEvents.filter((e: any) => e.eventType === "impression").length;
    const recentClicks = recentEvents.filter((e: any) => e.eventType === "click").length;

    // Top pages
    const pageCount: Record<string, number> = {};
    events.filter((e: any) => e.eventType === "impression").forEach((e: any) => {
      const page = e.page || "unknown";
      pageCount[page] = (pageCount[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));

    return {
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      recentImpressions,
      recentClicks,
      topPages,
    };
  },
});

/** Get payments for a sponsorship */
export const getPayments = query({
  args: { sponsorshipId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsor_payments")
      .withIndex("by_sponsorship", (q: any) => q.eq("sponsorshipId", args.sponsorshipId))
      .collect();
  },
});

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════

/** Auto-expire sponsorships past their endsAt date */
export const expireStale = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeSponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();

    let expired = 0;
    for (const s of activeSponsorships) {
      if (s.endsAt && s.endsAt < now) {
        await ctx.db.patch(s._id, { status: "expired", updatedAt: now });
        expired++;
      }
    }
    return { expired };
  },
});

/** Admin: get all sponsorships with stats */
export const adminGetAll = query({
  args: {},
  handler: async (ctx) => {
    const sponsorships = await ctx.db.query("sponsorships").collect();
    const payments = await ctx.db.query("sponsor_payments").collect();
    const now = Date.now();

    const active = sponsorships.filter((s: any) => s.status === "active");
    const pending = sponsorships.filter((s: any) => s.status === "pending_review" || s.status === "paid");
    const expired = sponsorships.filter((s: any) => s.status === "expired" || (s.endsAt && s.endsAt < now));
    const rejected = sponsorships.filter((s: any) => s.status === "rejected");
    const cancelled = sponsorships.filter((s: any) => s.status === "cancelled");

    const thisMonthStart = new Date(now).setDate(1);
    const thisMonthPayments = payments.filter(
      (p: any) => p.status === "succeeded" && p.createdAt > thisMonthStart
    );
    const revenueThisMonth = thisMonthPayments.reduce((s: number, p: any) => s + p.amount, 0);

    const renewalPayments = payments.filter(
      (p: any) => p.status === "succeeded" && p.paymentType === "renewal" && p.createdAt > thisMonthStart
    );

    return {
      sponsorships,
      stats: {
        totalRevenue: revenueThisMonth,
        activeCount: active.length,
        pendingCount: pending.length,
        expiredCount: expired.length,
        rejectedCount: rejected.length,
        cancelledCount: cancelled.length,
        renewalsThisMonth: renewalPayments.length,
      },
      pending,
      active,
      expired,
      rejected,
      cancelled,
    };
  },
});

// ═══════════════════════════════════════════════
// WAITLIST
// ═══════════════════════════════════════════════

/** Join the waitlist for sponsorship notifications */
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    companyName: v.optional(v.string()),
    placementSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.email.trim()) throw new Error("Email is required");
    if (!isValidEmail(args.email)) throw new Error("Invalid email address");

    const existing = await ctx.db
      .query("sponsor_waitlist")
      .withIndex("by_email", (q: any) => q.eq("email", args.email.toLowerCase().trim()))
      .first();
    if (existing) return { success: true, message: "Already on the waitlist" };

    await ctx.db.insert("sponsor_waitlist", {
      email: args.email.toLowerCase().trim(),
      companyName: args.companyName,
      placementSlug: args.placementSlug,
      notified: false,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

/** Get waitlist count */
export const getWaitlistCount = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("sponsor_waitlist").collect();
    return entries.length;
  },
});

// ═══════════════════════════════════════════════
// PLACEMENT MANAGEMENT (admin)
// ═══════════════════════════════════════════════

/** Admin: create a new placement */
export const createPlacement = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    position: v.string(),
    price: v.number(),
    durationDays: v.number(),
    maxSlots: v.number(),
  },
  handler: async (ctx, args) => {
    if (!args.slug.trim()) throw new Error("Slug is required");
    if (!args.name.trim()) throw new Error("Name is required");
    if (args.price <= 0) throw new Error("Price must be positive");
    if (args.maxSlots < 1) throw new Error("Max slots must be at least 1");
    if (args.durationDays < 1) throw new Error("Duration must be at least 1 day");

    const existing = await ctx.db
      .query("sponsor_placements")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug.trim()))
      .first();
    if (existing) throw new Error("A placement with this slug already exists");

    return await ctx.db.insert("sponsor_placements", {
      slug: args.slug.trim(),
      name: args.name.trim(),
      description: args.description,
      position: args.position,
      price: args.price,
      durationDays: args.durationDays,
      maxSlots: args.maxSlots,
      active: true,
      createdAt: Date.now(),
    });
  },
});

/** Admin: update a placement */
export const updatePlacement = mutation({
  args: {
    placementId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    durationDays: v.optional(v.number()),
    maxSlots: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.placementId as any);
    if (!doc) throw new Error("Placement not found");

    const updates: Record<string, unknown> = { };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description;
    if (args.price !== undefined) updates.price = args.price;
    if (args.durationDays !== undefined) updates.durationDays = args.durationDays;
    if (args.maxSlots !== undefined) updates.maxSlots = args.maxSlots;
    if (args.active !== undefined) updates.active = args.active;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.placementId as any, updates);
    }
    return { success: true };
  },
});

/** Admin: delete a placement (only if no active sponsorships) */
export const deletePlacement = mutation({
  args: { placementId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.placementId as any);
    if (!doc) throw new Error("Placement not found");

    const activeSponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_placement", (q: any) => q.eq("placementId", args.placementId))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "pending_review"),
          q.eq(q.field("status"), "paid")
        )
      )
      .collect();

    if (activeSponsorships.length > 0) {
      throw new Error("Cannot delete placement with active or pending sponsorships");
    }

    await ctx.db.delete(args.placementId as any);
    return { success: true };
  },
});

// ═══════════════════════════════════════════════
// PUBLIC STATS (for sponsor page)
// ═══════════════════════════════════════════════

/** Get public stats for the sponsor landing page */
export const getPublicStats = query({
  args: {},
  handler: async (ctx) => {
    const totalUsers = await ctx.db.query("user_profiles").collect();
    const allSponsorships = await ctx.db.query("sponsorships").collect();
    const now = Date.now();

    const activeSponsorships = allSponsorships.filter((s: any) => {
      if (s.status !== "active" && s.status !== "approved") return false;
      if (s.startsAt && s.startsAt > now) return false;
      if (s.endsAt && s.endsAt < now) return false;
      return true;
    });

    const totalImpressions = (await ctx.db.query("sponsor_events").collect())
      .filter((e: any) => e.eventType === "impression").length;

    const totalClicks = (await ctx.db.query("sponsor_events").collect())
      .filter((e: any) => e.eventType === "click").length;

    // Unique sponsor companies
    const sponsorCompanyNames = new Set(
      activeSponsorships.map((s: any) => s.companyName)
    );

    // Countries from user profiles
    const countries = new Set(
      totalUsers.map((u: any) => u.country).filter(Boolean)
    );

    return {
      totalUsers: totalUsers.length,
      activeSponsorships: activeSponsorships.length,
      totalSponsors: sponsorCompanyNames.size,
      totalImpressions,
      totalClicks,
      countriesRepresented: countries.size,
    };
  },
});

/** Get per-slot availability for the public page */
export const getSlotAvailability = query({
  args: {},
  handler: async (ctx) => {
    const placements = await ctx.db
      .query("sponsor_placements")
      .filter((q: any) => q.eq(q.field("active"), true))
      .collect();

    const now = Date.now();
    const results = [];

    for (const placement of placements) {
      const p = placement as any;
      const activeSponsorships = await ctx.db
        .query("sponsorships")
        .withIndex("by_placement", (q: any) => q.eq("placementId", p._id))
        .filter((q: any) =>
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "approved"),
            q.eq(q.field("status"), "pending_review"),
            q.eq(q.field("status"), "paid")
          )
        )
        .collect();

      // Filter out expired ones
      const validSponsorships = activeSponsorships.filter((s: any) => {
        if (s.startsAt && s.startsAt > now) return false;
        if (s.endsAt && s.endsAt < now) return false;
        return true;
      });

      const total = p.maxSlots;
      const used = validSponsorships.length;
      const available = Math.max(0, total - used);

      // Find next expiry
      let nextAvailable: number | null = null;
      if (available === 0) {
        const sorted = validSponsorships
          .filter((s: any) => s.endsAt)
          .sort((a: any, b: any) => (a.endsAt || 0) - (b.endsAt || 0));
        if (sorted.length > 0) nextAvailable = sorted[0].endsAt;
      }

      // Current sponsors info
      const currentSponsors = validSponsorships.map((s: any) => ({
        companyName: s.companyName,
        logoUrl: s.logoUrl,
        headline: s.headline,
      }));

      results.push({
        ...p,
        totalSlots: total,
        usedSlots: used,
        availableSlots: available,
        nextAvailable,
        currentSponsors,
      });
    }

    return results;
  },
});

// ═══════════════════════════════════════════════
// CLICK TRACKING
// ═══════════════════════════════════════════════

/** Track a click and return the destination URL */
export const trackClick = mutation({
  args: {
    sponsorshipId: v.string(),
    page: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sponsorshipDoc = await ctx.db.get(args.sponsorshipId as any);
    if (!sponsorshipDoc) throw new Error("Sponsorship not found");
    const sponsorship = sponsorshipDoc as any;

    // Record click event
    await ctx.db.insert("sponsor_events", {
      sponsorshipId: args.sponsorshipId,
      eventType: "click",
      page: args.page,
      userAgent: args.userAgent,
      createdAt: Date.now(),
    });

    return { destinationUrl: sponsorship.ctaUrl || sponsorship.websiteUrl || "#" };
  },
});

// ═══════════════════════════════════════════════
// ADMIN: END SPONSORSHIP
// ═══════════════════════════════════════════════

export const endSponsorship = mutation({
  args: {
    sponsorshipId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const sponsorship = await ctx.db
      .query("sponsorships")
      .filter((q: any) => q.eq(q.field("_id"), args.sponsorshipId))
      .first();
    if (!sponsorship) throw new Error("Sponsorship not found");
    if (sponsorship.status !== "active" && sponsorship.status !== "paused") {
      throw new Error("Can only end active or paused sponsorships");
    }

    await ctx.db.patch(sponsorship._id, {
      status: "expired",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ═══════════════════════════════════════════════
// ADMIN: EXTEND SPONSORSHIP
// ═══════════════════════════════════════════════

export const extendSponsorship = mutation({
  args: {
    sponsorshipId: v.string(),
    userId: v.string(),
    additionalDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    if (args.additionalDays <= 0 || args.additionalDays > 365) {
      throw new Error("Additional days must be between 1 and 365");
    }

    const sponsorship = await ctx.db
      .query("sponsorships")
      .filter((q: any) => q.eq(q.field("_id"), args.sponsorshipId))
      .first();
    if (!sponsorship) throw new Error("Sponsorship not found");
    if (sponsorship.status !== "active") {
      throw new Error("Can only extend active sponsorships");
    }

    const currentEnd = sponsorship.endsAt || Date.now();
    const newEnd = currentEnd + args.additionalDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(sponsorship._id, {
      endsAt: newEnd,
      updatedAt: Date.now(),
    });

    return { success: true, newEndsAt: newEnd };
  },
});

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
