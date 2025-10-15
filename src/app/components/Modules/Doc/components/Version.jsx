"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const VersionControlComponent = () => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    versionName: "",
    description: "",
  });

  // Get context values
  const { docId } = useDoc();
  const { testTypeId } = useTestType();

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
    } else {
      console.log("Missing required data:", {
        projectId,
        testTypeId,
        docId,
        hasToken: !!token,
      });
    }
  }, [projectId, testTypeId, docId, token]);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`;
      console.log("Fetching versions from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server did not return JSON. Check if API endpoint is correct."
        );
      }

      const data = await response.json();
      console.log("Fetched versions:", data);
      setVersions(data.versions || []);
      setCurrentVersion(data.currentVersion);
    } catch (err) {
      console.error("Error fetching versions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionData.versionName.trim()) {
      setError("Version name is required");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`;
      console.log("Creating version at:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVersionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        );
      }

      const data = await response.json();
      console.log("Version created:", data);
      setSuccess("Version snapshot created successfully!");
      setNewVersionData({ versionName: "", description: "" });
      setShowCreateForm(false);
      fetchVersions();
    } catch (err) {
      console.error("Error creating version:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions/${versionNumber}/restore`;
      console.log("Restoring version at:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        );
      }

      const data = await response.json();
      console.log("Version restored:", data);
      setSuccess(`Document restored to version ${versionNumber}`);
      setShowRestoreConfirm(false);
      setSelectedVersion(null);
      fetchVersions();
    } catch (err) {
      console.error("Error restoring version:", err);
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Icons
  const GitBranchIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const RotateIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const UserIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const AlertIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  const CheckIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const TagIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-purple-600">
              <GitBranchIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Version Control
              </h2>
              {currentVersion && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Current version: v{currentVersion}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            Create Snapshot
          </motion.button>
        </div>

        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
            >
              <div className="text-red-600 flex-shrink-0">
                <AlertIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <CloseIcon />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
            >
              <div className="text-green-600 flex-shrink-0">
                <CheckIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">Success</p>
                <p className="text-xs text-green-700 mt-0.5">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600"
              >
                <CloseIcon />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Version Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 overflow-hidden"
            >
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Version Name *
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewVersionData({ versionName: "", description: "" });
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateVersion}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? "Creating..." : "Create Version"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Versions List */}
        <div className="divide-y divide-gray-200">
          {loading && versions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="text-gray-400 mb-2">
                <GitBranchIcon />
              </div>
              <p>No version snapshots yet.</p>
              <p className="text-xs mt-1">
                Create your first snapshot to track changes.
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {versions.map((version, index) => (
                  <motion.div
                    key={version._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors relative"
                  >
                    {/* Timeline connector */}
                    {index < versions.length - 1 && (
                      <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Version Number Badge */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            version.versionNumber === currentVersion
                              ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          v{version.versionNumber}
                        </div>
                      </div>

                      {/* Version Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {version.versionName || "Unnamed Version"}
                              </h3>
                              {version.versionNumber === currentVersion && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                  Current
                                </span>
                              )}
                            </div>

                            {version.description && (
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {version.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <UserIcon />
                                <span>
                                  {version.createdBy?.name || "Unknown User"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon />
                                <span>{getTimeDifference(version.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TagIcon />
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
                              onClick={() => {
                                setSelectedVersion(version);
                                setShowRestoreConfirm(true);
                              }}
                              className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
                            >
                              <RotateIcon />
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

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {showRestoreConfirm && selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowRestoreConfirm(false);
              setSelectedVersion(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <AlertIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Restore Version?
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Are you sure you want to restore to{" "}
                    <span className="font-medium">
                      v{selectedVersion.versionNumber}
                    </span>{" "}
                    ({selectedVersion.versionName || "Unnamed"})?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    This will replace the current document content with the
                    content from this version. The current version will be
                    preserved in history.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => {
                    setShowRestoreConfirm(false);
                    setSelectedVersion(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleRestoreVersion(selectedVersion.versionNumber)
                  }
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateIcon />
                      Restore Version
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