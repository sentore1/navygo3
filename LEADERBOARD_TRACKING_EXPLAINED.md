# Leaderboard Tracking System - How It Works

## Overview
The leaderboard automatically tracks and displays real rank badges based on users' actual scores from the database. No manual updates needed!

## How Rank Tracking Works

### 1. Score Calculation
Users earn points through:
- Completing goals (progress = 100)
- Maintaining streaks
- Achieving milestones

The `update_user_score()` function automatically calculates total scores:
```sql
CREATE OR REPLACE FUNCTION public.update_user_score(user_uuid UUID)
```

### 2. Automatic Rank Assignment
Ranks are assigned based on score thresholds:

| Rank | Score Required | Badge |
|------|---------------|-------|
| **General** | 5000+ | ⭐⭐⭐⭐⭐ |
| **Major** | 3500+ | ⭐⭐⭐⭐ |
| **Captain** | 2000+ | ⭐⭐⭐ |
| **Lieutenant** | 1000+ | ⭐⭐ |
| **Sergeant** | 600+ | ⭐ |
| **Corporal** | 300+ | ⚊⚊⚊ |
| **Private** | 150+ | ⚊ |
| **Recruit** | 0-149 | (No badge) |

### 3. Real-Time Display
The leaderboard component (`src/components/leaderboard-section.tsx`) reads from:
- `leaderboard_view` - Database view with real-time data
- `total_score` - User's actual score
- `rank_title` - Automatically assigned rank
- `completed_goals` - Count of finished goals
- `max_streak` - Longest streak achieved

### 4. Rank Badge Component
The `RankBadge` component displays:
- Stars for high ranks (Sergeant+)
- Chevrons for lower ranks (Corporal, Private)
- Hover tooltips with rank details
- Progress to next rank

## Avatar/Emoji Selection

### New Avatar Picker Features
Users can now choose their avatar in Settings > Profile:

1. **Upload Custom Image**
   - Click "Upload Image" button
   - Select JPG, GIF, or PNG (max 1MB)
   - Image is displayed on leaderboard

2. **Generate Random Avatar**
   - Click "Generate Avatar" button
   - Creates unique avatar using DiceBear API
   - New avatar each time

3. **Choose Avatar Style**
   - 6 different styles available:
     - **Avataaars** - Cartoon faces
     - **Robots** - Robot characters
     - **Emoji** - Fun emoji faces
     - **Lorelei** - Illustrated portraits
     - **Pixel** - Retro pixel art
     - **Thumbs** - Thumbs up/down
   
4. **Custom URL**
   - Enter any image URL manually
   - Supports external images

### How Avatar Selection Works

```typescript
// Avatar styles are generated using DiceBear API
const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

// Seed is based on user's name or email for consistency
const seed = formData.name || user.email.split('@')[0];
```

### Avatar Display on Leaderboard
- Avatars are fetched from `users.avatar_url` column
- Displayed as 56x56px (h-14 w-14) on leaderboard
- Fallback to initials if no avatar set
- Top 3 performers get primary-colored border

## Database Schema

### Users Table Columns
```sql
- id: UUID (primary key)
- name: TEXT
- avatar_url: TEXT (stores avatar image URL)
- display_name: TEXT (optional custom name for leaderboard)
- show_on_leaderboard: BOOLEAN (opt-in for visibility)
- total_score: INTEGER (automatically calculated)
- rank_title: TEXT (automatically assigned)
```

### Leaderboard View
```sql
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  u.id,
  COALESCE(NULLIF(u.display_name, ''), u.name) as name,
  u.avatar_url,
  u.total_score,
  u.rank_title,
  u.created_at,
  COUNT(DISTINCT g.id) as completed_goals,
  COALESCE(MAX(g.streak), 0) as max_streak
FROM public.users u
LEFT JOIN public.goals g ON g.user_id = u.id AND g.progress = 100
WHERE u.show_on_leaderboard = true
GROUP BY u.id, u.name, u.display_name, u.avatar_url, u.total_score, u.rank_title, u.created_at
ORDER BY u.total_score DESC;
```

## Automatic Updates

### When Scores Update
Scores are automatically recalculated when:
1. User completes a goal (progress reaches 100)
2. User achieves a milestone
3. Streak is updated
4. Admin manually triggers score update

### Trigger Function
```sql
-- Automatically updates score when goals change
CREATE TRIGGER update_user_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_score_for_goal();
```

## User Flow

### For Users:
1. **Enable Leaderboard** (Settings > Privacy)
   - Toggle "Show on Leaderboard"
   - Optionally set custom display name

2. **Choose Avatar** (Settings > Profile)
   - Upload image, generate avatar, or pick style
   - Preview shows immediately

3. **Earn Points**
   - Complete goals
   - Maintain streaks
   - Achieve milestones

4. **View Progress**
   - Check leaderboard position
   - See rank badge
   - Hover for rank details and next rank info

### For Admins:
- No manual rank assignment needed
- Scores update automatically
- Can view all users in admin dashboard
- Can manually trigger score recalculation if needed

## Rank Badge Tooltips

When users hover over rank badges, they see:
- **Current Rank** (e.g., "Lieutenant")
- **Description** (e.g., "Dedicated achiever with 1000+ points")
- **Next Rank** (e.g., "Captain")
- **Points Needed** (e.g., "500 points needed")

This motivates users to reach the next level!

## Privacy & Security

### Row Level Security (RLS)
- Only users with `show_on_leaderboard = true` appear
- Users can only see their own full profile
- Public can only see leaderboard-enabled profiles
- Email and sensitive data never displayed

### What's Shown on Leaderboard:
✅ Display name (or regular name)
✅ Avatar
✅ Total score
✅ Rank badge
✅ Completed goals count
✅ Max streak

❌ Email address
❌ Personal details
❌ Private goals
❌ Account information

## Testing the System

### Add Test Users
Run `POPULATE_LEADERBOARD.sql` to create demo users with various scores and ranks.

### Check Scores
```sql
SELECT name, total_score, rank_title 
FROM users 
WHERE show_on_leaderboard = true 
ORDER BY total_score DESC;
```

### Verify Leaderboard View
```sql
SELECT * FROM leaderboard_view LIMIT 10;
```

## Troubleshooting

### Leaderboard Not Showing
1. Check if any users have `show_on_leaderboard = true`
2. Verify users have scores > 0
3. Run `POPULATE_LEADERBOARD.sql` for test data

### Rank Not Updating
1. Check if `total_score` is correct
2. Manually trigger: `SELECT update_user_score(user_id);`
3. Verify trigger is active

### Avatar Not Displaying
1. Check `avatar_url` is valid
2. Try generating new avatar in settings
3. Verify URL is accessible

## Future Enhancements

Potential improvements:
- Weekly/monthly leaderboard resets
- Category-based leaderboards (fitness, learning, etc.)
- Team leaderboards
- Achievement badges
- Leaderboard history/trends
- Custom rank names per category
- Animated rank-up celebrations
