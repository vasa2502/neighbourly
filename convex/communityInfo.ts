import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

// ─── Rules ───
export const getRules = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("community_rules")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .order("asc")
      .collect();
  },
});

export const createRule = mutation({
  args: { communityId: v.string(), userId: v.string(), title: v.string(), description: v.string(), sortOrder: v.number() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    await requireRole(ctx, args.userId, args.communityId, ["admin"]);
    if (!args.title.trim()) throw new Error("Title is required");
    return await ctx.db.insert("community_rules", {
      communityId: args.communityId,
      title: args.title.trim(),
      description: args.description.trim(),
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

// ─── Documents ───
export const getDocuments = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("community_documents")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
  },
});

export const createDocument = mutation({
  args: { communityId: v.string(), userId: v.string(), title: v.string(), description: v.optional(v.string()), url: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    await requireRole(ctx, args.userId, args.communityId, ["admin"]);
    if (!args.title.trim()) throw new Error("Title is required");
    return await ctx.db.insert("community_documents", {
      communityId: args.communityId,
      title: args.title.trim(),
      description: args.description,
      url: args.url,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});

// ─── Facilities ───
export const getFacilities = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("community_facilities")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
  },
});

export const createFacility = mutation({
  args: { communityId: v.string(), userId: v.string(), name: v.string(), description: v.optional(v.string()), type: v.string(), hours: v.optional(v.string()), rules: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    await requireRole(ctx, args.userId, args.communityId, ["admin"]);
    if (!args.name.trim()) throw new Error("Name is required");
    return await ctx.db.insert("community_facilities", {
      communityId: args.communityId,
      name: args.name.trim(),
      description: args.description,
      type: args.type,
      hours: args.hours,
      rules: args.rules,
      createdAt: Date.now(),
    });
  },
});

// ─── Contacts ───
export const getContacts = query({
  args: { communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("community_contacts")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
  },
});

export const createContact = mutation({
  args: { communityId: v.string(), userId: v.string(), name: v.string(), type: v.string(), phone: v.string(), email: v.optional(v.string()), available24x7: v.boolean() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    await requireRole(ctx, args.userId, args.communityId, ["admin"]);
    if (!args.name.trim()) throw new Error("Name is required");
    if (!args.phone.trim()) throw new Error("Phone is required");
    return await ctx.db.insert("community_contacts", {
      communityId: args.communityId,
      name: args.name.trim(),
      type: args.type,
      phone: args.phone.trim(),
      email: args.email,
      available24x7: args.available24x7,
      createdAt: Date.now(),
    });
  },
});
