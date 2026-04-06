// Check the actual structure of polar_subscriptions table
const SUPABASE_URL = 'https://rilhdwxirwxqfgsqpiww.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzAxOTcyMSwiZXhwIjoyMDU4NTk1NzIxfQ.oboUzObna8V9AYOn6h5uDBOYdqHWuI8TvXLgEhYbTXk';

async function checkTableStructure() {
  try {
    // Try to insert a minimal record to see what fields are required
    const testSub = {
      id: 'test_sub_123',
      user_id: '14219fda-941a-47e9-9b73-49ddb60b64fe',
      status: 'active'
    };

    console.log('Testing minimal insert...');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/polar_subscriptions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testSub)
    });

    if (res.ok) {
      const result = await resJSON();
      console.log('✅ Test insert successful!');
      console.log('Result:', result);
      
      // Delete the test record
      await fetch(`${SUPABASE_URL}/rest/v1/polar_subscriptions?id=eq.test_sub_123`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      console.log('Test record deleted');
    } else {
      const error = await res.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTableStructure();
