import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { DailyEntry } from '../DailyEntry';
import { Project } from '../../types';

// Mock the localStorage service
jest.mock('../../storage/localStorage', () => ({
  storageService: {
    getEntryByDate: jest.fn(),
    getMediaForEntry: jest.fn(),
    saveEntry: jest.fn(),
    updateEntry: jest.fn(),
    saveMediaItem: jest.fn(),
    getEntries: jest.fn(),
  },
}));

describe('DailyEntry', () => {
  const mockProject: Project = {
    id: 'test-project-id',
    name: 'Test Project',
    createdAt: '2023-12-25T10:00:00.000Z',
    updatedAt: '2023-12-25T10:00:00.000Z',
    isArchived: false,
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL for file previews
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock storage service methods
    const { storageService } = require('../../storage/localStorage');
    storageService.getEntries.mockReturnValue([]);
  });

  describe('Image upload limits', () => {
    it('should prevent adding more than 5 images when editing existing entry with media', async () => {
      // Mock existing entry with 3 images
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const existingEntry = {
        id: 'entry-1',
        projectId: 'test-project-id',
        date: today,
        reflection: 'Test reflection',
        media: [
          { id: 'media-1', entryId: 'entry-1', dataUrl: 'data:image/jpeg;base64,test1', fileName: 'test1.jpg' },
          { id: 'media-2', entryId: 'entry-1', dataUrl: 'data:image/jpeg;base64,test2', fileName: 'test2.jpg' },
          { id: 'media-3', entryId: 'entry-1', dataUrl: 'data:image/jpeg;base64,test3', fileName: 'test3.jpg' },
        ],
        createdAt: '2023-12-25T10:00:00.000Z',
        updatedAt: '2023-12-25T10:00:00.000Z',
      };

      // Mock the storage service to return existing entry
      const { storageService } = require('../../storage/localStorage');
      storageService.getEntryByDate.mockReturnValue(existingEntry);
      storageService.getMediaForEntry.mockReturnValue(existingEntry.media);

      render(
        <BrowserRouter>
          <DailyEntry project={mockProject} />
        </BrowserRouter>
      );

      // Wait for the component to load the existing entry
      await waitFor(() => {
        expect(screen.getByText('Today\'s entry:')).toBeInTheDocument();
      });

      // Click edit button to show the form
      fireEvent.click(screen.getByText('Edit Entry'));

      // Wait for the form to be visible
      await waitFor(() => {
        expect(screen.getByText('+ Add Images (3/5)')).toBeInTheDocument();
      });

      // Create 3 more image files (this would exceed the 5-image limit)
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const file3 = new File(['test3'], 'test3.jpg', { type: 'image/jpeg' });

      const fileInput = screen.getByTestId('image-upload-input');
      
      // Try to upload 3 more images (total would be 6, exceeding limit)
      fireEvent.change(fileInput, {
        target: {
          files: [file1, file2, file3],
        },
      });

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/Maximum 5 images allowed/)).toBeInTheDocument();
      });

      // Verify the error message shows the correct breakdown
      expect(screen.getByText(/3 existing \+ 0 new \+ 2 being added/)).toBeInTheDocument();
    });

    it('should allow adding images up to the 5-image limit when editing', async () => {
      // Mock existing entry with 2 images
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const existingEntry = {
        id: 'entry-1',
        projectId: 'test-project-id',
        date: today,
        reflection: 'Test reflection',
        media: [
          { id: 'media-1', entryId: 'entry-1', dataUrl: 'data:image/jpeg;base64,test1', fileName: 'test1.jpg' },
          { id: 'media-2', entryId: 'entry-1', dataUrl: 'data:image/jpeg;base64,test2', fileName: 'test2.jpg' },
        ],
        createdAt: '2023-12-25T10:00:00.000Z',
        updatedAt: '2023-12-25T10:00:00.000Z',
      };

      // Mock the storage service to return existing entry
      const { storageService } = require('../../storage/localStorage');
      storageService.getEntryByDate.mockReturnValue(existingEntry);
      storageService.getMediaForEntry.mockReturnValue(existingEntry.media);

      render(
        <BrowserRouter>
          <DailyEntry project={mockProject} onBack={mockOnBack} />
        </BrowserRouter>
      );

      // Wait for the component to load the existing entry
      await waitFor(() => {
        expect(screen.getByText('Today\'s entry:')).toBeInTheDocument();
      });

      // Click edit button to show the form
      fireEvent.click(screen.getByText('Edit Entry'));

      // Wait for the form to be visible
      await waitFor(() => {
        expect(screen.getByText('+ Add Images (2/5)')).toBeInTheDocument();
      });

      // Create 3 image files (total would be 5, which is allowed)
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const file3 = new File(['test3'], 'test3.jpg', { type: 'image/jpeg' });

      const fileInput = screen.getByTestId('image-upload-input');
      
      // Upload 3 more images (total will be 5, which is allowed)
      fireEvent.change(fileInput, {
        target: {
          files: [file1, file2, file3],
        },
      });

      // Wait for the count to update
      await waitFor(() => {
        expect(screen.getByText('+ Add Images (5/5)')).toBeInTheDocument();
      });

      // Verify no error message appears
      expect(screen.queryByText(/Maximum 5 images allowed/)).not.toBeInTheDocument();
    });
  });
});
