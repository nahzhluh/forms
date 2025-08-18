import { storageService } from '../localStorage';

describe('localStorage service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty data when localStorage is empty', () => {
      storageService.initialize();
      const data = storageService.getAllData();
      
      expect(data.projects).toEqual([]);
      expect(data.entries).toEqual([]);
      expect(data.media).toEqual([]);
      expect(data.lastSync).toBeDefined();
    });
  });

  describe('project operations', () => {
    beforeEach(() => {
      storageService.initialize();
    });

    it('should create a new project', () => {
      const project = storageService.saveProject({
        name: 'New Project',
        isActive: true,
      });

      expect(project.name).toBe('New Project');
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it('should retrieve projects after creation', () => {
      storageService.saveProject({ name: 'Project 1', isActive: true });
      storageService.saveProject({ name: 'Project 2', isActive: true });

      const projects = storageService.getProjects();
      expect(projects.length).toBeGreaterThan(0);
      expect(projects.some(p => p.name === 'Project 1')).toBe(true);
      expect(projects.some(p => p.name === 'Project 2')).toBe(true);
    });
  });

  describe('entry operations', () => {
    let project: any;

    beforeEach(() => {
      storageService.initialize();
      project = storageService.saveProject({
        name: 'Test Project',
        isActive: true,
      });
    });

    it('should create a new entry', () => {
      const entry = storageService.saveEntry({
        projectId: project.id,
        date: '2023-01-01',
        reflection: 'Test reflection',
        media: [],
      });

      expect(entry.projectId).toBe(project.id);
      expect(entry.reflection).toBe('Test reflection');
      expect(entry.id).toBeDefined();
    });
  });
});
