import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { MediaGrid } from './MediaGrid';
import { Entry } from '../types';
import { formatDate, getTodayString } from '../utils';

interface EntryDisplayProps {
  entry: Entry;
  className?: string;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export const EntryDisplay: React.FC<EntryDisplayProps> = ({ 
  entry, 
  className = '', 
  showEditButton = false, 
  onEdit 
}) => {
  const isToday = entry.date === getTodayString();
  const shouldShowEditButton = showEditButton && isToday;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isToday ? 'Today\'s entry:' : formatDate(entry.date)}
          </CardTitle>
          {shouldShowEditButton && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit Entry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reflection Text */}
        <div>
          <h3 className="font-medium text-neutral-900 mb-2">Reflection</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-neutral-700">{entry.reflection}</p>
          </div>
        </div>

        {/* Media */}
        {entry.media && entry.media.length > 0 && (
          <div>
            <h3 className="font-medium text-neutral-900 mb-2">Media</h3>
            <MediaGrid media={entry.media} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
