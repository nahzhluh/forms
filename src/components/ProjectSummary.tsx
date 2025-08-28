import React, { useState, useEffect } from 'react';
import { summaryService } from '../services/summaryService';

interface ProjectSummaryProps {
  projectId: string;
  onSummaryGenerated?: (summary: string) => void;
}

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({ 
  projectId, 
  onSummaryGenerated 
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      // Check for cached summary first
      let cached;
      try {
        cached = summaryService.getCachedSummary(projectId);
      } catch (error) {
        cached = null;
      }
      
      if (cached) {
        setSummary(cached);
        onSummaryGenerated?.(cached);
        return;
      }

      // Check if summary is already being generated in background
      if (summaryService.isGenerating(projectId)) {
        setIsGenerating(true);
        
        // Poll for completion
        const pollForSummary = async () => {
          for (let i = 0; i < 30; i++) { // Poll for up to 15 seconds (30 * 500ms)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updated = summaryService.getCachedSummary(projectId);
            if (updated) {
              setSummary(updated);
              onSummaryGenerated?.(updated);
              setIsGenerating(false);
              return;
            }
            
            // Check if still generating
            if (!summaryService.isGenerating(projectId)) {
              setIsGenerating(false);
              return;
            }
          }
          
          setIsGenerating(false);
        };
        
        pollForSummary();
        return;
      }

      // Generate new summary if not cached or outdated
      try {
        setIsGenerating(true);
        const generated = await summaryService.generateSummaryImmediate(projectId);
        
        if (generated) {
          setSummary(generated);
          onSummaryGenerated?.(generated);
        }
      } catch (error) {
        // Silent fallback - don't show summary if generation fails
      } finally {
        setIsGenerating(false);
      }
    };

    loadSummary();

    // Cleanup any pending generation when component unmounts
    return () => {
      summaryService.cancelGeneration(projectId);
    };
  }, [projectId, onSummaryGenerated]);

  // Listen for storage changes to update summaries when entries are saved
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'forms_data' && event.newValue) {
        // Small delay to ensure storage is fully updated
        setTimeout(() => {
          const updated = summaryService.getCachedSummary(projectId);
          if (updated && updated !== summary) {
            setSummary(updated);
            onSummaryGenerated?.(updated);
          } else {
            // If no cached summary after storage change, trigger generation
            summaryService.generateSummary(projectId);
          }
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [projectId, summary, onSummaryGenerated]);

  // Don't render anything if no summary and not generating
  if (!summary && !isGenerating) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="bg-neutral-50/50 border border-neutral-100 rounded-md p-3">
        {isGenerating ? (
          <div className="flex items-center space-x-2 text-neutral-400">
            <div className="animate-spin h-3 w-3 border-2 border-neutral-300 border-t-transparent rounded-full"></div>
            <span className="text-xs italic">Generating project summary...</span>
          </div>
        ) : summary ? (
          <p className="text-neutral-600 text-sm italic leading-relaxed">
            {summary}
          </p>
        ) : null}
      </div>
    </div>
  );
};