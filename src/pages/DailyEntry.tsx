import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { EntryDisplay } from '../components/EntryDisplay';
import { DateNavigation } from '../components/DateNavigation';
import { Project, Entry } from '../types';
import { getTodayString, validateReflection, validateImageFile, convertFileToDataUrl, formatDate } from '../utils';
import { storageService } from '../storage/localStorage';
import { useEntries } from '../hooks/useEntries';

interface DailyEntryProps {
  project: Project;
}

export const DailyEntry: React.FC<DailyEntryProps> = ({ project }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };
  const [reflection, setReflection] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = getTodayString();
  const reflectionPrompt = "Describe what you worked on today. What worked? What frustrated you? What are you curious about?";

  // Calculate total images: existing media + new images
  const existingMediaCount = existingEntry?.media?.length || 0;
  const totalImages = existingMediaCount + images.length;

  // Function to refresh all entries
  const refreshAllEntries = useCallback(() => {
    const entries = storageService.getEntries(project.id);
    const entriesWithMedia = entries.map(entry => {
      const media = storageService.getMediaForEntry(entry.id);
      return { ...entry, media };
    });
    setAllEntries(entriesWithMedia);
  }, [project.id]);

  // Load all entries for the project
  useEffect(() => {
    refreshAllEntries();
  }, [refreshAllEntries]);

  // Load entry for selected date
  useEffect(() => {
    const entry = storageService.getEntryByDate(project.id, selectedDate);
    if (entry) {
      // Load media for the entry
      const media = storageService.getMediaForEntry(entry.id);
      setExistingEntry({ ...entry, media });
    } else {
      setExistingEntry(null);
    }
    // Reset editing state when changing dates
    setIsEditing(false);
    setReflection('');
    setImages([]);
  }, [project.id, selectedDate]);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && existingEntry) {
      setReflection(existingEntry.reflection);
      // Note: We can't pre-populate images since they're stored as data URLs
      // Users would need to re-upload images if they want to change them
    }
  }, [isEditing, existingEntry]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Calculate total images including files being added
    const totalWithNewFiles = totalImages;

    files.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        if (totalWithNewFiles + validFiles.length < 5) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: Maximum 5 images allowed (${existingMediaCount} existing + ${images.length} new + ${validFiles.length} being added)`);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      // Validate reflection
      const reflectionValidation = validateReflection(reflection);
      if (!reflectionValidation.isValid) {
        setError(reflectionValidation.error || '');
        return;
      }

      // Convert images to data URLs
      const mediaItems = await Promise.all(
        images.map(async (file) => {
          const dataUrl = await convertFileToDataUrl(file);
          return {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            dataUrl,
          };
        })
      );

      if (isEditing && existingEntry) {
        // Update existing entry
        storageService.updateEntry(existingEntry.id, {
          reflection: reflection.trim(),
        });

        // Save new media items if any
        for (const mediaItem of mediaItems) {
          storageService.saveMediaItem({
            entryId: existingEntry.id,
            ...mediaItem,
          });
        }
      } else {
        // Create new entry
        const entry = storageService.saveEntry({
          projectId: project.id,
          date: selectedDate,
          reflection: reflection.trim(),
          media: [],
        });

        // Save media items
        for (const mediaItem of mediaItems) {
          storageService.saveMediaItem({
            entryId: entry.id,
            ...mediaItem,
          });
        }
      }

      setSuccess(true);
      
      // Refresh all entries to update the sidebar
      refreshAllEntries();
      
      // Update existing entry state
      const updatedEntry = storageService.getEntryByDate(project.id, selectedDate);
      if (updatedEntry) {
        const media = storageService.getMediaForEntry(updatedEntry.id);
        setExistingEntry({ ...updatedEntry, media });
      }
      
      // Clear form and exit edit mode
      setReflection('');
      setImages([]);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTodayClick = () => {
    setSelectedDate(getTodayString());
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <DateNavigation
          projectId={project.id}
          entries={allEntries}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onTodayClick={handleTodayClick}
          onBack={handleBack}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{project.name}</h1>
            <p className="text-neutral-600 mt-1">Daily Entry - {formatDate(selectedDate)}</p>
          </div>
          <div className="flex space-x-3">
            {isEditing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setReflection('');
                  setImages([]);
                }}
                size="lg"
              >
                Cancel Edit
              </Button>
            )}
            {/* Only show save button if we're on today's date and either editing or no entry exists */}
            {selectedDate === getTodayString() && (isEditing || !existingEntry) && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !reflection.trim()}
                size="lg"
              >
                {isSaving ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
              </Button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-800">Entry saved successfully! Redirecting...</p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Show existing entry if it exists */}
        {existingEntry && !isEditing ? (
          <EntryDisplay 
            entry={existingEntry} 
            showEditButton={true}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <>
            {/* Reflection Input */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate === getTodayString() ? 'Today\'s Reflection' : `${formatDate(selectedDate)} Reflection`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder={reflectionPrompt}
                  className="min-h-[200px] resize-none"
                  onKeyDown={handleKeyDown}
                />
                <p className="text-sm text-neutral-500 mt-2">
                  Press Cmd+Enter to save
                </p>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="image-upload-input"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={totalImages >= 5}
                    >
                      + Add Images ({totalImages}/5)
                    </Button>
                    <p className="text-sm text-neutral-500 mt-1">
                      Upload up to 5 images (JPEG, PNG, WebP, GIF, max 5MB each)
                    </p>
                  </div>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <p className="text-xs text-neutral-500 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
