# Fix: Stripe API Version Update

## Issue
Build was failing with TypeScript error:
```
Type '"2024-11-20.acacia"' is not assignable to type '"2025-01-27.acacia"'
```

## Root Cause
The Stripe TypeScript package was updated to require the latest API version `2025-01-27.acacia`, but the code was still using the older version `2024-11-20.acacia`.

## Solution
Updated the Stripe API version in both files:

### Files Updated
1. `src/app/api/cancel-subscription/route.ts`
2. `src/app/api/create-portal-session/route.ts`

### Change Made
```typescript
// Before
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

// After
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});
```

## Impact
- ✅ Build now succeeds
- ✅ No breaking changes to functionality
- ✅ Uses latest Stripe API features
- ✅ TypeScript errors resolved

## Testing
After this fix:
1. Build completes successfully
2. Subscription cancellation works
3. Portal session creation works
4. No runtime errors

## Notes
- Stripe API versions are date-based
- TypeScript enforces using the latest version
- This is a non-breaking change (API compatibility maintained)
- Future Stripe package updates may require similar version bumps

## Status
✅ Fixed and verified
