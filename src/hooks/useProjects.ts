import { useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { storageService } from '../storage/localStorage';
import { handleError } from '../utils';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects from localStorage
  const loadProjects = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedProjects = storageService.getProjects();
      setProjects(loadedProjects);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback((name: string) => {
    try {
      setError(null);
      const newProject = storageService.saveProject({
        name,
        isActive: true,
      });
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Failed to create project:', err);
      throw err;
    }
  }, []);

  // Update a project
  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    try {
      setError(null);
      const updatedProject = storageService.updateProject(id, updates);
      if (updatedProject) {
        setProjects(prev => 
          prev.map(project => 
            project.id === id ? updatedProject : project
          )
        );
      }
      return updatedProject;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Failed to update project:', err);
      throw err;
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback((id: string) => {
    try {
      setError(null);
      const success = storageService.deleteProject(id);
      if (success) {
        setProjects(prev => prev.filter(project => project.id !== id));
      }
      return success;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Failed to delete project:', err);
      throw err;
    }
  }, []);

  // Get a specific project
  const getProject = useCallback((id: string) => {
    return projects.find(project => project.id === id) || null;
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    refreshProjects: loadProjects,
  };
};
