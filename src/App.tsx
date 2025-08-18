import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { DailyEntry } from './pages/DailyEntry';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useProjects } from './hooks/useProjects';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<ProjectDashboard />} />
            <Route path="/project/:projectId" element={<DailyEntryWrapper />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

// Wrapper component to handle project loading for DailyEntry
function DailyEntryWrapper() {
  const { projects, isLoading } = useProjects();
  const { projectId } = useParams<{ projectId: string }>();
  
  console.log('DailyEntryWrapper - projectId:', projectId);
  console.log('DailyEntryWrapper - projects:', projects);
  console.log('DailyEntryWrapper - isLoading:', isLoading);
  
  // Show loading state while projects are being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-500">Loading project...</div>
      </div>
    );
  }
  
  const project = projects.find(p => p.id === projectId);
  
  console.log('DailyEntryWrapper - found project:', project);
  
  if (!project) {
    console.log('DailyEntryWrapper - project not found, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return <DailyEntry project={project} />;
}

export default App;
