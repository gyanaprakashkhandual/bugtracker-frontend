'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';
import Workspace from '@/app/pages/app/Workspace';

export default function WorkspacePage() {
  const { slug } = useParams();
  const { project, loading, error } = useProject(slug);

  useEffect(() => {
    if (project?.projectName && project?.projectDesc) {
      document.title = `${project.projectName} - ${project.projectDesc}`;
    } else if (project?.projectName) {
      document.title = project.projectName;
    }
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Error loading project</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Workspace />
    </div>
  );
}