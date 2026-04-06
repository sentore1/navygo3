/**
 * Test script for Goals API endpoints
 * 
 * Usage:
 *   node test-goals-api.js
 * 
 * Make sure to set your environment variables first:
 *   ADMIN_API_KEY=your-admin-key
 *   USER_ID=user-uuid-to-test-with
 *   API_URL=http://localhost:3000 (or your production URL)
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  adminApiKey: process.env.ADMIN_API_KEY,
  userId: process.env.USER_ID,
};

// Validate configuration
if (!config.adminApiKey) {
  console.error('❌ Error: ADMIN_API_KEY environment variable is required');
  process.exit(1);
}

if (!config.userId) {
  console.error('❌ Error: USER_ID environment variable is required');
  process.exit(1);
}

// Test data
const testCases = [
  {
    name: 'Easy Financial Goal',
    data: {
      prompt: 'I want to save $1000 for a new laptop',
      difficulty: 'easy',
      userId: config.userId,
      adminApiKey: config.adminApiKey,
    }
  },
  {
    name: 'Medium Learning Goal',
    data: {
      prompt: 'I want to learn JavaScript in 3 months',
      difficulty: 'medium',
      userId: config.userId,
      adminApiKey: config.adminApiKey,
    }
  },
  {
    name: 'Hard Fitness Goal',
    data: {
      prompt: 'I want to train for and complete a marathon',
      difficulty: 'hard',
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      userId: config.userId,
      adminApiKey: config.adminApiKey,
    }
  },
];

// Helper function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = lib.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          };
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Goals API Tests\n');
  console.log(`API URL: ${config.apiUrl}`);
  console.log(`User ID: ${config.userId}\n`);
  console.log('═'.repeat(80));
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log('─'.repeat(80));
    
    try {
      const url = `${config.apiUrl}/api/admin/goals/create-with-ai`;
      console.log(`Sending request to: ${url}`);
      console.log(`Prompt: "${testCase.data.prompt}"`);
      console.log(`Difficulty: ${testCase.data.difficulty}`);
      
      const response = await makeRequest(url, testCase.data);
      
      if (response.statusCode === 200) {
        console.log('✅ Status: Success (200)');
        console.log(`\nGenerated Goal:`);
        console.log(`  Title: ${response.body.goal.title}`);
        console.log(`  Description: ${response.body.goal.description.substring(0, 100)}...`);
        console.log(`  Milestones: ${response.body.goal.milestones.length}`);
        console.log(`\nMilestones:`);
        response.body.goal.milestones.forEach((milestone, index) => {
          console.log(`  ${index + 1}. ${milestone.title}`);
        });
        passed++;
      } else {
        console.log(`❌ Status: Failed (${response.statusCode})`);
        console.log(`Error: ${JSON.stringify(response.body, null, 2)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Status: Error`);
      console.log(`Error: ${error.message}`);
      failed++;
    }
    
    console.log('─'.repeat(80));
  }

  console.log('\n═'.repeat(80));
  console.log('\n📊 Test Results:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Total: ${testCases.length}`);
  console.log('\n═'.repeat(80));
}

// Run the tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
