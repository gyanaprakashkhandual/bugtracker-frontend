"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Plus,
  RotateCcw,
  Clock,
  User,
  Tag,
  X,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";
import { useAlert } from "@/app/script/Alert.context";
import { useConfirm } from "@/app/script/Confirm.context";

const VersionControlComponent = () => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [newVersionData, setNewVersionData] = useState({
    versionName: "",
    description: "",
  });

  const { docId } = useDoc();
  const { testTypeId } = useTestType();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const projectId =
    typeof window !== "undefined"
      ? localStorage.getItem("currentProjectId")
      : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const baseURL = "http://localhost:5000/api/v1/doc";

  useEffect(() => {
    if (projectId && testTypeId && docId && token) {
      fetchVersions();
    }
  }, [projectId, testTypeId, docId, token]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch versions`);
      }

      const data = await response.json();
      setVersions(data.versions || []);
      setCurrentVersion(data.currentVersion);
    } catch (err) {
      showAlert({
        type: "error",
        message: err.message || "Failed to load versions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionData.versionName.trim()) {
      showAlert({
        type: "error",
        message: "Version name is required",
      });
      return;
    }

    setIsCreating(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVersionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create version");
      }

      setNewVersionData({ versionName: "", description: "" });
      setShowCreateModal(false);
      fetchVersions();
    } catch (err) {
      showAlert({
        type: "error",
        message: err.message || "Failed to create version",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    const result = await showConfirm({
      title: "Restore Version?",
      message: `Are you sure you want to restore to v${versionNumber}? This will replace the current document content with the content from this version.`,
      confirmText: "Restore",
      cancelText: "Cancel",
      type: "warning",
    });

    if (!result) return;

    setIsRestoring(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions/${versionNumber}/restore`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to restore version");
      }

      fetchVersions();
    } catch (err) {
      showAlert({
        type: "error",
        message: err.message || "Failed to restore version",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeDifference = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Version Control
              </h2>
              {currentVersion && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Current version: v{currentVersion}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Snapshot
          </motion.button>
        </div>

        {/* Versions List */}
        <div className="divide-y divide-gray-100">
          {versions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No version snapshots yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first snapshot to track changes
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {versions.map((version, index) => (
                  <motion.div
                    key={version._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors relative group"
                  >
                    {/* Timeline connector */}
                    {index < versions.length - 1 && (
                      <div className="absolute left-11 top-20 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Version Badge */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105 ${version.versionNumber === currentVersion
                            ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white ring-4 ring-purple-100"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                            }`}
                        >
                          v{version.versionNumber}
                        </div>
                      </div>

                      {/* Version Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                {version.versionName || "Unnamed Version"}
                              </h3>
                              {version.versionNumber === currentVersion && (
                                <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full">
                                  Current
                                </span>
                              )}
                            </div>

                            {version.description && (
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {version.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  {version.createdBy?.name || "Unknown User"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{getTimeDifference(version.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                <span className="text-gray-400">
                                  {formatDate(version.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Restore Button */}
                          {version.versionNumber !== currentVersion && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRestoreVersion(version.versionNumber)}
                              disabled={isRestoring}
                              className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isRestoring ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                              Restore
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Create Version Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isCreating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Create Version Snapshot
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Save current state of the document
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isCreating && setShowCreateModal(false)}
                  disabled={isCreating}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVersionData.versionName}
                    onChange={(e) =>
                      setNewVersionData({
                        ...newVersionData,
                        versionName: e.target.value,
                      })
                    }
                    placeholder="e.g., Initial Draft, Review v1, Final"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={isCreating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newVersionData.description}
                    onChange={(e) =>
                      setNewVersionData({
                        ...newVersionData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the changes in this version..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                    rows="4"
                    disabled={isCreating}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewVersionData({ versionName: "", description: "" });
                  }}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVersion}
                  disabled={isCreating || !newVersionData.versionName.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Version
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VersionControlComponent;