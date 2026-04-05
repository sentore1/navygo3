# Milestone Checkmarking Fix

## Most Likely Issues:

### 1. **Function Not Deployed**
The function `supabase-functions-toggle-milestone` might not be deployed.

**Check:**
```bash
supabase functions list
```

**Fix:**
```bash
cd supabase
supabase functions deploy supabase-functions-toggle-milestone
```

### 2. **RLS Policy Blocking Updates**
The Row Level Security policy might be preventing milestone updates.

**Check in Supabase Dashboard > SQL Editor:**
```sql
-- Test if you can update a milestone
SELECT * FROM milestones WHERE goal_id IN (
  SELECT id FROM goals WHERE user_id = auth.uid()
) LIMIT 1;
```

**Fix:** The policy looks correct in the migration, but verify it's applied:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'milestones';
```

### 3. **Completed Parameter Type Issue**
The `completed` parameter might not be sent correctly.

**Current code in goal-dashboard.tsx (line 467):**
```typescript
completed: Boolean(!milestone.completed),
```

**Should be:**
```typescript
completed: !milestone.completed,
```

The `Boolean()` constructor creates a Boolean object, not a primitive boolean.

### 4. **Missing Error Display**
Errors are shown with `alert()` which might be blocked.

**Better approach:** Use toast notifications or inline error messages.

## Recommended Fixes:

### Fix 1: Update goal-dashboard.tsx
Replace the onToggleMilestone function (around line 445):

```typescript
onToggleMilestone={async (goalId, milestoneId) => {
  try {
    const milestone = selectedGoal.milestones.find(
      (m) => m.id === milestoneId,
    );
    if (!milestone) return;

    console.log('Toggling milestone:', {
      goalId,
      milestoneId,
      currentCompleted: milestone.completed,
      newCompleted: !milestone.completed
    });

    // Optimistically update the UI immediately
    setSelectedGoal((prevGoal) => {
      if (!prevGoal) return prevGoal;
      return {
        ...prevGoal,
        milestones: prevGoal.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, completed: !m.completed }
            : m,
        ),
      };
    });

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-toggle-milestone",
      {
        body: {
          goalId,
          milestoneId,
          completed: !milestone.completed, // Remove Boolean() wrapper
        },
      },
    );

    console.log('Toggle response:', { data, error });

    if (error) {
      console.error('Toggle error:', error);
      throw error;
    }
    
    fetchGoals();
  } catch (err: any) {
    console.error("Error toggling milestone:", err);
    setError(err.message || "Failed to update milestone");
    // Revert the optimistic update if there was an error
    fetchGoals();
  }
}}
```

### Fix 2: Update goal-detail.tsx
Add better logging in handleToggleMilestone (around line 95):

```typescript
const handleToggleMilestone = async (
  milestoneId: string,
  completed: boolean,
) => {
  console.log('handleToggleMilestone called:', { milestoneId, completed, goalId: goal.id });
  
  setTogglingMilestoneId(milestoneId);
  try {
    if (onToggleMilestone) {
      // Use the prop function if provided
      onToggleMilestone(goal.id, milestoneId);

      // Optimistically update the UI immediately
      const updatedGoal = {
        ...goal,
        milestones: goal.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed } : m,
        ),
      };

      // Keep the loading state visible for a moment for better UX
      setTimeout(() => setTogglingMilestoneId(null), 500);
      return;
    }

    console.log('Invoking function with:', { goalId: goal.id, milestoneId, completed });

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-toggle-milestone",
      {
        body: { goalId: goal.id, milestoneId, completed },
      },
    );

    console.log('Function response:', { data, error });

    if (error) throw error;
    onUpdate();
    // Keep the loading state visible for a moment for better UX
    setTimeout(() => setTogglingMilestoneId(null), 500);
  } catch (error) {
    console.error("Error toggling milestone:", error);
    alert("Failed to update milestone. Please try again.");
    setTogglingMilestoneId(null);
  }
};
```

### Fix 3: Verify Function Deployment
Run these commands:

```bash
# Check if function exists
supabase functions list

# Deploy the function
supabase functions deploy supabase-functions-toggle-milestone

# Test the function
supabase functions serve supabase-functions-toggle-milestone
```

## Testing Steps:

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Click a milestone checkbox**
4. **Look for console.log messages:**
   - "handleToggleMilestone called"
   - "Toggling milestone"
   - "Invoking function with"
   - "Function response"
5. **Check for errors (red text)**
6. **Go to Network tab**
7. **Click checkbox again**
8. **Find the request to "supabase-functions-toggle-milestone"**
9. **Check the response**

## Expected Console Output (Success):
```
handleToggleMilestone called: {milestoneId: "xxx", completed: true, goalId: "yyy"}
Toggling milestone: {goalId: "yyy", milestoneId: "xxx", currentCompleted: false, newCompleted: true}
Invoking function with: {goalId: "yyy", milestoneId: "xxx", completed: true}
Function response: {data: {success: true}, error: null}
```

## Expected Console Output (Error):
```
handleToggleMilestone called: {milestoneId: "xxx", completed: true, goalId: "yyy"}
Toggling milestone: {goalId: "yyy", milestoneId: "xxx", currentCompleted: false, newCompleted: true}
Invoking function with: {goalId: "yyy", milestoneId: "xxx", completed: true}
Function response: {data: null, error: {message: "..."}}
Error toggling milestone: ...
```

The error message will tell you exactly what's wrong!
