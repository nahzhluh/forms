// Test script for Claude API summarization
// Run with: node test-summaries.js

const { testSummarizeWithTestData } = require('./dist/services/claudeApi.js');

console.log('Starting Claude API summarization test...\n');

testSummarizeWithTestData()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });