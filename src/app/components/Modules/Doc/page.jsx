// components/DocumentList.jsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';

export default function DocumentList({ testTypeId }) {
    const [documents, setDocuments] = useState([]);
    const { slug } = useParams();
    const { project } = useProject(slug);
    const router = useRouter();

    useEffect(() => {
        if (project?._id) {
            fetchDocuments();
        }
    }, [project, testTypeId]);

    const fetchDocuments = async () => {
        const res = await fetch(`/api/documents/project/${project._id}/test-type/${testTypeId}`);
        const data = await res.json();
        setDocuments(data);
    };

    const handleCreateNew = () => {
        router.push(`/projects/${project._id}/test-types/${testTypeId}/documents/new`);
    };

    const handleDocumentClick = (docSlug) => {
        router.push(`/app/projects/${project.slug}/test-data/${docSlug}`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Documents</h2>
                <button
                    onClick={handleCreateNew}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Create New Document
                </button>
            </div>

            <div className="grid gap-4">
                {documents.map(doc => (
                    <div
                        key={doc._id}
                        className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
                        onClick={() => handleDocumentClick(doc.slug)}
                    >
                        <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
                        <p className="text-gray-600">Created by: {doc.createdBy?.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}