# Pricing Strategy Guide

## Current Plans

### Navy Goal - $4.97/month
Starter plan for individuals getting started with goal tracking.

### Pro Plan - $9.97/month (Recommended)
Most popular plan with unlimited features and AI.

### Delta Goal - $19.97/month
Premium plan for teams and power users.

## Yearly Pricing (25% discount)

- Navy Goal: $44.73/year (save $14.91)
- Pro Plan: $89.73/year (save $29.91)
- Delta Goal: $179.73/year (save $59.91)

## How to Add Features

Features are managed in your Supabase database using the `pricing_product_features` table.

Run the SQL files:
- `ADD_FEATURES_SIMPLE.sql` - Quick setup with product names
- `ADD_PLAN_FEATURES.sql` - Detailed setup with Polar product IDs

## Switching from Sandbox to Live

Update your `.env.local`:
```
POLAR_API_URL=https://api.polar.sh
```

Then replace your sandbox credentials with live ones from https://polar.sh/dashboard
