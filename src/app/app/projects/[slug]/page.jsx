'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/app/script/Project.context';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import Workspace from '@/app/pages/app/Workspace';
import BugTrackerSkeleton from '@/app/components/assets/Main.loader';

export default function WorkspacePage() {
  const { slug } = useParams();
  const { project, loading, error } = useProject(slug);
  const { testTypeId, testTypeName } = useTestType();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (project?.projectName && project?.projectDesc) {
      document.title = `${project.projectName} - ${project.projectDesc}`;
    } else if (project?.projectName) {
      document.title = project.projectName;
    }
  }, [project]);

  useEffect(() => {
    if (!loading && !error && !testTypeId) {
      showAlert({
        type: "info",
        message: "Please select a test type to continue the work",
        duration: 6000
      });
    }
  }, [testTypeId, loading, error, showAlert]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <BugTrackerSkeleton/>
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
    <div className="bg-gray-50 overflow-x-auto overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Workspace />
    </div>
  );
}