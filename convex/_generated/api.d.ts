/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as ads from "../ads.js";
import type * as announcements from "../announcements.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as claims from "../claims.js";
import type * as clubs from "../clubs.js";
import type * as communities from "../communities.js";
import type * as communityInfo from "../communityInfo.js";
import type * as http from "../http.js";
import type * as memberships from "../memberships.js";
import type * as messages from "../messages.js";
import type * as moderation from "../moderation.js";
import type * as notifications from "../notifications.js";
import type * as polls from "../polls.js";
import type * as posts from "../posts.js";
import type * as referrals from "../referrals.js";
import type * as seed from "../seed.js";
import type * as sponsorActions from "../sponsorActions.js";
import type * as sponsorPayments from "../sponsorPayments.js";
import type * as sponsorWebhook from "../sponsorWebhook.js";
import type * as sponsorships from "../sponsorships.js";
import type * as sports from "../sports.js";
import type * as subscriptions from "../subscriptions.js";
import type * as typing from "../typing.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  ads: typeof ads;
  announcements: typeof announcements;
  attendance: typeof attendance;
  auth: typeof auth;
  claims: typeof claims;
  clubs: typeof clubs;
  communities: typeof communities;
  communityInfo: typeof communityInfo;
  http: typeof http;
  memberships: typeof memberships;
  messages: typeof messages;
  moderation: typeof moderation;
  notifications: typeof notifications;
  polls: typeof polls;
  posts: typeof posts;
  referrals: typeof referrals;
  seed: typeof seed;
  sponsorActions: typeof sponsorActions;
  sponsorPayments: typeof sponsorPayments;
  sponsorWebhook: typeof sponsorWebhook;
  sponsorships: typeof sponsorships;
  sports: typeof sports;
  subscriptions: typeof subscriptions;
  typing: typeof typing;
  users: typeof users;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
