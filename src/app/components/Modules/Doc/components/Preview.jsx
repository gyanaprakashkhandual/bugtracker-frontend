"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  User,
  Clock,
  Eye,
  Users,
  MessageSquare,
  Calendar,
  Loader2,
  AlertCircle,
  Lock,
  Globe,
  Edit3,
} from "lucide-react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const PreviewComponent = () => {
  const { docId } = useDoc();
  const { testTypeId } = useTestType();
  
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedProjectId = localStorage.getItem("currentProjectId");
    
    if (storedToken) setToken(storedToken);
    if (storedProjectId) setProjectId(storedProjectId);
  }, []);

  useEffect(() => {
    if (!docId || !testTypeId || !projectId || !token) return;

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/doc/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch document");
        }

        const data = await response.json();
        setDoc(data.doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docId, testTypeId, projectId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Loading document...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-red-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Error Loading Document</h3>
          </div>
          <p className="text-sm text-slate-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">{doc.title}</h1>
              </div>
              {doc.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{doc.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {doc.isPublic ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </span>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Created by</p>
                <p className="text-sm font-medium text-slate-900">{doc.createdBy?.name || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Last edited</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Views</p>
                <p className="text-sm font-medium text-slate-900">{doc.views || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-semibold text-slate-900">Document Content</h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <div
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: doc.content || "<p>No content available</p>" }}
            />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Collaborators */}
          {doc.collaborators && doc.collaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Collaborators ({doc.collaborators.length})
                </h3>
              </div>
              <div className="space-y-2">
                {doc.collaborators.slice(0, 5).map((collab, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {collab.user?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{collab.user?.name}</p>
                        <p className="text-xs text-slate-500">{collab.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {collab.role}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comments */}
          {doc.comments && doc.comments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Comments ({doc.comments.length})
                </h3>
              </div>
              <div className="space-y-3">
                {doc.comments.slice(0, 3).map((comment, idx) => (
                  <div key={idx} className="pb-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                          {comment.user?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">{comment.user?.name}</p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PreviewComponent;