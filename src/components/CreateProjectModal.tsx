import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { validateProjectName } from '../utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateProjectName(projectName);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    onCreateProject(projectName.trim());
    setProjectName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setProjectName('');
    setError('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Project Name
                  </label>
                  <Input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter project name..."
                    className={error ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
