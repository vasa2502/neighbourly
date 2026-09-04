import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// ─── Search communities ───
export const search = query({
  args: { query: v.string(), city: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    let results = await ctx.db
      .query("communities")
      .withSearchIndex("search_name", (q: any) => q.search("name", args.query))
      .collect();

    if (args.city) {
      results = results.filter((c: any) =>
        c.city.toLowerCase().includes(args.city!.toLowerCase())
      );
    }

    return results.filter((c: any) => c.status === "active").slice(0, 20);
  },
});

// ─── Get community ───
export const get = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communities")
      .filter((q) => q.eq(q.field("_id"), args.communityId))
      .first();
  },
});

// ─── Create community ───
export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    area: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    postalCode: v.optional(v.string()),
    description: v.optional(v.string()),
    approximateResidents: v.optional(v.number()),
    buildings: v.optional(v.array(v.string())),
    founderId: v.string(),
    invitationCode: v.optional(v.string()),
    coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.founderId);

    if (!args.name.trim()) throw new Error("Community name is required");
    if (!args.area.trim()) throw new Error("Area/neighborhood is required");
    if (!args.city.trim()) throw new Error("City is required");
    if (!args.country.trim()) throw new Error("Country is required");

    const now = Date.now();
    const communityId = await ctx.db.insert("communities", {
      ...args,
      name: args.name.trim(),
      area: args.area.trim(),
      city: args.city.trim(),
      adminId: args.founderId,
      verified: false,
      status: "active",
      residentCount: 1,
      verifiedResidentCount: 0,
      createdAt: now,
    });

    // Auto-join founder as admin
    await ctx.db.insert("community_memberships", {
      userId: args.founderId,
      communityId,
      role: "admin",
      verified: true,
      verificationStatus: "approved",
      joinedAt: now,
      status: "active",
    });

    return communityId;
  },
});

// ─── Find duplicates ───
export const findDuplicates = query({
  args: { name: v.string(), area: v.string(), city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communities")
      .withSearchIndex("search_name", (q: any) => q.search("name", args.name))
      .collect();
  },
});

// ─── Find nearby ───
export const findNearby = query({
  args: { lat: v.number(), lng: v.number(), radius: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("communities").collect();
    return all.filter((c: any) => {
      if (!c.coordinates) return false;
      const R = 6371;
      const dLat = ((c.coordinates.lat - args.lat) * Math.PI) / 180;
      const dLng = ((c.coordinates.lng - args.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((args.lat * Math.PI) / 180) *
          Math.cos((c.coordinates.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return d <= args.radius;
    });
  },
});

// ─── List all ───
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});
