// Test Groq API directly
// Run with: node test-groq-api.js

require('dotenv').config({ path: '.env.local' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🧪 Testing Groq API\n');
console.log('API Key:', GROQ_API_KEY.substring(0, 20) + '...\n');

const testPrompt = "I want to learn Python programming";
const difficulty = "medium";

async function testGroqAPI() {
  try {
    console.log('📤 Sending request to Groq API...');
    console.log('Prompt:', testPrompt);
    console.log('Difficulty:', difficulty);
    console.log('');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a goal-setting assistant. Create a structured goal with milestones based on the user's input. The difficulty level is ${difficulty}. Format your response as JSON with the following structure: { "title": "Goal Title", "description": "Goal description", "milestones": [{ "id": "unique-id", "title": "Milestone title", "description": "Milestone description", "completed": false }] }. For ${difficulty} difficulty, create 5-6 milestones.`,
          },
          {
            role: 'user',
            content: testPrompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    console.log('📥 Response status:', response.status, response.statusText);
    console.log('');

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Groq API Error:');
      console.error(JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('✅ Groq API Response:');
    console.log('');
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('❌ No content in response');
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log('Raw content:');
    console.log(content);
    console.log('');

    // Try to parse JSON
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                       content.match(/```([\s\S]*)```/) || 
                       [null, content];
      const jsonContent = jsonMatch[1] || content;
      const goalData = JSON.parse(jsonContent);

      console.log('✅ Parsed Goal Data:');
      console.log('');
      console.log('Title:', goalData.title);
      console.log('Description:', goalData.description);
      console.log('');
      console.log('Milestones:');
      goalData.milestones.forEach((milestone, index) => {
        console.log(`  ${index + 1}. ${milestone.title}`);
        if (milestone.description) {
          console.log(`     ${milestone.description}`);
        }
      });
      console.log('');
      console.log('✅ Test successful! Groq API is working correctly.');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:');
      console.error(parseError.message);
    }

  } catch (error) {
    console.error('❌ Error testing Groq API:');
    console.error(error.message);
  }
}

testGroqAPI();
