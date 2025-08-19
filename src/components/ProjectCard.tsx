import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Project } from '../types';
import { formatDate } from '../utils';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={() => onClick(project)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
            {project.name}
          </CardTitle>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              🗑️
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            Last updated: {formatDate(project.updatedAt)}
          </p>
          <div className="text-xs text-neutral-500">
            <span>Created: {formatDate(project.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
