// Simple test file to validate Claude API functionality
// This can be imported and called from a React component temporarily

import { summarizeProjectEntries } from './services/claudeApi';
import testData from './test-data.json';

export async function runClaudeTests() {
  console.log('🤖 Testing Claude API summarization...\n');
  
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
}