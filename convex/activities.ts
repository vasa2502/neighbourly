import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

// Helper to look up a document by string ID from a specific table
async function findById(ctx: any, table: string, id: string) {
  return await ctx.db
    .query(table)
    .filter((q: any) => q.eq(q.field("_id"), id))
    .first();
}

// ─── List activities for community ───
export const list = query({
  args: {
    communityId: v.string(),
    date: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    let results = await ctx.db
      .query("activities")
      .withIndex("by_community_status", (q: any) =>
        q.eq("communityId", args.communityId).eq("status", "active")
      )
      .collect();

    if (args.date) results = results.filter((a: any) => a.date === args.date);
    if (args.category) results = results.filter((a: any) => a.category === args.category);

    const total = results.length;
    const paginated = results.slice(cursor, cursor + limit);

    const enriched = [];
    for (const a of paginated) {
      const host = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), a.hostId))
        .first();
      enriched.push({
        ...a,
        user_profiles: host ? { name: host.name, avatar: host.avatar } : null,
      });
    }

    return {
      data: enriched.sort((a: any, b: any) => a.date.localeCompare(b.date)),
      total,
      hasMore: cursor + limit < total,
      nextCursor: cursor + limit < total ? cursor + limit : null,
    };
  },
});

// ─── Get activity by ID ───
export const get = query({
  args: { activityId: v.string() },
  handler: async (ctx, args) => {
    const activity = await findById(ctx, "activities", args.activityId);
    if (!activity) return null;
    const host = await ctx.db
      .query("user_profiles")
      .filter((q: any) => q.eq(q.field("_id"), activity.hostId))
      .first();
    return {
      ...activity,
      user_profiles: host ? { name: host.name, avatar: host.avatar } : null,
    };
  },
});

// ─── Create activity ───
export const create = mutation({
  args: {
    communityId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    date: v.string(),
    time: v.string(),
    endTime: v.optional(v.string()),
    location: v.string(),
    maxParticipants: v.number(),
    hostId: v.string(),
    skillLevel: v.optional(v.string()),
    format: v.optional(v.string()),
    isFree: v.boolean(),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.hostId);

    // Validate required fields
    if (!args.title.trim()) throw new Error("Activity title is required");
    if (!args.category) throw new Error("Category is required");
    if (!args.date) throw new Error("Date is required");
    if (!args.time) throw new Error("Time is required");
    if (!args.location.trim()) throw new Error("Location is required");
    if (args.maxParticipants < 1) throw new Error("Max participants must be at least 1");
    if (!args.isFree && (!args.price || args.price <= 0)) throw new Error("Paid activities must have a valid price");

    // Verify the user is a member of this community
    await requireRole(ctx, args.hostId, args.communityId, ["admin", "moderator", "host", "resident"]);

    const now = Date.now();
    const id = await ctx.db.insert("activities", {
      ...args,
      currentParticipants: 1,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activity_participants", {
      activityId: id,
      userId: args.hostId,
      joinedAt: now,
    });
    return await ctx.db.get(id);
  },
});

// ─── Join activity ───
export const join = mutation({
  args: { activityId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("activity_participants")
      .withIndex("by_activity_user", (q: any) =>
        q.eq("activityId", args.activityId).eq("userId", args.userId)
      )
      .first();
    if (existing) throw new Error("Already joined");

    // Check max participants
    const activity = await findById(ctx, "activities", args.activityId);
    if (!activity) throw new Error("Activity not found");
    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new Error("Activity is full");
    }

    await ctx.db.insert("activity_participants", {
      activityId: args.activityId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    await ctx.db.patch(activity._id, {
      currentParticipants: activity.currentParticipants + 1,
    });
  },
});

// ─── Leave activity ───
export const leave = mutation({
  args: { activityId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const membership = await ctx.db
      .query("activity_participants")
      .withIndex("by_activity_user", (q: any) =>
        q.eq("activityId", args.activityId).eq("userId", args.userId)
      )
      .first();
    if (membership) await ctx.db.delete(membership._id);

    const activity = await findById(ctx, "activities", args.activityId);
    if (activity && activity.currentParticipants > 0) {
      await ctx.db.patch(activity._id, {
        currentParticipants: activity.currentParticipants - 1,
      });
    }
  },
});

// ─── Update activity ───
export const update = mutation({
  args: {
    activityId: v.string(),
    hostId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    skillLevel: v.optional(v.string()),
    format: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.hostId);
    const { activityId, hostId, ...updates } = args;
    const activity = await findById(ctx, "activities", activityId);
    if (!activity) throw new Error("Activity not found");
    if (activity.hostId !== hostId) throw new Error("Only the host can update this activity");

    const filtered: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) filtered[k] = v;
    }
    filtered.updatedAt = Date.now();

    await ctx.db.patch(activity._id, filtered);
    return await ctx.db.get(activity._id);
  },
});

// ─── Delete (cancel) activity ───
export const remove = mutation({
  args: { activityId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const activity = await findById(ctx, "activities", args.activityId);
    if (!activity) throw new Error("Activity not found");
    if (activity.hostId !== args.userId) throw new Error("Only the host can cancel this activity");
    await ctx.db.patch(activity._id, { status: "cancelled", updatedAt: Date.now() });
  },
});

// ─── Get activity participants ───
export const participants = query({
  args: { activityId: v.string(), limit: v.optional(v.number()), cursor: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const cursor = args.cursor || 0;

    const parts = await ctx.db
      .query("activity_participants")
      .withIndex("by_activity", (q: any) => q.eq("activityId", args.activityId))
      .collect();

    const total = parts.length;
    const paginated = parts.slice(cursor, cursor + limit);

    const enriched = [];
    for (const p of paginated) {
      const profile = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), p.userId))
        .first();
      enriched.push({
        ...p,
        user_profiles: profile
          ? { name: profile.name, avatar: profile.avatar, sports: profile.sports, interests: profile.interests }
          : null,
      });
    }
    return { data: enriched, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Submit activity feedback ───
export const submitFeedback = mutation({
  args: {
    activityId: v.string(),
    userId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be between 1 and 5");

    // Check for duplicate feedback
    const existing = await ctx.db
      .query("activity_feedback")
      .filter((q: any) => q.eq(q.field("activityId"), args.activityId) && q.eq(q.field("userId"), args.userId))
      .first();
    if (existing) throw new Error("Already submitted feedback");

    await ctx.db.insert("activity_feedback", {
      activityId: args.activityId,
      userId: args.userId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });
  },
});

// ─── Activity messages (chat) ───
export const messages = query({
  args: { activityId: v.string() },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("activity_messages")
      .withIndex("by_activity", (q: any) => q.eq("activityId", args.activityId))
      .order("asc")
      .collect();

    const enriched = [];
    for (const m of msgs) {
      const sender = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), m.senderId))
        .first();
      enriched.push({
        ...m,
        user_profiles: sender ? { name: sender.name, avatar: sender.avatar } : null,
      });
    }
    return enriched;
  },
});

export const sendMessage = mutation({
  args: {
    activityId: v.string(),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.senderId);
    if (!args.content.trim()) throw new Error("Message cannot be empty");
    if (args.content.length > 2000) throw new Error("Message too long (max 2000 characters)");

    return await ctx.db.insert("activity_messages", {
      activityId: args.activityId,
      senderId: args.senderId,
      content: args.content.trim(),
      createdAt: Date.now(),
    });
  },
});

// ─── Activities by category ───
export const listByCategory = query({
  args: { communityId: v.string(), category: v.string(), limit: v.optional(v.number()), cursor: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    const all = await ctx.db
      .query("activities")
      .withIndex("by_community_category", (q: any) =>
        q.eq("communityId", args.communityId).eq("category", args.category)
      )
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .order("asc")
      .collect();

    const total = all.length;
    const paginated = all.slice(cursor, cursor + limit);
    return { data: paginated, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});
