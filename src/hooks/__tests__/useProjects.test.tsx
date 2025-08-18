import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useProjects } from '../useProjects';
import { storageService } from '../../storage/localStorage';

// Mock the storage service
jest.mock('../../storage/localStorage', () => ({
  storageService: {
    getProjects: jest.fn(),
    saveProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('loads projects on mount', () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', createdAt: '2023-01-01', updatedAt: '2023-01-01', isActive: true },
    ];
    mockStorageService.getProjects.mockReturnValue(mockProjects);

    const { result } = renderHook(() => useProjects());

    expect(mockStorageService.getProjects).toHaveBeenCalled();
  });

  it('creates a new project', () => {
    const newProject = {
      id: '2',
      name: 'New Project',
      createdAt: '2023-01-02',
      updatedAt: '2023-01-02',
      isActive: true,
    };
    mockStorageService.getProjects.mockReturnValue([]);
    mockStorageService.saveProject.mockReturnValue(newProject);

    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.createProject('New Project');
    });

    expect(mockStorageService.saveProject).toHaveBeenCalledWith({
      name: 'New Project',
      isActive: true,
    });
  });
});
