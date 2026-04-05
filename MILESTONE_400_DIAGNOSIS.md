# 400 Bad Request Error - Diagnosis Guide

## 🔍 ROOT CAUSE ANALYSIS

The 400 error when calling `supabase-functions-toggle-milestone` can be caused by:

### 1. **Missing or Invalid Request Body Fields**
The Edge Function expects:
```json
{
  "goalId": "uuid-string",
  "milestoneId": "uuid-string", 
  "completed": boolean
}
```

**Common Issues:**
- `completed` is `undefined` instead of `true`/`false`
- `goalId` or `milestoneId` is `null` or `undefined`
- Field names are misspelled (e.g., `goal_id` instead of `goalId`)

### 2. **Function URL Mismatch**
Your function folder is: `supabase-functions-toggle-milestone`
Your function call uses: `"supabase-functions-toggle-milestone"`

✅ **This is CORRECT** - the function name matches the folder name.

### 3. **Authorization Issues**
The function requires a valid JWT token in the Authorization header.

**Check:**
- User is logged in
- Session is valid
- Token is being sent correctly

### 4. **Database/RLS Issues**
Even with correct data, the function can return 400 if:
- Goal doesn't exist
- Goal doesn't belong to the user
- Milestone doesn't exist
- RLS policies block the update

---

## 🚀 DEBUGGING STEPS

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Click a milestone checkbox
4. Look for these logs:

```
[FRONTEND] Calling toggle-milestone with: {goalId: "...", milestoneId: "...", completed: true}
[FRONTEND] Types: {goalId: "string", milestoneId: "string", completed: "boolean", completedValue: true}
[FRONTEND] Response: {data: null, error: {...}}
```

### Step 2: Check Network Tab
1. Go to Network tab in DevTools
2. Click a milestone checkbox
3. Find the request to `supabase-functions-toggle-milestone`
4. Click on it
5. Check:
   - **Request Headers**: Should have `Authorization: Bearer ...`
   - **Request Payload**: Should show the JSON body
   - **Response**: Shows the error message

### Step 3: Check Supabase Logs
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Edge Functions → supabase-functions-toggle-milestone
4. Click "Logs"
5. Look for the console.log messages:

```
[TOGGLE-MILESTONE] Function invoked
[TOGGLE-MILESTONE] Request body: {...}
[TOGGLE-MILESTONE] Parsed: {...}
[TOGGLE-MILESTONE] User: <user-id>
[TOGGLE-MILESTONE] Missing fields: {...}  ← THIS SHOWS THE PROBLEM
```

---

## ✅ CORRECTED CODE

### Frontend (goal-dashboard.tsx)
```typescript
const { data, error } = await supabase.functions.invoke(
  "supabase-functions-toggle-milestone",
  {
    body: {
      goalId: goalId,           // Must be string UUID
      milestoneId: milestoneId, // Must be string UUID
      completed: !milestone.completed, // Must be boolean (true/false)
    },
  },
);
```

### Edge Function (supabase-functions-toggle-milestone/index.ts)
The function validates:
```typescript
if (!goalId || !milestoneId || completed === undefined) {
  return new Response(
    JSON.stringify({ 
      error: "Goal ID, Milestone ID, and completed status are required",
      received: { goalId, milestoneId, completed }
    }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

## 🔧 MOST LIKELY CAUSES

### Cause #1: `completed` is `undefined`
**Problem:** The `completed` field is not being sent or is `undefined`.

**Check in console:**
```javascript
console.log(typeof completed); // Should be "boolean", not "undefined"
```

**Fix:** Ensure you're passing a boolean value:
```typescript
completed: !milestone.completed  // ✅ Correct
completed: Boolean(!milestone.completed)  // ❌ Wrong (creates Boolean object)
```

### Cause #2: Invalid UUID Format
**Problem:** `goalId` or `milestoneId` is not a valid UUID.

**Check:**
```javascript
console.log(goalId); // Should be like: "123e4567-e89b-12d3-a456-426614174000"
```

### Cause #3: Function Not Deployed
**Problem:** The function exists locally but isn't deployed to Supabase.

**Fix:**
```bash
supabase functions deploy supabase-functions-toggle-milestone
```

---

## 📋 VERIFICATION CHECKLIST

- [ ] Function name matches folder name: `supabase-functions-toggle-milestone`
- [ ] Request body includes all 3 fields: `goalId`, `milestoneId`, `completed`
- [ ] `completed` is a boolean (`true` or `false`), not `undefined`
- [ ] `goalId` and `milestoneId` are valid UUID strings
- [ ] User is authenticated (has valid session)
- [ ] Function is deployed to Supabase
- [ ] Browser console shows the request body being sent
- [ ] Supabase logs show the function receiving the request

---

## 🎯 NEXT STEPS

1. **Deploy the updated function with logging:**
   ```bash
   cd supabase
   supabase functions deploy supabase-functions-toggle-milestone
   ```

2. **Test the milestone toggle:**
   - Open your app
   - Open DevTools Console
   - Click a milestone checkbox
   - Check the console logs

3. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Edge Functions → supabase-functions-toggle-milestone → Logs
   - Look for the `[TOGGLE-MILESTONE]` messages

4. **Report back with:**
   - Console logs from browser
   - Network tab request/response
   - Supabase function logs

This will pinpoint the exact cause of the 400 error.
