import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Project } from '../types';
import { formatDate } from '../utils';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick(project)}
    >
      <CardHeader>
        <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
          {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            Created {formatDate(project.createdAt)}
          </p>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Status: {project.isActive ? 'Active' : 'Archived'}</span>
            <span>Last updated: {formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
