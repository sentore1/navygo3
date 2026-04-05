# Polar Integration Checklist

## ✅ Complete Setup Checklist

### Database Setup
- [ ] Run migration: `COPY_PASTE_THIS.sql` (for admin role)
- [ ] Run migration: `supabase/migrations/20260403000002_add_polar_subscriptions.sql`
- [ ] Verify `polar_subscriptions` table exists
- [ ] Verify `payment_gateway_settings` table exists

### Admin Setup
- [ ] Make yourself admin: `UPDATE users SET role = 'admin' WHERE email = 'your-email'`
- [ ] Access `/admin` successfully
- [ ] Go to `/admin/settings`
- [ ] Enable Polar gateway (toggle to ON)

### Polar Products
- [ ] Login to https://polar.sh/dashboard
- [ ] Verify products exist (Navy goal, Delta Goal)
- [ ] Add monthly prices if needed
- [ ] Add yearly prices (optional but recommended)
- [ ] Set products as "Recurring"
- [ ] Make sure products are not archived

### Webhook Setup
- [ ] Get your webhook URL:
  - Production: `https://navygoal.com/api/polar-webhook`
  - Local: `https://your-ngrok-url.ngrok.io/api/polar-webhook`
- [ ] Go to Polar → Settings → Webhooks
- [ ] Click "Add Webhook"
- [ ] Paste webhook URL
- [ ] Select events:
  - [ ] subscription.created
  - [ ] subscription.updated
  - [ ] subscription.canceled
  - [ ] checkout.created
- [ ] Save and copy webhook secret
- [ ] Add secret to `.env.local`: `POLAR_WEBHOOK_SECRET=whsec_...`
- [ ] Restart server

### Environment Variables
Verify these are in `.env.local`:
- [ ] `POLAR_API_KEY=polar_oat_...`
- [ ] `POLAR_ORGANIZATION_ID=e80dcdcd-a93a-438c-91ef-d7981855377e`
- [ ] `POLAR_WEBHOOK_SECRET=whsec_...`
- [ ] `SUPABASE_URL=https://...`
- [ ] `SUPABASE_SERVICE_KEY=eyJ...`

### Testing
- [ ] Visit `/pricing` - products should load
- [ ] See correct prices from Polar
- [ ] Toggle Monthly/Yearly works
- [ ] Click "Subscribe Now" - redirects to Polar checkout
- [ ] Complete test purchase
- [ ] Check webhook received (check terminal logs)
- [ ] Verify subscription in `/admin`
- [ ] Check `polar_subscriptions` table has data
- [ ] User subscription status is "active"

### Production Deployment
- [ ] Deploy app to production
- [ ] Update webhook URL in Polar to production URL
- [ ] Test with real payment
- [ ] Verify subscription activates
- [ ] Test cancellation flow
- [ ] Monitor webhook delivery logs in Polar

## 🎯 Quick Test Flow

1. **Database**: Run migrations → Check tables exist
2. **Admin**: Make yourself admin → Access `/admin`
3. **Products**: Check Polar dashboard → Verify products
4. **Webhook**: Add in Polar → Test event → Check logs
5. **Purchase**: Buy subscription → Check admin → Verify access

## 📚 Documentation Reference

| Task | Guide |
|------|-------|
| Setup admin | `RUN_THIS_FIRST.md` |
| Database migrations | `COPY_PASTE_THIS.sql` |
| Polar webhook | `WEBHOOK_QUICK_START.md` |
| Update products | `UPDATE_POLAR_PRODUCTS.md` |
| Pricing explained | `PRICING_EXPLANATION.md` |
| Full webhook guide | `POLAR_WEBHOOK_SETUP.md` |

## 🚨 Common Issues

### Products not showing
- ✅ Check Polar API key is correct
- ✅ Verify products are not archived
- ✅ Check browser console for errors

### Webhook not working
- ✅ Verify webhook secret in `.env.local`
- ✅ Restart server after adding secret
- ✅ Check URL is publicly accessible
- ✅ Review Polar webhook delivery logs

### Subscription not activating
- ✅ Check webhook is configured
- ✅ Verify migrations are run
- ✅ Check Supabase logs
- ✅ Ensure user_id in metadata

## ✨ Success Criteria

You'll know everything works when:
- ✅ Pricing page shows your Polar products
- ✅ Clicking subscribe redirects to Polar checkout
- ✅ After payment, user subscription status = "active"
- ✅ User appears in admin dashboard with active subscription
- ✅ Subscription details show in `polar_subscriptions` table
- ✅ Webhook events logged in `webhook_events` table

## 🎉 You're Done When...

- [ ] Admin dashboard works
- [ ] Pricing page shows Polar products
- [ ] Webhook is configured and tested
- [ ] Test purchase completes successfully
- [ ] User gets access after payment
- [ ] Subscription shows in admin panel

## Need Help?

1. Check the specific guide for your issue
2. Review Polar dashboard logs
3. Check Supabase logs
4. Verify all environment variables
5. Test with ngrok locally first
