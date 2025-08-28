import testData from '../test-data.json';
import { storageService } from '../storage/localStorage';
import { Project, Entry, MediaItem, StorageData } from '../types';
import { generateTestImage } from './generatePlaceholderImage';

export const loadTestData = () => {
  try {
    // Build full StorageData so we can preserve provided IDs and timestamps
    const projects: Project[] = [];
    const entries: Entry[] = [];
    const media: MediaItem[] = [];

    testData.projects.forEach((projectData: any) => {
      projects.push({
        id: projectData.id,
        name: projectData.name,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt || projectData.createdAt,
        isActive: true,
      });

      projectData.entries?.forEach((entryData: any) => {
        entries.push({
          id: entryData.id,
          projectId: projectData.id,
          date: entryData.date,
          reflection: entryData.reflection,
          media: [],
          createdAt: entryData.createdAt,
          updatedAt: entryData.updatedAt || entryData.createdAt,
        });

        entryData.media?.forEach((mediaData: any) => {
          media.push({
            id: mediaData.id,
            entryId: entryData.id,
            fileName: mediaData.filename,
            fileSize: mediaData.fileSize || 0,
            mimeType: mediaData.type,
            dataUrl: generateTestImage(mediaData.filename),
            createdAt: mediaData.uploadedAt,
          });
        });
      });
    });

    const payload: StorageData = {
      projects,
      entries,
      media,
      summaries: [], // Empty summaries when loading test data
      lastSync: new Date().toISOString(),
    };

    // Overwrite storage with test data
    storageService.importData(payload);
    return true;
  } catch (error) {
    console.error('Failed to load test data:', error);
    return false;
  }
};

// Function to check if test data is already loaded
export const isTestDataLoaded = (): boolean => {
  try {
    const data = localStorage.getItem('forms_data');
    if (!data) return false;
    
    const parsedData = JSON.parse(data);
    if (!parsedData.projects || parsedData.projects.length === 0) return false;
    
    // Check if any of the test project IDs exist
    const testProjectIds = ['project-1', 'project-2', 'project-3', 'project-4', 'project-5', 'project-6', 'project-7'];
    return parsedData.projects.some((project: any) => testProjectIds.includes(project.id));
  } catch {
    return false;
  }
};
