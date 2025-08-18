import React from 'react';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <ProjectDashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
