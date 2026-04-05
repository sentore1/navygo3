// Pricing Configuration
// Update this file to match your Polar products

export const pricingConfig = {
  // Set to true to fetch products from Polar API
  // Set to false to use the static plans below
  usePolarProducts: true,

  // Static pricing plans (used when usePolarProducts is false or as fallback)
  staticPlans: [
    {
      name: "Navy Goal",
      description: "Perfect for getting started with goal tracking",
      monthlyPrice: 4.97,
      yearlyPrice: 49.70, // ~$4.14/month, 17% savings
      currency: "USD",
      features: [
        "Goal Tracking",
        "AI Goal Writing",
        "Progress Visualization",
        "Reminders & Notifications",
        "Map of challenges",
        "Data Sync",
        "Priority Support",
      ],
      popular: true,
    },
    {
      name: "Delta Goal",
      description: "Advanced features for power users",
      monthlyPrice: 8.00,
      yearlyPrice: 80.00, // ~$6.67/month, 17% savings
      currency: "USD",
      features: [
        "Unlimited goals",
        "Advanced goal tracking",
        "Progress visualization",
        "Daily consistency tracking",
        "AI goal suggestions",
        "Priority support",
      ],
      popular: false,
    },
  ],

  // Feature mapping for Polar products
  // Maps product names to feature lists
  productFeatures: {
    "navygoal": [
      "Goal Tracking",
      "AI Goal Writing",
      "Progress Visualization",
      "Reminders & Notifications",
      "Map of challenges",
      "Data Sync",
      "Priority Support",
    ],
    "Navy goal": [
      "Goal Tracking",
      "AI Goal Writing",
      "Progress Visualization",
      "Reminders & Notifications",
      "Map of challenges",
      "Data Sync",
      "Priority Support",
    ],
    "navy goal": [
      "Goal Tracking",
      "AI Goal Writing",
      "Progress Visualization",
      "Reminders & Notifications",
      "Map of challenges",
      "Data Sync",
      "Priority Support",
    ],
    "Delta Goal": [
      "Unlimited goals",
      "Advanced goal tracking",
      "Progress visualization",
      "Daily consistency tracking",
      "AI goal suggestions",
      "Priority support",
    ],
    "delta goal": [
      "Unlimited goals",
      "Advanced goal tracking",
      "Progress visualization",
      "Daily consistency tracking",
      "AI goal suggestions",
      "Priority support",
    ],
  } as Record<string, string[]>,

  // Description mapping for Polar products (fallback if Polar doesn't provide description)
  productDescriptions: {
    "navygoal": "Perfect for getting started with goal tracking",
    "Navy goal": "Perfect for getting started with goal tracking",
    "navy goal": "Perfect for getting started with goal tracking",
    "Delta Goal": "Advanced features for power users",
    "delta goal": "Advanced features for power users",
  } as Record<string, string>,

  // Polar Checkout Links
  // Create these in your Polar dashboard: Products > [Product] > Checkout Links
  // For Sandbox: https://sandbox.polar.sh/dashboard
  // For Production: https://polar.sh/dashboard
  polarCheckoutLinks: {
    // navygoal - Monthly subscription ($4.90/month)
    "1ab0d75a-a693-4afb-b7c2-74b1183d5dea": "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_FSfuIA5D2WLNEGERbUeCkOfaPmzfPVT66vt402Ojk5w/redirect",
  } as Record<string, string>,

  // Billing cycle savings
  yearlySavingsPercent: 17,
};
