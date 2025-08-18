import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateNavigation } from '../DateNavigation';

const mockEntries = [
  {
    id: 'entry-1',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'entry-2',
    date: '2024-01-16',
    createdAt: '2024-01-16T10:00:00.000Z',
  },
  {
    id: 'entry-3',
    date: '2024-01-17',
    createdAt: '2024-01-17T10:00:00.000Z',
  },
];

describe('DateNavigation', () => {
  const mockOnDateSelect = jest.fn();
  const mockOnTodayClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders timeline header and today button', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders past entries section when entries exist', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    expect(screen.getByText('Past Entries')).toBeInTheDocument();
  });

  it('shows empty state when no entries exist', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={[]}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    expect(screen.getByText('No entries yet')).toBeInTheDocument();
    expect(screen.getByText('Start documenting your process')).toBeInTheDocument();
  });

  it('shows appropriate message when only today\'s entry exists', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const todayEntry = {
      id: 'entry-today',
      date: today,
      createdAt: new Date().toISOString(),
    };

    render(
      <DateNavigation
        projectId="test-project"
        entries={[todayEntry]}
        selectedDate={today}
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    expect(screen.getByText('No past entries yet')).toBeInTheDocument();
    // Should not show any secondary message when there's only today's entry
    expect(screen.queryByText('Create your first entry today')).not.toBeInTheDocument();
  });

  it('calls onTodayClick when today button is clicked', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    fireEvent.click(screen.getByText('Today'));
    expect(mockOnTodayClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDateSelect when a past entry date is clicked', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    // Click on the first past entry (should be the most recent date)
    const pastEntryButtons = screen.getAllByText(/January 17/);
    fireEvent.click(pastEntryButtons[0]);
    
    expect(mockOnDateSelect).toHaveBeenCalledWith('2024-01-17');
  });

  it('highlights selected date', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    // The selected date should have primary styling
    const selectedButton = screen.getByText(/January 16/).closest('button');
    expect(selectedButton).toHaveClass('bg-primary-50');
  });

  it('sorts entries by date (newest first)', () => {
    render(
      <DateNavigation
        projectId="test-project"
        entries={mockEntries}
        selectedDate="2024-01-16"
        onDateSelect={mockOnDateSelect}
        onTodayClick={mockOnTodayClick}
      />
    );

    const dateButtons = screen.getAllByText(/January/);
    // Should show January 17 first (newest), then January 16, then January 15
    expect(dateButtons[0]).toHaveTextContent('January 17');
    expect(dateButtons[1]).toHaveTextContent('January 16');
    expect(dateButtons[2]).toHaveTextContent('January 15');
  });
});
