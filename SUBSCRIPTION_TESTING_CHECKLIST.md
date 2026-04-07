# Subscription Management Testing Checklist

## Pre-Testing Setup

- [ ] Ensure Polar API key is configured in `.env.local`
- [ ] Ensure Polar Organization ID is configured
- [ ] Run database migration: `supabase db push` or apply migration manually
- [ ] Verify webhook is configured in Polar dashboard
- [ ] Have at least 2-3 test products in Polar with different prices

## Test 1: New Subscription (Baseline)

**Goal:** Verify basic subscription creation still works

- [ ] Sign in as a test user with no subscription
- [ ] Go to `/pricing` page
- [ ] Verify all plans show "Get It Done" button
- [ ] Click on a plan (e.g., Basic Monthly)
- [ ] Verify redirected to Polar checkout
- [ ] Complete checkout with test card
- [ ] Verify redirected back to success page
- [ ] Go to `/settings/subscription`
- [ ] Verify subscription shows as active
- [ ] Verify renewal date is displayed

**Expected Result:** ✅ Subscription created successfully

---

## Test 2: Subscription Switching (Upgrade)

**Goal:** Verify users can upgrade to a higher plan

- [ ] Have an active subscription (from Test 1)
- [ ] Go to `/pricing` page
- [ ] Verify current plan shows "Active" badge
- [ ] Verify current plan button says "Current Plan"
- [ ] Verify other plans show "Switch to This Plan" button
- [ ] Click on a higher-priced plan
- [ ] Verify confirmation dialog appears
- [ ] Confirm the switch
- [ ] Verify success message appears
- [ ] Verify page refreshes
- [ ] Verify new plan now shows as "Active"
- [ ] Go to Polar dashboard
- [ ] Verify subscription was updated
- [ ] Verify prorated billing was applied

**Expected Result:** ✅ Plan upgraded successfully with prorated billing

---

## Test 3: Subscription Switching (Downgrade)

**Goal:** Verify users can downgrade to a lower plan

- [ ] Have an active subscription on a higher-tier plan
- [ ] Go to `/pricing` page
- [ ] Click on a lower-priced plan
- [ ] Verify confirmation dialog appears
- [ ] Confirm the switch
- [ ] Verify success message appears
- [ ] Verify new plan shows as active
- [ ] Go to Polar dashboard
- [ ] Verify subscription was updated
- [ ] Verify billing adjustment was applied

**Expected Result:** ✅ Plan downgraded successfully

---

## Test 4: Subscription Cancellation

**Goal:** Verify proper cancellation flow

- [ ] Have an active subscription
- [ ] Go to `/settings/subscription`
- [ ] Verify "Cancel Subscription" button is visible
- [ ] Click "Cancel Subscription"
- [ ] Verify confirmation dialog appears
- [ ] Confirm cancellation
- [ ] Verify success message: "You'll retain access until..."
- [ ] Verify page refreshes
- [ ] Verify UI shows cancellation notice
- [ ] Verify "Renews on" changed to "Access until"
- [ ] Verify yellow warning box appears
- [ ] Verify "Cancel Subscription" button is now hidden
- [ ] Go to Polar dashboard
- [ ] Verify `cancel_at_period_end` is set to true
- [ ] Verify subscription status is still "active"

**Expected Result:** ✅ Subscription set to cancel at period end

---

## Test 5: Reactivation After Cancellation

**Goal:** Verify users can reactivate by switching plans

- [ ] Have a cancelled subscription (from Test 4)
- [ ] Go to `/pricing` page
- [ ] Verify cancellation notice is shown at bottom
- [ ] Click "Switch to This Plan" on any plan
- [ ] Verify confirmation dialog appears
- [ ] Confirm the switch
- [ ] Verify success message appears
- [ ] Go to `/settings/subscription`
- [ ] Verify cancellation notice is gone
- [ ] Verify "Renews on" is shown (not "Access until")
- [ ] Verify "Cancel Subscription" button is visible again
- [ ] Go to Polar dashboard
- [ ] Verify `cancel_at_period_end` is now false

**Expected Result:** ✅ Subscription reactivated successfully

---

## Test 6: Multiple Subscription Switches

**Goal:** Verify users can switch multiple times

- [ ] Have an active subscription
- [ ] Switch to Plan A
- [ ] Verify success
- [ ] Immediately switch to Plan B
- [ ] Verify success
- [ ] Switch back to original plan
- [ ] Verify success
- [ ] Go to Polar dashboard
- [ ] Verify only one active subscription exists
- [ ] Verify subscription history shows all changes

**Expected Result:** ✅ Multiple switches work correctly

---

## Test 7: Error Handling

**Goal:** Verify proper error messages

### Test 7a: Invalid Price ID
- [ ] Modify code temporarily to use invalid price ID
- [ ] Try to switch plans
- [ ] Verify error message is shown
- [ ] Verify user is not charged
- [ ] Verify subscription remains unchanged

### Test 7b: Network Error
- [ ] Disconnect from internet
- [ ] Try to switch plans
- [ ] Verify error message is shown
- [ ] Reconnect and verify subscription is unchanged

### Test 7c: Unauthorized Access
- [ ] Sign out
- [ ] Try to access `/api/change-subscription` directly
- [ ] Verify 401 Unauthorized response

**Expected Result:** ✅ Errors handled gracefully

---

## Test 8: UI/UX Verification

**Goal:** Verify all UI elements are correct

### Pricing Page
- [ ] All plans are displayed correctly
- [ ] Current plan has "Active" badge
- [ ] Other plans show "Switch to This Plan"
- [ ] Subscription info box shows at bottom
- [ ] Info box has correct status and dates
- [ ] Helpful tips are displayed
- [ ] "Manage Subscription" button works

### Subscription Management Page
- [ ] Current subscription details are correct
- [ ] Status is displayed correctly
- [ ] Renewal/cancellation date is correct
- [ ] "Switch to Different Plan" button works
- [ ] "Cancel Subscription" button works
- [ ] Cancellation notice appears when cancelled
- [ ] Warning colors are appropriate

**Expected Result:** ✅ All UI elements display correctly

---

## Test 9: Database Verification

**Goal:** Verify database is updated correctly

- [ ] Open Supabase dashboard
- [ ] Go to `polar_subscriptions` table
- [ ] Verify subscription record exists
- [ ] Verify `subscription_id` is populated
- [ ] Verify `product_id` is correct
- [ ] Verify `price_id` is correct
- [ ] Verify `status` is "active"
- [ ] Verify `cancel_at_period_end` is correct
- [ ] Verify `current_period_end` is correct
- [ ] Verify `updated_at` changes on updates

**Expected Result:** ✅ Database records are accurate

---

## Test 10: Webhook Verification

**Goal:** Verify webhooks update subscription correctly

- [ ] Go to Polar dashboard
- [ ] Manually update a subscription
- [ ] Wait for webhook to fire
- [ ] Check `webhook_events` table in Supabase
- [ ] Verify event was logged
- [ ] Verify `polar_subscriptions` was updated
- [ ] Verify `users` table was updated if needed

**Expected Result:** ✅ Webhooks process correctly

---

## Test 11: Edge Cases

### Test 11a: Switching to Same Plan
- [ ] Try to switch to current plan
- [ ] Verify appropriate message is shown

### Test 11b: Rapid Clicking
- [ ] Click "Switch to This Plan" multiple times rapidly
- [ ] Verify only one request is processed
- [ ] Verify loading state prevents multiple clicks

### Test 11c: Expired Subscription
- [ ] Have a subscription that expired
- [ ] Go to `/pricing` page
- [ ] Verify can subscribe to new plan
- [ ] Verify old subscription is not shown as active

**Expected Result:** ✅ Edge cases handled properly

---

## Test 12: Mobile Responsiveness

**Goal:** Verify mobile experience

- [ ] Open on mobile device or use browser dev tools
- [ ] Go to `/pricing` page
- [ ] Verify plans stack vertically
- [ ] Verify buttons are easily clickable
- [ ] Go to `/settings/subscription`
- [ ] Verify layout is mobile-friendly
- [ ] Verify buttons are full-width on mobile

**Expected Result:** ✅ Mobile experience is good

---

## Post-Testing Cleanup

- [ ] Remove test subscriptions from Polar
- [ ] Clear test data from database
- [ ] Remove testing tools from production code
  - [ ] Remove yellow "Testing Tools" box from `subscription-manager.tsx`
  - [ ] Remove `/api/clear-subscription` endpoint (or restrict to dev only)
- [ ] Add analytics tracking for subscription events
- [ ] Set up email notifications for subscription changes
- [ ] Document any issues found during testing

---

## Success Criteria

All tests should pass with these results:

✅ Users can create new subscriptions
✅ Users can switch between plans (upgrade/downgrade)
✅ Users can cancel subscriptions
✅ Users retain access until period end after cancellation
✅ Users can reactivate by switching plans
✅ All UI elements display correctly
✅ Database is updated correctly
✅ Webhooks process correctly
✅ Error handling works properly
✅ Mobile experience is good

---

## If Tests Fail

### Subscription Switching Fails
1. Check Polar API key permissions
2. Verify subscription ID is correct
3. Check Polar API logs
4. Verify price ID exists in Polar

### Cancellation Fails
1. Check Polar API key permissions
2. Verify subscription is in "active" status
3. Check Polar API logs
4. Verify webhook is configured

### UI Issues
1. Check browser console for errors
2. Verify data is being fetched correctly
3. Check component props are correct
4. Verify CSS classes are applied

### Database Issues
1. Verify migration was applied
2. Check RLS policies
3. Verify service role has permissions
4. Check for constraint violations

---

## Support Resources

- Polar API Documentation: https://docs.polar.sh/api
- Supabase Documentation: https://supabase.com/docs
- Project Documentation: See `SUBSCRIPTION_MANAGEMENT_GUIDE.md`
- Quick Reference: See `SUBSCRIPTION_QUICK_FIX_SUMMARY.md`
