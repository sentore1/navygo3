// Test Polar Checkout API
const POLAR_API_KEY = "polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA";
const ORG_ID = "2d4bea8d-3408-4672-a1b5-b906db0ee08d";

async function testPolarCheckout() {
  try {
    // 1. Get products
    console.log("1. Fetching products...");
    const productsResponse = await fetch(
      `https://sandbox-api.polar.sh/v1/products?organization_id=${ORG_ID}&is_archived=false`,
      {
        headers: {
          Authorization: `Bearer ${POLAR_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!productsResponse.ok) {
      throw new Error(`Products fetch failed: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();
    console.log(`✅ Found ${productsData.items.length} products`);

    const firstProduct = productsData.items[0];
    const priceId = firstProduct.prices[0].id;

    console.log(`\n2. Testing checkout with:`);
    console.log(`   Product: ${firstProduct.name}`);
    console.log(`   Price ID: ${priceId}`);
    console.log(`   Amount: $${firstProduct.prices[0].price_amount / 100}`);

    // 2. Create checkout
    const checkoutResponse = await fetch(
      "https://sandbox-api.polar.sh/v1/checkouts/custom",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${POLAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_price_id: priceId,
          customer_email: "test@example.com",
          success_url: "http://localhost:3000/success?session_id={CHECKOUT_ID}",
          metadata: {
            test: "true",
          },
        }),
      }
    );

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      throw new Error(`Checkout failed: ${JSON.stringify(errorData)}`);
    }

    const checkoutData = await checkoutResponse.json();
    console.log(`\n✅ Checkout created successfully!`);
    console.log(`   Checkout ID: ${checkoutData.id}`);
    console.log(`   Checkout URL: ${checkoutData.url}`);
    console.log(`\n🎉 All tests passed! The API is working correctly.`);
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

testPolarCheckout();
