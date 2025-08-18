import React from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Button } from '../components/ui';

export const ProjectDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Your Projects</h1>
            <p className="text-neutral-600 mt-2">
              Document your creative process and track your learning journey
            </p>
          </div>
          <Button size="lg">
            + New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Sample Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                This is a sample project to test the layout and components.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-neutral-300">
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-neutral-500 text-sm">Start a new project</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  + Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
