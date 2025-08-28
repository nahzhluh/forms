// Test script for the summary service integration
// Run with: node test-summary-service.mjs

import fs from 'fs';
import path from 'path';

// Mock localStorage for Node.js testing
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// Import and initialize the storage service
const { storageService } = await import('./src/storage/localStorage.js');
const { summaryService } = await import('./src/services/summaryService.js');

// Initialize storage
storageService.initialize();

// Load test data
const testDataPath = path.join(process.cwd(), 'src', 'test-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log('🧪 Testing summary service integration...\n');

try {
  // Load one project for testing
  const testProject = testData.projects[0]; // "Watercolor Painting Journey"
  
  // Create the project in storage
  const project = storageService.saveProject({
    name: testProject.name,
    isActive: true,
  });
  
  console.log(`📝 Created project: "${project.name}" (${project.id})`);
  
  // Create entries
  for (const entryData of testProject.entries) {
    const entry = storageService.saveEntry({
      projectId: project.id,
      date: entryData.date,
      reflection: entryData.reflection,
      media: [], // Skip media for this test
    });
    
    console.log(`   📄 Created entry for ${entry.date}`);
  }
  
  console.log(`   Total entries: ${testProject.entries.length}\n`);
  
  // Test summary generation
  console.log('🤖 Generating summary...');
  const summary = await summaryService.generateSummaryImmediate(project.id);
  
  if (summary) {
    console.log(`✅ Summary generated successfully:`);
    console.log(`   "${summary}"\n`);
    
    // Test caching
    console.log('💾 Testing cache...');
    const cachedSummary = summaryService.getCachedSummary(project.id);
    
    if (cachedSummary === summary) {
      console.log('✅ Cache working correctly - same summary returned');
    } else {
      console.log('❌ Cache issue - different summary returned');
    }
    
    // Test status
    const status = summaryService.getStatus(project.id);
    console.log(`   Status: hasCached=${status.hasCached}, isGenerating=${status.isGenerating}`);
    
  } else {
    console.log('❌ Failed to generate summary');
  }
  
  console.log('\n🎉 Test completed!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
}