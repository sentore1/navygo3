# Milestone Checkmarking Debug Checklist

## 1. Check Browser Console (MOST IMPORTANT)
- Open DevTools (F12)
- Go to Console tab
- Click a milestone checkbox
- Look for errors (red text)
- Copy any error messages

## 2. Check Network Request
- Open DevTools (F12)
- Go to Network tab
- Click a milestone checkbox
- Find the "supabase-functions-toggle-milestone" request
- Check:
  - Status code (should be 200)
  - Request payload (should have goalId, milestoneId, completed)
  - Response body (should have success: true or error message)

## 3. Verify Function is Deployed
Run in terminal:
```bash
supabase functions list
```
Should show "supabase-functions-toggle-milestone"

## 4. Test Function Directly
Run in terminal:
```bash
curl -i --location --request POST 'YOUR_SUPABASE_URL/functions/v1/supabase-functions-toggle-milestone' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"goalId":"test-goal-id","milestoneId":"test-milestone-id","completed":true}'
```

## 5. Check Database
Run in Supabase SQL Editor:
```sql
-- Check if milestones exist
SELECT * FROM milestones LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'milestones';

-- Try manual update
UPDATE milestones 
SET completed = true 
WHERE id = 'YOUR_MILESTONE_ID';
```

## 6. Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution**: User not logged in or token expired
- Check: `await supabase.auth.getUser()`
- Fix: Re-login

### Issue: "Goal not found or access denied"
**Solution**: Goal doesn't belong to user or doesn't exist
- Check: goalId is correct
- Check: User owns the goal

### Issue: "Milestone not found or access denied"
**Solution**: RLS policy blocking update
- Check: Milestone exists
- Check: Milestone belongs to the goal
- Fix: Update RLS policy

### Issue: No error but checkbox doesn't stay checked
**Solution**: Frontend state not updating
- Check: `onUpdate()` is being called
- Check: `fetchGoals()` is working
- Fix: Add console.log to track state changes

### Issue: Request not being sent
**Solution**: JavaScript error preventing execution
- Check: Browser console for errors
- Check: Event handler is attached
- Fix: Debug the handleToggleMilestone function

## 7. Add Debug Logging
Add this to goal-detail.tsx handleToggleMilestone:
```typescript
console.log('Toggling milestone:', { milestoneId, completed, goalId: goal.id });
```

Add this to goal-dashboard.tsx onToggleMilestone:
```typescript
console.log('Dashboard toggle:', { goalId, milestoneId, completed: !milestone.completed });
```

## 8. Quick Fix to Try
If the issue is the completed parameter, update goal-dashboard.tsx line 467:
```typescript
// Change from:
completed: Boolean(!milestone.completed),

// To:
completed: !milestone.completed,
```
