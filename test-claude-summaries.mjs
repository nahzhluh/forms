// Simple test script for Claude API summarization
// Run with: node test-claude-summaries.mjs

import fs from 'fs';
import path from 'path';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function summarizeProjectEntries(projectName, entries) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('Anthropic API key not found in environment variables');
  }

  if (entries.length === 0) {
    throw new Error('No entries to summarize');
  }

  // Prepare the content for summarization
  const entriesText = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry, index) => `Day ${index + 1} (${entry.date}): ${entry.reflection}`)
    .join('\n\n');

  const prompt = `Here are the daily entries for a creative project called "${projectName}":

${entriesText}

Please write exactly 2 sentences that summarize this project. The tone should be encouraging and supportive but neutral - not like it's coming from a person. Focus on what the project is about, what has been learned or accomplished, and where it seems to be headed. Use "you" to address the creator directly, but avoid phrases like "I love how" or "I can see" - keep it observational and encouraging without personal commentary.`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    return data.content[0].text.trim();
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    // Load test data
    const testDataPath = path.join(process.cwd(), 'src', 'test-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    console.log('🤖 Testing Claude API summarization with test data...\n');
    
    for (const project of testData.projects) {
      if (project.entries && project.entries.length > 0) {
        try {
          console.log(`📝 Project: "${project.name}"`);
          console.log(`   Entries: ${project.entries.length}`);
          
          const summary = await summarizeProjectEntries(project.name, project.entries);
          
          console.log(`   Summary: ${summary}`);
          console.log('   ✅ Success\n');
          
          // Add a small delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        }
      } else {
        console.log(`📝 Project: "${project.name}"`);
        console.log('   Entries: 0');
        console.log('   ⚠️  Skipped (no entries)\n');
      }
    }
    
    console.log('🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runTests();