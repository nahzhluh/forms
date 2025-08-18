import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '../ProjectCard';
import { Project } from '../../types';

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  isActive: true,
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    const mockOnClick = jest.fn();
    render(<ProjectCard project={mockProject} onClick={mockOnClick} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<ProjectCard project={mockProject} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText('Test Project'));
    expect(mockOnClick).toHaveBeenCalledWith(mockProject);
  });

  it('shows archived status for inactive projects', () => {
    const archivedProject = { ...mockProject, isActive: false };
    const mockOnClick = jest.fn();
    
    render(<ProjectCard project={archivedProject} onClick={mockOnClick} />);

    expect(screen.getByText('Status: Archived')).toBeInTheDocument();
  });
});
