import { useState, useEffect, useCallback } from 'react';
import { Entry, MediaItem } from '../types';
import { storageService } from '../storage/localStorage';
import { handleError } from '../utils';

export const useEntries = (projectId: string) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries for a project
  const loadEntries = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedEntries = storageService.getEntries(projectId);
      
      // Load media for each entry
      const entriesWithMedia = loadedEntries.map(entry => {
        const media = storageService.getMediaForEntry(entry.id);
        return { ...entry, media };
      });
      
      setEntries(entriesWithMedia);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Failed to load entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Get entry by date
  const getEntryByDate = useCallback((date: string): Entry | null => {
    return entries.find(entry => entry.date === date) || null;
  }, [entries]);

  // Check if entry exists for today
  const hasEntryForToday = useCallback((date: string): boolean => {
    return entries.some(entry => entry.date === date);
  }, [entries]);

  // Get entry with media
  const getEntryWithMedia = useCallback((entryId: string): Entry | null => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return null;
    
    const media = storageService.getMediaForEntry(entryId);
    return { ...entry, media };
  }, [entries]);

  // Load entries on mount or when projectId changes
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    isLoading,
    error,
    getEntryByDate,
    hasEntryForToday,
    getEntryWithMedia,
    refreshEntries: loadEntries,
  };
};
