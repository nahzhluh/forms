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

// Summary types for project summaries
export interface ProjectSummary {
  projectId: string;
  summary: string;
  lastUpdated: string;
  entriesHash: string; // Hash of all entry IDs + updatedAt to detect changes
}

// Storage types for localStorage
export interface StorageData {
  projects: Project[];
  entries: Entry[];
  media: MediaItem[];
  summaries: ProjectSummary[];
  lastSync: string;
}
