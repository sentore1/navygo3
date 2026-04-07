# Fix: AI Goal Creation Now Requires Pro Subscription

## Problem
AI goal creation was working for admins but falling back to hardcoded goals for regular users. The Edge Functions were missing subscription checks, so they couldn't verify if users had Pro access.

## Root Cause
The Supabase Edge Functions (`supabase-functions-generate-ai-goal` and `supabase-functions-openai-goal`) were only checking authentication but not verifying:
1. If the user is an admin
2. If the user has an active Pro subscription (Stripe or Polar)
3. If the user has trial access

## Solution Applied

### 1. Updated Edge Functions
Both AI goal generation functions now include comprehensive access checks:

```typescript
// Check if user is admin or has active subscription
const { data: userData } = await supabaseClient
  .from("users")
  .select("role, has_trial_access")
  .eq("id", user.id)
  .single();

const isAdmin = userData?.role === "admin";
const hasTrialAccess = userData?.has_trial_access;

// Check for active subscriptions (Stripe or Polar)
const { data: stripeData } = await supabaseClient
  .from("subscriptions")
  .select("count")
  .eq("user_id", user.id)
  .eq("status", "active");

const { data: polarData } = await supabaseClient
  .from("polar_subscriptions")
  .select("count")
  .eq("user_id", user.id)
  .eq("status", "active");

const hasActiveSubscription = hasStripeSubscription || hasPolarSubscription;

// Allow access if user is admin, has active subscription, or has trial access
if (!isAdmin && !hasActiveSubscription && !hasTrialAccess) {
  return new Response(
    JSON.stringify({ 
      error: "AI goal creation requires a Pro subscription",
      requiresSubscription: true 
    }), 
    { status: 403 }
  );
}
```

### 2. Updated Frontend Component
The `ai-goal-creator.tsx` component now properly handles subscription errors:

```typescript
if (data.requiresSubscription) {
  setError("AI goal creation requires a Pro subscription. Please upgrade to use this feature.");
  setLoading(false);
  return;
}
```

## Who Can Use AI Goal Creation?

✅ **Admins** - Full access regardless of subscription
✅ **Pro Users with Active Stripe Subscription** - Full access
✅ **Pro Users with Active Polar Subscription** - Full access
✅ **Users with Trial Access** - Full access during trial period
❌ **Free Users** - Will see subscription required message

## Deployment Instructions

### Step 1: Deploy the Updated Functions
Run the deployment script:

```bash
bash deploy-ai-functions.sh
```

Or deploy manually:

```bash
supabase functions deploy supabase-functions-generate-ai-goal
supabase functions deploy supabase-functions-openai-goal
```

### Step 2: Verify Deployment
1. Log in as a regular user (non-admin, no subscription)
2. Try to create an AI goal
3. You should see: "AI goal creation requires a Pro subscription"

### Step 3: Test with Pro User
1. Log in as a user with an active subscription
2. Try to create an AI goal
3. It should work and generate AI-powered goals

## Testing Checklist

- [ ] Admin user can create AI goals
- [ ] Pro user with Stripe subscription can create AI goals
- [ ] Pro user with Polar subscription can create AI goals
- [ ] User with trial access can create AI goals
- [ ] Free user sees subscription required message
- [ ] Error message is clear and actionable

## Environment Variables Required

Make sure these are set in your Supabase project:

```bash
# At least one of these based on your selected AI provider
OPENAI_API_KEY=sk-xxxxx
GROQ_API_KEY=gsk_xxxxx
GROK_API_KEY=xai-xxxxx
GEMINI_API_KEY=AIzaSy-xxxxx
```

## How It Works Now

1. User clicks "Generate Goal" in the AI Goal Creator
2. Frontend calls the Edge Function with user's auth token
3. Edge Function verifies:
   - User is authenticated
   - User is admin OR has active subscription OR has trial access
4. If authorized:
   - Checks AI settings (enabled, provider, model)
   - Calls the configured AI provider API
   - Returns AI-generated goal
5. If not authorized:
   - Returns 403 error with subscription required message
   - Frontend displays clear error to user

## Benefits

✅ Proper access control for AI features
✅ Supports multiple subscription providers (Stripe, Polar)
✅ Supports trial access for new users
✅ Clear error messages for users
✅ Admin bypass for testing and support
✅ Consistent behavior across all users

## Next Steps

If you want to offer a limited free tier:
1. Add a `free_ai_credits` column to the users table
2. Check credits before allowing AI generation
3. Decrement credits after successful generation
4. Show remaining credits to users

Example:
```sql
ALTER TABLE users ADD COLUMN free_ai_credits INTEGER DEFAULT 3;
```

Then in the Edge Function:
```typescript
if (!isAdmin && !hasActiveSubscription && !hasTrialAccess) {
  // Check free credits
  if (userData.free_ai_credits > 0) {
    // Allow generation and decrement credits
    await supabaseClient
      .from("users")
      .update({ free_ai_credits: userData.free_ai_credits - 1 })
      .eq("id", user.id);
  } else {
    return subscription required error;
  }
}
```
