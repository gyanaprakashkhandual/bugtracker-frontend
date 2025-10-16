"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  UserCircle, 
  Activity,
  Loader2,
  Shield,
  Eye,
  MessageSquare,
  Edit
} from "lucide-react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const CollaborationComponent = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [activeEditors, setActiveEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [removingCollaborator, setRemovingCollaborator] = useState(null);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [updatingPermission, setUpdatingPermission] = useState(false);
  const [removingInProgress, setRemovingInProgress] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    userId: "",
    permission: "view",
  });

  const modalRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddModal(false);
      }
    };

    if (showAddModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddModal]);

  const fetchCollaborators = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`;
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
    setAddingCollaborator(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`;
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
      setSuccess("Collaborator added successfully!");
      setNewCollaborator({ userId: "", permission: "view" });
      setShowAddModal(false);
      fetchCollaborators();
    } catch (err) {
      console.error("Error adding collaborator:", err);
      setError(err.message);
    } finally {
      setAddingCollaborator(false);
    }
  };

  const handleUpdatePermission = async (collaboratorId, newPermission) => {
    setError(null);
    setSuccess(null);
    setUpdatingPermission(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`;
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
      setSuccess("Permission updated successfully!");
      setEditingPermission(null);
      fetchCollaborators();
    } catch (err) {
      console.error("Error updating permission:", err);
      setError(err.message);
    } finally {
      setUpdatingPermission(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    setError(null);
    setSuccess(null);
    setRemovingInProgress(true);

    try {
      const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`;
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
      setSuccess("Collaborator removed successfully!");
      setRemovingCollaborator(null);
      fetchCollaborators();
    } catch (err) {
      console.error("Error removing collaborator:", err);
      setError(err.message);
    } finally {
      setRemovingInProgress(false);
    }
  };

  const getPermissionBadgeColor = (permission) => {
    switch (permission) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "edit":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "comment":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "view":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "edit":
        return <Edit className="w-3 h-3" />;
      case "comment":
        return <MessageSquare className="w-3 h-3" />;
      case "view":
        return <Eye className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const SkeletonLoader = () => (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Collaborators</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
                {activeEditors.length > 0 && (
                  <span className="ml-2">· {activeEditors.length} active</span>
                )}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
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
              className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-semibold">Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-semibold">Success</p>
                <p className="text-xs text-green-700 mt-1">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Editors Section */}
        {activeEditors.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-green-600 animate-pulse" />
              <p className="text-sm font-semibold text-green-800">
                Currently Active
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeEditors.map((editor) => (
                <motion.div
                  key={editor._id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1.5 bg-white border border-green-200 rounded-full text-xs text-gray-700 flex items-center gap-2 shadow-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{editor.user?.name || "Unknown User"}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <SkeletonLoader />
          ) : collaborators.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No collaborators yet</p>
              <p className="text-gray-400 text-xs mt-1">Add collaborators to work together on this document</p>
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
                  className="p-5 hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {collaborator.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {collaborator.user?.name || "Unknown User"}
                        </p>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getPermissionBadgeColor(collaborator.permission)}`}>
                          {getPermissionIcon(collaborator.permission)}
                          {collaborator.permission}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {collaborator.user?.email || "No email"}
                      </p>
                      {collaborator.user?.role && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          {collaborator.user.role}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingPermission === collaborator._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              handleUpdatePermission(collaborator.user._id, e.target.value);
                            }}
                            defaultValue={collaborator.permission}
                            disabled={updatingPermission}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                          >
                            <option value="view">View Only</option>
                            <option value="comment">Can Comment</option>
                            <option value="edit">Can Edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingPermission ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <button
                              onClick={() => setEditingPermission(null)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingPermission(collaborator._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit permission"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRemovingCollaborator(collaborator)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove collaborator"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add Collaborator Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg text-white">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Add Collaborator</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User ID <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Permission Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCollaborator.permission}
                    onChange={(e) =>
                      setNewCollaborator({
                        ...newCollaborator,
                        permission: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="view">View Only - Can only view the document</option>
                    <option value="comment">Can Comment - View and add comments</option>
                    <option value="edit">Can Edit - Full editing permissions</option>
                    <option value="admin">Admin - Full control including sharing</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewCollaborator({ userId: "", permission: "view" });
                      setError(null);
                    }}
                    disabled={addingCollaborator}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCollaborator}
                    disabled={addingCollaborator || !newCollaborator.userId.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-md"
                  >
                    {addingCollaborator ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Add Collaborator
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Remove Collaborator?
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Are you sure you want to remove{" "}
                    <span className="font-semibold text-gray-900">
                      {removingCollaborator.user?.name || "this user"}
                    </span>{" "}
                    from this document?
                  </p>
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                    They will no longer have access to view or edit this document.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setRemovingCollaborator(null)}
                  disabled={removingInProgress}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleRemoveCollaborator(removingCollaborator.user._id)
                  }
                  disabled={removingInProgress}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md"
                >
                  {removingInProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
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