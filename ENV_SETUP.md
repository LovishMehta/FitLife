# FitLife Health Tracker - Environment Setup

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
# Get these from your Supabase project: Settings > API
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Paste contents of `supabase/schema.sql`
3. Run the query

**Schema includes 5 tables (OPTIMIZED):**
- `profiles` - User settings, daily goal
- `step_records` - Backup of device step data
- `messages` - Chat history (direct to user, no conversations table)
- `user_summaries` - AI-generated persistent memory
- `push_tokens` - Device notification tokens

### 3. Configure JWT Expiry (per MVP requirements)

1. Go to Settings > Authentication
2. Set JWT Expiry to `86400` (24 hours)
3. This reduces refresh calls from ~8/day to ~1/day

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy AI coach function
supabase functions deploy ai-coach
```

### 5. Set OpenAI API Key

1. Go to Settings > Edge Functions in Supabase dashboard
2. Add secret: `OPENAI_API_KEY` with your OpenAI API key

## Cost Estimates (per MVP doc)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | $0 |
| OpenAI GPT-3.5 | Pay-as-you-go | ~$15-20/month |
| Expo/EAS | Free | $0 |
| Sentry | Free (5K errors) | $0 |
| **Total** | | **~$15-20/month** |

## App Works Without Supabase

The app is designed to work fully offline without Supabase configured:
- Step tracking works locally
- Progress view uses local data
- Daily goals stored locally

Supabase is only needed for:
- Cloud backup/sync
- AI chat with real GPT-3.5
- Push notifications
