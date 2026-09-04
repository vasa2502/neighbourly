import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

export const getSlots = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ad_slots")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
  },
});

export const createSlot = mutation({
  args: { communityId: v.string(), sellerId: v.string(), name: v.string(), description: v.optional(v.string()), size: v.string(), basePrice: v.number() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.sellerId);
    if (!args.name.trim()) throw new Error("Slot name is required");
    if (args.basePrice <= 0) throw new Error("Base price must be positive");
    return await ctx.db.insert("ad_slots", {
      communityId: args.communityId,
      name: args.name.trim(),
      description: args.description,
      size: args.size,
      basePrice: args.basePrice,
      sellerId: args.sellerId,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const getBids = query({
  args: { slotId: v.string() },
  handler: async (ctx, args) => {
    const bids = await ctx.db
      .query("ad_bids")
      .withIndex("by_slot", (q: any) => q.eq("slotId", args.slotId))
      .collect();
    const enriched = [];
    for (const b of bids) {
      const user = await ctx.db.query("user_profiles").filter((q: any) => q.eq(q.field("_id"), b.userId)).first();
      enriched.push({ ...b, user: user ? { name: user.name, avatar: user.avatar } : null });
    }
    return enriched.sort((a: any, b: any) => b.amount - a.amount);
  },
});

export const placeBid = mutation({
  args: { slotId: v.string(), userId: v.string(), amount: v.number(), message: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    if (args.amount <= 0) throw new Error("Bid amount must be positive");

    const slots = await ctx.db
      .query("ad_slots")
      .filter((q: any) => q.eq(q.field("_id"), args.slotId))
      .first();
    if (!slots || slots.status !== "active") throw new Error("Slot not available");
    if (slots.currentBid && args.amount <= slots.currentBid) throw new Error("Bid must be higher than current bid");

    await ctx.db.patch(slots._id, { currentBid: args.amount, currentBidderId: args.userId });
    return await ctx.db.insert("ad_bids", {
      slotId: args.slotId,
      userId: args.userId,
      amount: args.amount,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

export const getCampaigns = query({
  args: { advertiserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ad_campaigns")
      .withIndex("by_advertiser", (q: any) => q.eq("advertiserId", args.advertiserId))
      .collect();
  },
});

export const createCampaign = mutation({
  args: {
    advertiserId: v.string(),
    slotId: v.string(),
    communityId: v.string(),
    name: v.string(),
    budget: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    creativeUrl: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.advertiserId);
    if (!args.name.trim()) throw new Error("Campaign name is required");
    if (args.budget <= 0) throw new Error("Budget must be positive");

    return await ctx.db.insert("ad_campaigns", {
      advertiserId: args.advertiserId,
      slotId: args.slotId,
      communityId: args.communityId,
      name: args.name.trim(),
      budget: args.budget,
      startDate: args.startDate,
      endDate: args.endDate,
      creativeUrl: args.creativeUrl,
      targetAudience: args.targetAudience,
      status: "scheduled",
      impressions: 0,
      clicks: 0,
      leads: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateCampaign = mutation({
  args: { campaignId: v.string(), userId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const campaign = await ctx.db
      .query("ad_campaigns")
      .filter((q: any) => q.eq(q.field("_id"), args.campaignId))
      .first();
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.advertiserId !== args.userId) throw new Error("Not your campaign");

    const updates: Record<string, unknown> = {};
    if (args.status) updates.status = args.status;
    await ctx.db.patch(campaign._id, updates);
    return { success: true };
  },
});

export const getPartnerStats = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("ad_slots")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();

    const campaigns = await ctx.db
      .query("ad_campaigns")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();

    return {
      totalSlots: slots.length,
      activeSlots: slots.filter((s: any) => s.status === "active").length,
      totalRevenue: slots.reduce((sum: number, s: any) => sum + (s.currentBid || s.basePrice), 0),
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === "active").length,
      totalImpressions: campaigns.reduce((sum: number, c: any) => sum + c.impressions, 0),
      totalClicks: campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0),
    };
  },
});
