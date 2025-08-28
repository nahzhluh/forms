// Backend API URL - change this for production deployment
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Flexible entry interface for API calls (can work with test data or real Entry type)
interface EntryForSummary {
  date: string;
  reflection: string;
}

interface BackendSummaryResponse {
  summary: string;
  projectName: string;
  entryCount: number;
  generatedAt: string;
}

interface BackendErrorResponse {
  error: string;
}

/**
 * Summarizes project entries using secure backend service
 * Returns 2 sentences that feel natural and encouraging
 */
export async function summarizeProjectEntries(
  projectName: string,
  entries: EntryForSummary[]
): Promise<string> {
  if (entries.length === 0) {
    throw new Error('No entries to summarize');
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
        entries
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate summary';
      
      try {
        const errorData: BackendErrorResponse = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse error response, use status text
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: BackendSummaryResponse = await response.json();
    
    if (!data.summary) {
      throw new Error('Invalid response format from backend service');
    }

    return data.summary;
  } catch (error) {
    console.error('Error calling backend summary service:', error);
    throw error;
  }
}

/**
 * Test function to generate summaries for all projects in test data
 * Logs the results to console for review
 */
export async function testSummarizeWithTestData() {
  try {
    // Import test data
    const testDataModule = await import('../test-data.json');
    const testData = testDataModule.default;
    
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