# Test Milestone Toggle

## Quick Test in Browser Console

Open your app, open DevTools Console (F12), and run:

```javascript
// Get the Supabase client
const { createClient } = await import('./supabase/client');
const supabase = createClient();

// Test data - replace with your actual IDs
const testData = {
  goalId: "YOUR_GOAL_ID_HERE",
  milestoneId: "YOUR_MILESTONE_ID_HERE", 
  completed: true
};

console.log("Testing with:", testData);

// Call the function
const response = await supabase.functions.invoke(
  "supabase-functions-toggle-milestone",
  { body: testData }
);

console.log("Response:", response);
console.log("Data:", response.data);
console.log("Error:", response.error);

if (response.error) {
  console.error("Error context:", response.error.context);
}
```

## What to Look For

1. **If you see 400 error with details:**
   - Check `response.error.context.body` - this shows what the function returned
   - It will tell you which field is missing or invalid

2. **If you see 401 Unauthorized:**
   - User is not logged in
   - Session expired

3. **If you see 404 Not Found:**
   - Function name is wrong
   - Function not deployed

4. **If you see 500 Internal Server Error:**
   - Bug in the Edge Function code
   - Check Supabase logs

## Get Your Goal/Milestone IDs

Run this first to get valid IDs:

```javascript
const { data: goals } = await supabase.functions.invoke("supabase-functions-get-goals", { body: {} });
console.log("Your goals:", goals);

// Pick the first goal with milestones
const goal = goals.find(g => g.milestones && g.milestones.length > 0);
console.log("Test with:", {
  goalId: goal.id,
  milestoneId: goal.milestones[0].id,
  completed: !goal.milestones[0].completed
});
```
