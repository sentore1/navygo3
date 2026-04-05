# Polar Checkout URLs Configuration

## When Creating Checkout Link in Polar

You'll need to provide these URLs:

### Success URL (Required)

**For localhost testing:**
```
http://localhost:3000/success
```

**Or use ngrok URL:**
```
https://epistylar-tonya-nontemporally.ngrok-free.dev/success
```

**For production (later):**
```
https://navygoal.com/success
```

### Cancel URL (Optional but Recommended)

**For localhost testing:**
```
http://localhost:3000/pricing
```

**Or use ngrok URL:**
```
https://epistylar-tonya-nontemporally.ngrok-free.dev/pricing
```

**For production (later):**
```
https://navygoal.com/pricing
```

## What Happens

### After Successful Payment:
1. User completes payment in Polar
2. Polar redirects to Success URL
3. User sees success page
4. Webhook fires (updates subscription in background)
5. User can go to dashboard

### If User Cancels:
1. User clicks "Cancel" in Polar checkout
2. Polar redirects to Cancel URL
3. User returns to pricing page
4. Can try again if they want

## Your Success Page

You already have a success page at `/success` that:
- ✅ Shows success message
- ✅ Displays confirmation
- ✅ Links to dashboard
- ✅ Links to home page

## Testing the Flow

1. Go to: `http://localhost:3000/pricing`
2. Click "Subscribe Now"
3. Complete checkout with test card: `4242 4242 4242 4242`
4. You'll be redirected to: `http://localhost:3000/success`
5. See success message
6. Click "View Dashboard" to see your subscription

## URL Configuration in Different Places

### In Polar Product/Checkout Link:
- Success URL: `http://localhost:3000/success`
- Cancel URL: `http://localhost:3000/pricing`

### In Your Code (already configured):
The checkout API route automatically sets these URLs:
```typescript
success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_ID}`
```

This means it will automatically use:
- Localhost: `http://localhost:3000/success`
- Ngrok: `https://epistylar-tonya-nontemporally.ngrok-free.dev/success`
- Production: `https://navygoal.com/success`

## Quick Reference

| Environment | Success URL | Cancel URL |
|-------------|-------------|------------|
| Localhost | `http://localhost:3000/success` | `http://localhost:3000/pricing` |
| Ngrok | `https://epistylar-tonya-nontemporally.ngrok-free.dev/success` | `https://epistylar-tonya-nontemporally.ngrok-free.dev/pricing` |
| Production | `https://navygoal.com/success` | `https://navygoal.com/pricing` |

## Important Notes

⚠️ **Use localhost for testing** - Even though you have ngrok, use `http://localhost:3000/success` because the redirect happens in your browser, not through ngrok.

⚠️ **Or use ngrok URL** - If you want to test the full flow through ngrok, use the ngrok URL.

✅ **Already configured in code** - Your checkout API automatically sets the correct URLs, so you don't need to manually configure them in Polar for each checkout.

## What to Enter in Polar

When creating a checkout link or configuring a product in Polar:

**Success URL:**
```
http://localhost:3000/success
```

**That's it!** The code handles the rest automatically.

## Testing Checklist

- [ ] Checkout redirects to Polar
- [ ] Complete payment with test card
- [ ] Redirects back to success page
- [ ] Success message displays
- [ ] Can navigate to dashboard
- [ ] Subscription shows as active
- [ ] Webhook fired (check terminal)

## Troubleshooting

### Redirects to wrong URL?

Check the checkout API route at `src/app/api/polar-checkout/route.ts` - it should automatically use the correct origin.

### Success page not loading?

Make sure your app is running on `http://localhost:3000`

### Want to customize success page?

Edit: `src/app/success/page.tsx`

You're all set! Use `http://localhost:3000/success` as your Success URL.
