"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const CollaborationComponent = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [activeEditors, setActiveEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [removingCollaborator, setRemovingCollaborator] = useState(null);
  const [newCollaborator, setNewCollaborator] = useState({
    userId: "",
    permission: "view",
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
      fetchCollaborators();
    }
  }, [projectId, testTypeId, docId, token]);

  const fetchCollaborators = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`;
      console.log("Fetching collaborators from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON. Check if API endpoint is correct.");
      }

      const data = await response.json();
      console.log("Fetched collaborators:", data);
      setCollaborators(data.collaborators || []);
      setActiveEditors(data.activeEditors || []);
    } catch (err) {
      console.error("Error fetching collaborators:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.userId.trim()) {
      setError("User ID is required");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`;
      console.log("Adding collaborator to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCollaborator),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log("Collaborator added:", data);
      setSuccess("Collaborator added successfully!");
      setNewCollaborator({ userId: "", permission: "view" });
      setShowAddForm(false);
      fetchCollaborators();
    } catch (err) {
      console.error("Error adding collaborator:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (collaboratorId, newPermission) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`;
      console.log("Updating permission at:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission: newPermission }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log("Permission updated:", data);
      setSuccess("Permission updated successfully!");
      setEditingPermission(null);
      fetchCollaborators();
    } catch (err) {
      console.error("Error updating permission:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`;
      console.log("Removing collaborator from:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log("Collaborator removed:", data);
      setSuccess("Collaborator removed successfully!");
      setRemovingCollaborator(null);
      fetchCollaborators();
    } catch (err) {
      console.error("Error removing collaborator:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionBadgeColor = (permission) => {
    switch (permission) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "edit":
        return "bg-blue-100 text-blue-700";
      case "comment":
        return "bg-yellow-100 text-yellow-700";
      case "view":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Icons
  const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const UserCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ActivityIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <UsersIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Collaborators</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {collaborators.length} collaborator{collaborators.length !== 1 ? "s" : ""}
                {activeEditors.length > 0 && (
                  <span className="ml-2">
                    · {activeEditors.length} active
                  </span>
                )}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            Add Collaborator
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
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
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
              <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                <CloseIcon />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Collaborator Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 overflow-hidden"
            >
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    User ID *
                  </label>
                  <input
                    type="text"
                    value={newCollaborator.userId}
                    onChange={(e) =>
                      setNewCollaborator({
                        ...newCollaborator,
                        userId: e.target.value,
                      })
                    }
                    placeholder="Enter user ID"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Permission Level *
                  </label>
                  <select
                    value={newCollaborator.permission}
                    onChange={(e) =>
                      setNewCollaborator({
                        ...newCollaborator,
                        permission: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="view">View Only</option>
                    <option value="comment">Can Comment</option>
                    <option value="edit">Can Edit</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCollaborator({ userId: "", permission: "view" });
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCollaborator}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding..." : "Add Collaborator"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Editors Section */}
        {activeEditors.length > 0 && (
          <div className="p-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-green-600 animate-pulse">
                <ActivityIcon />
              </div>
              <p className="text-xs font-medium text-green-800">
                Currently Editing
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeEditors.map((editor) => (
                <div
                  key={editor._id}
                  className="px-2 py-1 bg-white border border-green-200 rounded text-xs text-gray-700 flex items-center gap-1.5"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {editor.user?.name || "Unknown User"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="divide-y divide-gray-200">
          {loading && collaborators.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading collaborators...
            </div>
          ) : collaborators.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="text-gray-400 mb-2 flex justify-center">
                <UsersIcon />
              </div>
              <p>No collaborators yet.</p>
              <p className="text-xs mt-1">Add collaborators to work together on this document.</p>
            </div>
          ) : (
            <AnimatePresence>
              {collaborators.map((collaborator, index) => (
                <motion.div
                  key={collaborator._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                        {collaborator.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">
                          {collaborator.user?.name || "Unknown User"}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getPermissionBadgeColor(
                            collaborator.permission
                          )}`}
                        >
                          {collaborator.permission}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {collaborator.user?.email || "No email"}
                      </p>
                      {collaborator.user?.role && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {collaborator.user.role}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {editingPermission === collaborator._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              handleUpdatePermission(collaborator.user._id, e.target.value);
                            }}
                            defaultValue={collaborator.permission}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                          >
                            <option value="view">View</option>
                            <option value="comment">Comment</option>
                            <option value="edit">Edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingPermission(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingPermission(collaborator._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit permission"
                          >
                            <EditIcon />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRemovingCollaborator(collaborator)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove collaborator"
                          >
                            <TrashIcon />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {removingCollaborator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setRemovingCollaborator(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remove Collaborator?
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Are you sure you want to remove{" "}
                    <span className="font-medium">
                      {removingCollaborator.user?.name || "this user"}
                    </span>{" "}
                    from this document?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    They will no longer have access to view or edit this document.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setRemovingCollaborator(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleRemoveCollaborator(removingCollaborator.user._id)
                  }
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <TrashIcon />
                      Remove
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

export default CollaborationComponent;