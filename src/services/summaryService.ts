import { summarizeProjectEntries } from './claudeApi';
import { storageService } from '../storage/localStorage';
import { ProjectSummary } from '../types';

// Debounce timeout for summary generation (500ms as per PRD)
const DEBOUNCE_DELAY = 500;

// Map to store debounce timeouts for each project
const debounceTimeouts = new Map<string, NodeJS.Timeout>();

// Map to store loading states for each project
const loadingStates = new Map<string, boolean>();

// Flag to track if bulk pre-generation is running
let isPreGenerating = false;

/**
 * Summary service that handles project summarization with debouncing and caching
 */
export const summaryService = {
  /**
   * Get cached summary for a project, or null if not cached or outdated
   */
  getCachedSummary(projectId: string): string | null {
    const cached = storageService.getSummary(projectId);
    if (!cached) {
      console.log('SummaryService: No cached summary found for:', projectId);
      return null;
    }

    // Check if the entries have changed since the summary was generated
    const currentHash = storageService.generateEntriesHash(projectId);
    console.log('SummaryService: Hash comparison for', projectId, '- cached:', cached.entriesHash, 'current:', currentHash);
    
    if (cached.entriesHash !== currentHash) {
      console.log('SummaryService: Summary is outdated for:', projectId);
      return null; // Summary is outdated
    }

    console.log('SummaryService: Returning valid cached summary for:', projectId);
    return cached.summary;
  },

  /**
   * Check if summary generation is currently in progress for a project
   */
  isGenerating(projectId: string): boolean {
    return loadingStates.get(projectId) || false;
  },

  /**
   * Generate and cache a summary for a project (debounced)
   * Returns immediately but triggers generation in the background
   */
  generateSummary(projectId: string): void {
    // Clear existing timeout if any
    const existingTimeout = debounceTimeouts.get(projectId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set up new debounced call
    const timeout = setTimeout(async () => {
      await this._generateSummaryImmediate(projectId);
    }, DEBOUNCE_DELAY);

    debounceTimeouts.set(projectId, timeout);
  },

  /**
   * Generate summary immediately without debouncing
   * Used for dashboard load and testing
   */
  async generateSummaryImmediate(projectId: string): Promise<string | null> {
    return this._generateSummaryImmediate(projectId);
  },

  /**
   * Internal method to actually generate the summary
   */
  async _generateSummaryImmediate(projectId: string): Promise<string | null> {
    try {
      console.log('SummaryService: Generating summary for project:', projectId);
      
      // Check if already generating
      if (this.isGenerating(projectId)) {
        console.log('SummaryService: Already generating, skipping');
        return null;
      }

      // Get project and entries
      const projects = storageService.getProjects();
      console.log('SummaryService: Found projects:', projects.length);
      
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        console.error('SummaryService: Project not found:', projectId);
        return null;
      }
      console.log('SummaryService: Found project:', project.name);

      const entries = storageService.getEntries(projectId);
      console.log('SummaryService: Found entries:', entries.length);
      
      if (entries.length === 0) {
        console.warn('SummaryService: No entries found for project:', projectId);
        return null;
      }

      // Set loading state
      loadingStates.set(projectId, true);

      // Generate current hash
      const currentHash = storageService.generateEntriesHash(projectId);

      // Check if we already have a current summary
      const existingSummary = storageService.getSummary(projectId);
      if (existingSummary && existingSummary.entriesHash === currentHash) {
        loadingStates.set(projectId, false);
        return existingSummary.summary;
      }

      // Call Claude API
      const summary = await summarizeProjectEntries(project.name, entries);

      // Cache the result
      const summaryData: ProjectSummary = {
        projectId,
        summary,
        lastUpdated: new Date().toISOString(),
        entriesHash: currentHash,
      };

      console.log('SummaryService: Saving summary to cache for:', projectId, summaryData);
      storageService.saveSummary(summaryData);
      console.log('SummaryService: Summary saved to cache for:', projectId);

      // Clear loading state
      loadingStates.set(projectId, false);

      return summary;

    } catch (error) {
      console.error('Error generating summary for project:', projectId, error);
      
      // Clear loading state
      loadingStates.set(projectId, false);
      
      // Return null on error (silent fallback as per PRD)
      return null;
    }
  },

  /**
   * Clear the cache for a specific project
   */
  clearCache(projectId: string): void {
    storageService.deleteSummary(projectId);
  },

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    const summaries = storageService.getAllData().summaries;
    summaries.forEach(summary => {
      storageService.deleteSummary(summary.projectId);
    });
  },

  /**
   * Cancel any pending summary generation for a project
   */
  cancelGeneration(projectId: string): void {
    const timeout = debounceTimeouts.get(projectId);
    if (timeout) {
      clearTimeout(timeout);
      debounceTimeouts.delete(projectId);
    }
    loadingStates.set(projectId, false);
  },

  /**
   * Pre-generate summaries for all projects in the background
   * Called from dashboard to ensure summaries are ready when users click projects
   */
  async preGenerateAllSummaries(): Promise<void> {
    // Prevent multiple simultaneous pre-generation runs
    if (isPreGenerating) {
      console.log('SummaryService: Pre-generation already in progress, skipping');
      return;
    }

    try {
      isPreGenerating = true;
      const projects = storageService.getProjects();
      console.log('SummaryService: Pre-generating summaries for', projects.length, 'projects');

      // Process projects in parallel but with some delay between starts to avoid overwhelming the API
      const promises = projects.map((project, index) => {
        return new Promise<void>((resolve) => {
          // Stagger the start times by 200ms to avoid hitting rate limits
          setTimeout(async () => {
            try {
              const entries = storageService.getEntries(project.id);
              if (entries.length === 0) {
                console.log('SummaryService: Skipping project with no entries:', project.name);
                resolve();
                return;
              }

              // Check if we already have a current summary
              const currentHash = storageService.generateEntriesHash(project.id);
              const existingSummary = storageService.getSummary(project.id);
              
              if (existingSummary && existingSummary.entriesHash === currentHash) {
                console.log('SummaryService: Summary already up-to-date for:', project.name);
                resolve();
                return;
              }

              console.log('SummaryService: Pre-generating summary for:', project.name);
              const result = await this._generateSummaryImmediate(project.id);
              console.log('SummaryService: Pre-generation result for', project.name, ':', result ? 'success' : 'failed');
              resolve();
            } catch (error) {
              console.warn('SummaryService: Failed to pre-generate summary for:', project.name, error);
              resolve(); // Don't fail the whole batch if one fails
            }
          }, index * 200); // Stagger by 200ms each
        });
      });

      await Promise.all(promises);
      console.log('SummaryService: Finished pre-generating summaries');
    } catch (error) {
      console.error('SummaryService: Error in pre-generation:', error);
    } finally {
      isPreGenerating = false;
    }
  },

  /**
   * Get summary status for debugging
   */
  getStatus(projectId: string): {
    hasCached: boolean;
    isGenerating: boolean;
    isDebouncing: boolean;
  } {
    return {
      hasCached: this.getCachedSummary(projectId) !== null,
      isGenerating: this.isGenerating(projectId),
      isDebouncing: debounceTimeouts.has(projectId),
    };
  },
};