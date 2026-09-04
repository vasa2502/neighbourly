import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

export const submit = mutation({
  args: {
    userId: v.string(),
    communityId: v.string(),
    method: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const validMethods = ["invite_code", "invitation", "email", "admin_approval", "proof", "address"];
    if (!validMethods.includes(args.method)) throw new Error("Invalid verification method");

    // Check for existing pending request
    const existing = await ctx.db
      .query("verification_requests")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.eq(q.field("status"), "pending"))
      .first();
    if (existing) throw new Error("Already have a pending verification request");

    return await ctx.db.insert("verification_requests", {
      userId: args.userId,
      communityId: args.communityId,
      method: args.method,
      status: "pending",
      submittedAt: Date.now(),
      data: args.data,
    });
  },
});

export const listPending = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("verification_requests")
      .withIndex("by_community_status", (q: any) =>
        q.eq("communityId", args.communityId).eq("status", "pending")
      )
      .collect();

    const enriched = [];
    for (const r of requests) {
      const user = await ctx.db.query("user_profiles").filter((q: any) => q.eq(q.field("_id"), r.userId)).first();
      enriched.push({
        ...r,
        user: user ? { name: user.name, email: user.email, avatar: user.avatar } : null,
      });
    }
    return enriched;
  },
});

export const approve = mutation({
  args: { requestId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const request = await ctx.db.query("verification_requests").filter((q: any) => q.eq(q.field("_id"), args.requestId)).first();
    if (!request) throw new Error("Request not found");
    await requireRole(ctx, args.userId, request.communityId, ["admin", "moderator"]);

    await ctx.db.patch(request._id, { status: "approved", reviewedAt: Date.now(), reviewedBy: args.userId });

    // Update membership
    const membership = await ctx.db
      .query("community_memberships")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", request.userId).eq("communityId", request.communityId)
      )
      .first();
    if (membership) {
      await ctx.db.patch(membership._id, {
        verified: true,
        verificationStatus: "approved",
        verifiedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const reject = mutation({
  args: { requestId: v.string(), userId: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const request = await ctx.db.query("verification_requests").filter((q: any) => q.eq(q.field("_id"), args.requestId)).first();
    if (!request) throw new Error("Request not found");
    await requireRole(ctx, args.userId, request.communityId, ["admin", "moderator"]);

    await ctx.db.patch(request._id, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: args.userId,
      rejectionReason: args.reason,
    });

    // Update membership
    const membership = await ctx.db
      .query("community_memberships")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", request.userId).eq("communityId", request.communityId)
      )
      .first();
    if (membership) {
      await ctx.db.patch(membership._id, { verificationStatus: "rejected" });
    }

    return { success: true };
  },
});

export const getStatus = query({
  args: { userId: v.string(), communityId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("verification_requests")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();
    return requests.find((r: any) => r.communityId === args.communityId) || null;
  },
});
