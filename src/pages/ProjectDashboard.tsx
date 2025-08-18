import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { DailyEntry } from './DailyEntry';
import { Button } from '../components/ui/Button';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import { loadTestData } from '../utils/loadTestData';

export const ProjectDashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { projects, isLoading, error, createProject, refreshProjects, deleteProject } = useProjects();


  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await createProject(name);
      // Immediately navigate to the new project's daily entry view
      setSelectedProject(newProject);
      // Ensure modal is closed
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error is handled by the hook and displayed in the UI
      console.error('Failed to create project:', err);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleLoadTestData = () => {
    console.log('Loading test data...');
    const success = loadTestData();
    console.log('Test data load result:', success);
    if (success) {
      refreshProjects();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
        console.log('Project deleted successfully');
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const renderProjects = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-neutral-500">Loading projects...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500 text-center">
            <p>Error loading projects</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-neutral-300">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-neutral-500 text-sm">No projects yet</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsCreateModalOpen(true)}>
                  + Create your first project
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
              onDelete={handleDeleteProject}
            />
          ))}
        
        {/* Add new project card - only show when there are no projects */}
        {projects.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-neutral-300">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-neutral-500 text-sm">Start a new project</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsCreateModalOpen(true)}>
                  + Create Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show DailyEntry if a project is selected
  if (selectedProject) {
    return (
      <DailyEntry
        project={selectedProject}
        onBack={handleBackToProjects}
      />
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Your Projects</h1>
            <p className="text-neutral-600 mt-2">
              Document your creative process and track your learning journey
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLoadTestData}
            >
              Load Test Data
            </Button>
            <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
              + New Project
            </Button>
          </div>
        </div>

        {renderProjects()}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      </div>
    </Layout>
  );
};
