'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiFolder, FiSearch, FiX } from 'react-icons/fi';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";
import { useParams } from 'next/navigation';

const BASE_URL = 'http://localhost:5000/api/v1/doc';

const DocListSidebar = ({ RightSidebarOpen, setRightSidebarOpen }) => {
    const router = useRouter();
    const { slug } = useParams();
    const { project } = useProject(slug);
    const { testTypeId } = useTestType();
    const { setDocId } = useDoc();

    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [projectId, setProjectId] = useState('');

    // Get project ID from localStorage
    useEffect(() => {
        const currentProjectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : '';
        setProjectId(currentProjectId);
    }, []);

    // Fetch all documents
    useEffect(() => {
        const fetchDocs = async () => {
            if (!projectId || !testTypeId) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setDocs(data.docs || []);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId && testTypeId) {
            fetchDocs();
        }
    }, [projectId, testTypeId]);

    // Handle document double click
    const handleDocumentOpen = async (docId) => {
        try {
            setDocId(docId);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const docSlug = data.doc.slug;
                if (project?.slug && docSlug) {
                    router.push(`/app/projects/${project.slug}/test-data/${docSlug}`);
                }
            }
        } catch (error) {
            console.error('Error opening document:', error);
        }
    };

    // Filter documents based on search
    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Skeleton Loader Component
    const SkeletonLoader = () => (
        <div className="py-2 px-2">
            {[...Array(6)].map((_, index) => (
                <div key={index} className="px-3 py-2 mx-2 mb-1 rounded-md animate-pulse">
                    <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-200"></div>
                        <div className="flex-1 min-w-0">
                            <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-slate-100 rounded w-1/2 mb-2"></div>
                            <div className="flex items-center space-x-2">
                                <div className="h-4 bg-slate-100 rounded w-12"></div>
                                <div className="h-4 bg-slate-100 rounded w-8"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <AnimatePresence>
            {RightSidebarOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-h[calc(100vh-60px)] bg-white border-l border-slate-200 flex flex-col overflow-hidden"
                    style={{ minWidth: '280px', maxWidth: '280px' }}
                >
                    {/* Header */}
                    <div className="px-3 py-3 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <FiFolder className="h-3.5 w-3.5 text-blue-600" />
                                <h2 className="text-xs font-semibold text-slate-900">Documents</h2>
                                <span className="text-xs text-slate-400">
                                    {filteredDocs.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setRightSidebarOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                                title="Close sidebar"
                            >
                                <FiX className="h-3.5 w-3.5 text-slate-500" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <SkeletonLoader />
                        ) : filteredDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                    <FiFileText className="h-4 w-4 text-slate-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-600 text-center">
                                    {searchQuery ? 'No results found' : 'No documents yet'}
                                </p>
                                <p className="text-xs text-slate-400 text-center mt-1">
                                    {searchQuery ? 'Try different keywords' : 'Create your first document'}
                                </p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {filteredDocs.map((doc) => (
                                    <motion.div
                                        key={doc._id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onDoubleClick={() => handleDocumentOpen(doc._id)}
                                        className="px-3 py-2 mx-2 mb-1 rounded-md hover:bg-slate-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-start space-x-2">
                                            <div className="flex-shrink-0 w-6 h-6 rounded bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <FiFileText className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {doc.title}
                                                </h3>
                                                {doc.description && (
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                        {doc.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                            doc.status === 'in-review' ? 'bg-amber-50 text-amber-700' :
                                                                doc.status === 'archived' ? 'bg-slate-100 text-slate-600' :
                                                                    'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {doc.status === 'in-review' ? 'Review' :
                                                            doc.status === 'approved' ? 'Approved' :
                                                                doc.status === 'archived' ? 'Archived' : 'Draft'}
                                                    </span>
                                                    {doc.priority && (
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${doc.priority === 'critical' ? 'bg-red-50 text-red-700' :
                                                                doc.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                                                                    doc.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                                                                        'bg-green-50 text-green-700'
                                                            }`}>
                                                            {doc.priority.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
                        <p className="text-xs text-slate-500 text-center">
                            Double-click to open
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocListSidebar;