import React from 'react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
        <div className="py-8">
          {children}
        </div>
      </div>
    </div>
  );
};
