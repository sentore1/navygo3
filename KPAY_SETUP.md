# KPay Integration Setup

## Overview
KPay payment gateway integrated for $4/month subscription using mobile money (MTN, Airtel).

## Files Created

### 1. Supabase Edge Functions
- `supabase/functions/kpay-checkout/index.ts` - Initiates payment
- `supabase/functions/kpay-webhook/index.ts` - Handles payment callbacks

### 2. Database Migration
- `supabase/migrations/20250101000001_create_kpay_tables.sql` - Creates kpay_transactions table

### 3. Frontend Components
- `src/components/kpay-checkout.tsx` - Payment form with phone/name input
- `src/app/pricing/kpay/page.tsx` - KPay pricing page

## Environment Variables Added to .env.local

```
KPAY_API_URL=https://pay.esicia.com
KPAY_USERNAME=your_kpay_username
KPAY_PASSWORD=your_kpay_password
KPAY_RETAILER_ID=your_retailer_id
KPAY_BANK_ID=63510
```

## Setup Steps

1. **Update Environment Variables**
   - Replace placeholder values in `.env.local` with your KPay credentials
   - Get credentials from KPay dashboard

2. **Run Database Migration**
   ```bash
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy kpay-checkout
   supabase functions deploy kpay-webhook
   ```

4. **Set Environment Variables in Supabase**
   ```bash
   supabase secrets set KPAY_USERNAME=your_username
   supabase secrets set KPAY_PASSWORD=your_password
   supabase secrets set KPAY_RETAILER_ID=your_retailer_id
   supabase secrets set KPAY_API_URL=https://pay.esicia.com
   supabase secrets set KPAY_BANK_ID=63510
   ```

5. **Whitelist IPs with KPay**
   - Submit your server IPs to KPay for whitelisting
   - Include Supabase Edge Function IPs

## Usage

Users can subscribe at: `/pricing/kpay`

Payment flow:
1. User enters name and phone number
2. System initiates KPay payment
3. User receives mobile money prompt
4. User confirms payment on phone
5. Webhook activates subscription for 1 month

## Testing

Use KPay sandbox: `https://pay.esicia.com`

Test phone numbers provided by KPay for sandbox testing.
