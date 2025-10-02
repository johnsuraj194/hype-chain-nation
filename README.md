# HypeChain - Social Platform with Scarce Currency

A production-ready mobile-first social platform where users give each other HYPE, a limited in-app social currency. Built with React, TypeScript, Supabase, and modern web technologies.

## Project Overview

HypeChain is a unique social platform similar to Instagram or TikTok, but with a key difference: instead of unlimited "likes", users give each other HYPE tokens - a scarce resource that makes every interaction meaningful. Part of the HYPE given is burned, part goes to the platform, and the rest goes to the creator.

## Core Features

### 1. Authentication & Profiles
- Secure email/password authentication via Supabase Auth
- User profiles with avatar, bio, city, state, and country
- HYPE balance wallet for each user
- Profile editing functionality

### 2. Posts & Media
- Create posts with images and captions
- Media stored in Supabase Storage
- Posts display HYPE count and real-time updates
- Comments system with real-time subscriptions

### 3. HYPE Economy
- Each user starts with 100 HYPE tokens
- Atomic HYPE transactions with balance locking
- Distribution split: 15% burned, 15% platform, 70% creator
- Ledger-based transaction system for auditability
- Daily rewards system with streak bonuses (10 base + up to 12 streak bonus)

### 4. Leaderboards
- Global leaderboard showing top HYPE earners
- Filterable by Country, State, and City
- Top 50 users displayed with rankings
- Dynamic updates based on HYPE received

### 5. Hype Chains
- Create themed chains (linked challenges/posts)
- Track total HYPE across chain posts
- Build epic stories collaboratively
- Active/inactive chain states

### 6. Real-time Features
- Live post updates via Supabase Realtime
- Comment notifications
- HYPE transaction notifications
- Daily reward modal on login

### 7. Modern UI/UX
- Dark theme with gradient accents
- Smooth animations and transitions
- Hover effects and micro-interactions
- Mobile-first responsive design
- Toast notifications for user feedback

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **React Router** for navigation
- **TanStack Query** for state management
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for:
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for media files
  - Edge Functions (serverless)

### Edge Functions
- `give-hype` - Handles HYPE transactions with atomic operations
- `claim-daily-reward` - Manages daily HYPE rewards and streaks

## Database Schema

### Tables
- `profiles` - User profiles with HYPE balances
- `posts` - User posts with media and HYPE counts
- `hype_transactions` - Ledger for all HYPE transfers
- `comments` - Post comments
- `chains` - Hype Chain challenges
- `chain_posts` - Links posts to chains
- `daily_rewards` - Daily reward claims and streaks

### Security
- Row Level Security (RLS) enabled on all tables
- Authenticated users only for sensitive operations
- Ownership checks for updates/deletes
- Public read access for appropriate data

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run database migrations
# Migrations are in supabase/migrations/

# Deploy edge functions
# Functions are in supabase/functions/

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main navigation header
│   ├── PostCard.tsx    # Post display component
│   ├── CommentsSection.tsx
│   └── DailyRewardModal.tsx
├── pages/              # Route pages
│   ├── Auth.tsx        # Login/signup
│   ├── Feed.tsx        # Main feed
│   ├── CreatePost.tsx
│   ├── Profile.tsx
│   ├── EditProfile.tsx
│   ├── Leaderboard.tsx
│   ├── Chains.tsx
│   └── CreateChain.tsx
├── hooks/              # Custom React hooks
│   ├── use-toast.ts
│   └── use-notifications.tsx
├── integrations/       # Supabase integration
│   └── supabase/
└── lib/                # Utility functions

supabase/
├── functions/          # Edge Functions
│   ├── give-hype/
│   └── claim-daily-reward/
└── migrations/         # Database migrations
```

## Key Features Implementation

### HYPE Transaction Flow
1. User clicks "Give HYPE" on a post
2. Edge function validates user authentication
3. Checks sender's HYPE balance
4. Atomic transaction:
   - Deducts from sender
   - Calculates split (15%/15%/70%)
   - Credits creator
   - Records in ledger
   - Updates post count
5. Real-time UI update

### Daily Rewards System
- Base reward: 10 HYPE
- Streak bonus: +2 HYPE per day (max 6 days = 12 bonus)
- Modal auto-shows on first daily login
- Tracks last claim date and streak days

### Real-time Notifications
- Subscribes to database changes
- Notifies on HYPE received
- Notifies on new comments
- Toast-based notification system

## Future Enhancements

- [ ] Video post support
- [ ] Push notifications via Firebase
- [ ] Premium tier (Hype+)
- [ ] Chain battles feature
- [ ] AI content moderation
- [ ] Payment integration for HYPE packs
- [ ] AR effects and filters
- [ ] Analytics dashboard

## Contributing

This is a production-ready scaffold. Contributions are welcome!

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Supabase
