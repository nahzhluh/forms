import { Project, Entry, MediaItem, StorageData } from '../types';

const STORAGE_KEY = 'forms_data';
const MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB limit

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
        lastSync: getCurrentTimestamp(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  },

  // Get all data
  getAllData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { projects: [], entries: [], media: [], lastSync: getCurrentTimestamp() };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return { projects: [], entries: [], media: [], lastSync: getCurrentTimestamp() };
    }
  },

  // Save all data
  saveAllData(data: StorageData): void {
    try {
      const jsonData = JSON.stringify(data);
      
      // Check storage size
      if (jsonData.length > MAX_STORAGE_SIZE) {
        throw new Error('Storage limit exceeded. Please remove some media files.');
      }
      
      localStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
    
    // Remove project and all associated entries and media
    data.projects.splice(projectIndex, 1);
    data.entries = data.entries.filter(e => e.projectId !== id);
    data.media = data.media.filter(m => {
      const entry = data.entries.find(e => e.id === m.entryId);
      return entry && entry.projectId !== id;
    });
    
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

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  exportData(): StorageData {
    return this.getAllData();
  },

  importData(data: StorageData): void {
    this.saveAllData(data);
  },
};
