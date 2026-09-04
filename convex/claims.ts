import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

export const submit = mutation({
  args: {
    communityId: v.string(),
    claimantId: v.string(),
    organizationName: v.string(),
    roleTitle: v.string(),
    evidence: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.claimantId);
    if (!args.organizationName.trim()) throw new Error("Organization name is required");
    if (!args.roleTitle.trim()) throw new Error("Role/title is required");
    if (!args.evidence.trim()) throw new Error("Evidence is required");

    const existing = await ctx.db
      .query("community_claims")
      .filter((q: any) => q.eq(q.field("communityId"), args.communityId) && q.eq(q.field("claimantId"), args.claimantId))
      .first();
    if (existing) throw new Error("You already have a pending or reviewed claim for this community");

    return await ctx.db.insert("community_claims", {
      communityId: args.communityId,
      claimantId: args.claimantId,
      organizationName: args.organizationName.trim(),
      roleTitle: args.roleTitle.trim(),
      evidence: args.evidence.trim(),
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("community_claims").collect();
    if (args.status) results = results.filter((r: any) => r.status === args.status);

    const enriched = [];
    for (const r of results) {
      const community = await ctx.db.query("communities").filter((q: any) => q.eq(q.field("_id"), r.communityId)).first();
      const claimant = await ctx.db.query("user_profiles").filter((q: any) => q.eq(q.field("_id"), r.claimantId)).first();
      enriched.push({
        ...r,
        community: community ? { name: community.name, area: community.area } : null,
        claimant: claimant ? { name: claimant.name, email: claimant.email } : null,
      });
    }
    return enriched;
  },
});

export const approve = mutation({
  args: { claimId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const claim = await ctx.db.query("community_claims").filter((q: any) => q.eq(q.field("_id"), args.claimId)).first();
    if (!claim) throw new Error("Claim not found");
    await requireRole(ctx, args.userId, claim.communityId, ["admin"]);
    await ctx.db.patch(claim._id, { status: "approved", reviewedAt: Date.now(), reviewedBy: args.userId });

    // Update community admin
    const community = await ctx.db.query("communities").filter((q: any) => q.eq(q.field("_id"), claim.communityId)).first();
    if (community) {
      await ctx.db.patch(community._id, { adminId: claim.claimantId });
    }
    return { success: true };
  },
});

export const reject = mutation({
  args: { claimId: v.string(), userId: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const claim = await ctx.db.query("community_claims").filter((q: any) => q.eq(q.field("_id"), args.claimId)).first();
    if (!claim) throw new Error("Claim not found");
    await requireRole(ctx, args.userId, claim.communityId, ["admin"]);
    await ctx.db.patch(claim._id, { status: "rejected", reviewedAt: Date.now(), reviewedBy: args.userId, rejectionReason: args.reason });
    return { success: true };
  },
});
