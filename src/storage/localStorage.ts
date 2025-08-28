import { Project, Entry, MediaItem, StorageData, ProjectSummary } from '../types';

const STORAGE_KEY = 'forms_data';
const MAX_STORAGE_SIZE = 25 * 1024 * 1024; // 25MB limit - more conservative than browser limits

// Utility functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Storage management
export const storageService = {
  // Initialize storage
  initialize(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const initialData: StorageData = {
        projects: [],
        entries: [],
        media: [],
        summaries: [],
        lastSync: getCurrentTimestamp(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  },

  // Get all data
  getAllData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Ensure summaries field exists for backward compatibility
        return {
          projects: parsed.projects || [],
          entries: parsed.entries || [],
          media: parsed.media || [],
          summaries: parsed.summaries || [],
          lastSync: parsed.lastSync || getCurrentTimestamp(),
        };
      }
      return { projects: [], entries: [], media: [], summaries: [], lastSync: getCurrentTimestamp() };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return { projects: [], entries: [], media: [], summaries: [], lastSync: getCurrentTimestamp() };
    }
  },

  // Save all data
  saveAllData(data: StorageData): void {
    try {
      const jsonData = JSON.stringify(data);
      
      // Check our application storage size limit
      if (jsonData.length > MAX_STORAGE_SIZE) {
        throw new Error(`Storage limit exceeded. Current size: ${(jsonData.length / 1024 / 1024).toFixed(1)}MB. Please remove some media files.`);
      }
      
      // Try to save to localStorage
      localStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      
      // Handle browser storage quota errors specifically
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to determine actual size
        const currentSize = (JSON.stringify(data).length / 1024 / 1024).toFixed(1);
        throw new Error(`Browser storage quota exceeded! Your data (${currentSize}MB) exceeds the browser's localStorage limit. Try using fewer or smaller images, or clear old entries.`);
      }
      
      throw error;
    }
  },

  // Project operations
  getProjects(): Project[] {
    return this.getAllData().projects;
  },

  saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const data = this.getAllData();
    data.projects.push(newProject);
    this.saveAllData(data);
    
    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const data = this.getAllData();
    const projectIndex = data.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) return null;
    
    data.projects[projectIndex] = {
      ...data.projects[projectIndex],
      ...updates,
      updatedAt: getCurrentTimestamp(),
    };
    
    this.saveAllData(data);
    return data.projects[projectIndex];
  },

  deleteProject(id: string): boolean {
    const data = this.getAllData();
    const projectIndex = data.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) return false;
    
    // Remove project and all associated entries, media, and summaries
    data.projects.splice(projectIndex, 1);
    data.entries = data.entries.filter(e => e.projectId !== id);
    data.media = data.media.filter(m => {
      const entry = data.entries.find(e => e.id === m.entryId);
      return entry && entry.projectId !== id;
    });
    data.summaries = data.summaries.filter(s => s.projectId !== id);
    
    this.saveAllData(data);
    return true;
  },

  // Entry operations
  getEntries(projectId?: string): Entry[] {
    const data = this.getAllData();
    if (projectId) {
      return data.entries.filter(e => e.projectId === projectId);
    }
    return data.entries;
  },

  getEntry(id: string): Entry | null {
    const data = this.getAllData();
    return data.entries.find(e => e.id === id) || null;
  },

  getEntryByDate(projectId: string, date: string): Entry | null {
    const data = this.getAllData();
    return data.entries.find(e => e.projectId === projectId && e.date === date) || null;
  },

  saveEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Entry {
    const newEntry: Entry = {
      ...entry,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    const data = this.getAllData();
    data.entries.push(newEntry);
    
    // Update the project's updatedAt timestamp when a new entry is created
    const projectIndex = data.projects.findIndex(p => p.id === entry.projectId);
    if (projectIndex !== -1) {
      data.projects[projectIndex].updatedAt = getCurrentTimestamp();
    }
    
    this.saveAllData(data);
    
    return newEntry;
  },

  updateEntry(id: string, updates: Partial<Entry>): Entry | null {
    const data = this.getAllData();
    const entryIndex = data.entries.findIndex(e => e.id === id);
    
    if (entryIndex === -1) return null;
    
    data.entries[entryIndex] = {
      ...data.entries[entryIndex],
      ...updates,
      updatedAt: getCurrentTimestamp(),
    };
    
    // Update the project's updatedAt timestamp when an entry is modified
    const projectIndex = data.projects.findIndex(p => p.id === data.entries[entryIndex].projectId);
    if (projectIndex !== -1) {
      data.projects[projectIndex].updatedAt = getCurrentTimestamp();
    }
    
    this.saveAllData(data);
    return data.entries[entryIndex];
  },

  // Media operations
  saveMediaItem(mediaItem: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const newMediaItem: MediaItem = {
      ...mediaItem,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
    };

    const data = this.getAllData();
    data.media.push(newMediaItem);
    
    // Update the project's updatedAt timestamp when media is added
    const entry = data.entries.find(e => e.id === mediaItem.entryId);
    if (entry) {
      const projectIndex = data.projects.findIndex(p => p.id === entry.projectId);
      if (projectIndex !== -1) {
        data.projects[projectIndex].updatedAt = getCurrentTimestamp();
      }
    }
    
    this.saveAllData(data);
    
    return newMediaItem;
  },

  getMediaForEntry(entryId: string): MediaItem[] {
    const data = this.getAllData();
    return data.media.filter(m => m.entryId === entryId);
  },

  deleteMediaItem(id: string): boolean {
    const data = this.getAllData();
    const mediaIndex = data.media.findIndex(m => m.id === id);
    
    if (mediaIndex === -1) return false;
    
    const mediaItem = data.media[mediaIndex];
    data.media.splice(mediaIndex, 1);
    
    // Update the project's updatedAt timestamp when media is deleted
    const entry = data.entries.find(e => e.id === mediaItem.entryId);
    if (entry) {
      const projectIndex = data.projects.findIndex(p => p.id === entry.projectId);
      if (projectIndex !== -1) {
        data.projects[projectIndex].updatedAt = getCurrentTimestamp();
      }
    }
    
    this.saveAllData(data);
    return true;
  },

  // Utility functions
  getStorageSize(): number {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  },

  getStorageInfo(): { 
    sizeBytes: number; 
    sizeMB: string; 
    maxSizeMB: string; 
    usagePercent: string;
    mediaCount: number;
    projects: number;
    entries: number;
  } {
    const size = this.getStorageSize();
    const data = this.getAllData();
    
    return {
      sizeBytes: size,
      sizeMB: (size / 1024 / 1024).toFixed(1),
      maxSizeMB: (MAX_STORAGE_SIZE / 1024 / 1024).toFixed(0),
      usagePercent: ((size / MAX_STORAGE_SIZE) * 100).toFixed(1),
      mediaCount: data.media.length,
      projects: data.projects.length,
      entries: data.entries.length,
    };
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  exportData(): StorageData {
    return this.getAllData();
  },

  importData(data: StorageData): void {
    this.saveAllData(data);
  },

  // Summary operations
  getSummary(projectId: string): ProjectSummary | null {
    const data = this.getAllData();
    // Handle case where summaries might not exist in old data
    if (!data.summaries) {
      return null;
    }
    return data.summaries.find(s => s.projectId === projectId) || null;
  },

  saveSummary(summary: ProjectSummary): void {
    const data = this.getAllData();
    // Ensure summaries array exists
    if (!data.summaries) {
      data.summaries = [];
    }
    
    const existingIndex = data.summaries.findIndex(s => s.projectId === summary.projectId);
    
    if (existingIndex !== -1) {
      data.summaries[existingIndex] = summary;
    } else {
      data.summaries.push(summary);
    }
    
    this.saveAllData(data);
  },

  deleteSummary(projectId: string): boolean {
    const data = this.getAllData();
    // Handle case where summaries might not exist
    if (!data.summaries) {
      return false;
    }
    
    const initialLength = data.summaries.length;
    data.summaries = data.summaries.filter(s => s.projectId !== projectId);
    
    if (data.summaries.length < initialLength) {
      this.saveAllData(data);
      return true;
    }
    
    return false;
  },

  // Generate hash for detecting entry changes
  generateEntriesHash(projectId: string): string {
    const entries = this.getEntries(projectId);
    const hashString = entries
      .map(entry => `${entry.id}:${entry.updatedAt}`)
      .sort()
      .join('|');
    
    // Simple hash function (for localStorage, this is sufficient)
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  },
};
