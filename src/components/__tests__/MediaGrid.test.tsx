import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MediaGrid } from '../MediaGrid';
import { MediaItem } from '../../types';

const mockMedia: MediaItem[] = [
  {
    id: '1',
    entryId: 'entry1',
    fileName: 'test1.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
    dataUrl: 'data:image/jpeg;base64,test1',
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    entryId: 'entry1',
    fileName: 'test2.png',
    fileSize: 2048,
    mimeType: 'image/png',
    dataUrl: 'data:image/png;base64,test2',
    createdAt: '2023-01-01',
  },
];

describe('MediaGrid', () => {
  it('renders nothing when no media is provided', () => {
    const { container } = render(<MediaGrid media={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders media items in a grid', () => {
    render(<MediaGrid media={mockMedia} />);
    
    expect(screen.getByAltText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('test2.png')).toBeInTheDocument();
    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.png')).toBeInTheDocument();
  });

  it('opens modal when image is clicked', () => {
    render(<MediaGrid media={mockMedia} />);
    
    const firstImage = screen.getAllByAltText('test1.jpg')[0];
    fireEvent.click(firstImage);
    
    // Modal should be visible
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<MediaGrid media={mockMedia} />);
    
    const firstImage = screen.getAllByAltText('test1.jpg')[0];
    fireEvent.click(firstImage);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Modal should be closed
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });
});
