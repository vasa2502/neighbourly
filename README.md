# JOINN

Your private residential community platform.

## Overview

JOINN is a private community platform built around where you live. It helps residents discover activities, join clubs, connect with verified neighbours, and grow their local community — all within a secure, residential-only space.

## Features

### For Residents (Free)
- Find and join your residential community
- Discover and join activities, clubs, and sports
- Community posts, discussions, and recommendations
- Direct messaging with neighbours
- Community calendar and announcements
- Basic notifications

### Resident Plus (From ₹249/month)
- Priority activity booking
- Advanced profile features
- Enhanced privacy controls
- No ads
- Referral credit rewards
- Priority support

### Host Pro ($9.99/month)
- Recurring activities
- Waitlists and co-hosts
- Activity analytics dashboard
- Advanced scheduling tools
- Host management dashboard

### Community Partner ($199/month per community)
- Complete community management
- Resident verification system
- Moderation tools and analytics
- Community advertising revenue
- Custom branding and rules
- API access

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **State:** React Query (TanStack Query)
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **Fonts:** DM Sans, Plus Jakarta Sans, Bricolage Grotesque

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Environment Variables

Set the following in your `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Database Setup

Apply the migration in `supabase/migrations/20260825_community_platform.sql` to your Supabase project via the SQL Editor.

## Project Structure

```
src/
├── components/       # UI components (shadcn/ui + custom)
├── contexts/         # React contexts (Auth, Community)
├── hooks/            # React Query hooks
├── integrations/     # Supabase client and types
├── lib/              # API functions, types, utilities
├── pages/            # Page components
│   ├── dashboard/    # Authenticated dashboard pages
│   ├── onboarding/   # Onboarding flow pages
│   ├── business/     # Business/partner pages
│   └── system/       # Error/status pages
└── index.css         # Global styles and theme
```

## License

Private — JOINN
