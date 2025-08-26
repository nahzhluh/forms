import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { EntryDisplay } from '../components/EntryDisplay';
import { DateNavigation } from '../components/DateNavigation';
import { Project, Entry } from '../types';
import { getTodayString, validateReflection, convertFileToDataUrl, formatDate } from '../utils';
import { compressImage } from '../utils/imageCompression';
import { storageService } from '../storage/localStorage';
import { VALIDATION } from '../constants';
import { useFormState } from '../hooks/useFormState';
import { useMediaUpload } from '../hooks/useMediaUpload';

interface DailyEntryProps {
  project: Project;
}

export const DailyEntry: React.FC<DailyEntryProps> = ({ project }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };
  const [reflection, setReflection] = useState('');
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const { isLoading: isSaving, error, setIsLoading: setIsSaving, showError } = useFormState();
  const { images, fileInputRef, handleImageUpload, removeImage, clearImages } = useMediaUpload(
    VALIDATION.MAX_IMAGES_PER_ENTRY,
    existingEntry?.media?.length || 0,
    showError
  );

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
    clearImages();
  }, [project.id, selectedDate, clearImages]);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && existingEntry) {
      setReflection(existingEntry.reflection);
      // Note: We can't pre-populate images since they're stored as data URLs
      // Users would need to re-upload images if they want to change them
    }
  }, [isEditing, existingEntry]);


  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate reflection
      const reflectionValidation = validateReflection(reflection);
      if (!reflectionValidation.isValid) {
        showError(reflectionValidation.error || '');
        setIsSaving(false);
        return;
      }

      // Compress and convert images to data URLs
      const mediaItems = await Promise.all(
        images.map(async (file) => {
          const compressedFile = await compressImage(file);
          const dataUrl = await convertFileToDataUrl(compressedFile);
          return {
            fileName: file.name,
            fileSize: compressedFile.size, // Use compressed size
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
      clearImages();
      setIsEditing(false);

    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save entry');
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
                  clearImages();
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
            {/* Combined Reflection and Media Input */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate === getTodayString() ? 'Today\'s Reflection' : `${formatDate(selectedDate)} Reflection`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Text Input */}
                <div>
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
                </div>

                {/* Media Upload Section */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-neutral-700">Add Images</h4>
                    <span className="text-xs text-neutral-500">
                      {totalImages}/{VALIDATION.MAX_IMAGES_PER_ENTRY}
                    </span>
                  </div>
                  
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
                      disabled={totalImages >= VALIDATION.MAX_IMAGES_PER_ENTRY}
                      size="sm"
                    >
                      + Add Images
                    </Button>
                    <p className="text-sm text-neutral-500 mt-1">
                      Upload up to {VALIDATION.MAX_IMAGES_PER_ENTRY} images (JPEG, PNG, WebP, GIF, max 5MB each)
                    </p>
                  </div>

                  {/* Existing Images (when editing) */}
                  {isEditing && existingEntry?.media && existingEntry.media.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">Current Images:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {existingEntry.media.map((mediaItem) => (
                          <div key={mediaItem.id} className="relative group">
                            <img
                              src={mediaItem.dataUrl}
                              alt={mediaItem.fileName}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => {
                                storageService.deleteMediaItem(mediaItem.id);
                                // Refresh the entry to update the display
                                const updatedEntry = storageService.getEntryByDate(project.id, selectedDate);
                                if (updatedEntry) {
                                  const media = storageService.getMediaForEntry(updatedEntry.id);
                                  setExistingEntry({ ...updatedEntry, media });
                                }
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                            >
                              ×
                            </button>
                            <p className="text-xs text-neutral-500 mt-1 truncate">
                              {mediaItem.fileName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview Grid */}
                  {images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">
                        {isEditing ? 'Additional Images:' : 'New Images:'}
                      </p>
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
