// Core data types for the Forms platform

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Entry {
  id: string;
  projectId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  reflection: string;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  entryId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string; // Base64 encoded image data for localStorage
  createdAt: string;
}

// Form types for data entry
export interface CreateProjectForm {
  name: string;
}

export interface CreateEntryForm {
  projectId: string;
  date: string;
  reflection: string;
  media: File[];
}

// UI state types
export interface AppState {
  projects: Project[];
  currentProject: Project | null;
  currentEntry: Entry | null;
  isLoading: boolean;
  error: string | null;
}

// Storage types for localStorage
export interface StorageData {
  projects: Project[];
  entries: Entry[];
  media: MediaItem[];
  lastSync: string;
}
