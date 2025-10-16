"use client";

import { useState, useEffect } from "react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api/v1/doc";

export default function SuggestionComponent() {
  const { docId } = useDoc();
  const { testTypeId } = useTestType();

  const [projectId, setProjectId] = useState(null);
  const [token, setToken] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAccepting, setIsAccepting] = useState(null);
  const [isRejecting, setIsRejecting] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    originalText: "",
    suggestedText: "",
    startIndex: 0,
    endIndex: 0,
    description: "",
  });

  // Initialize client-side values
  useEffect(() => {
    if (typeof window !== "undefined") {
      setProjectId(localStorage.getItem("currentProjectId"));
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Fetch suggestions on mount
  useEffect(() => {
    if (docId && projectId && testTypeId && token) {
      fetchSuggestions();
    }
  }, [docId, projectId, testTypeId, token]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            startIndex: parseInt(formData.startIndex),
            endIndex: parseInt(formData.endIndex),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add suggestion");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      setShowAddModal(false);
      setFormData({
        originalText: "",
        suggestedText: "",
        startIndex: 0,
        endIndex: 0,
        description: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId) => {
    setIsAccepting(suggestionId);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions/${suggestionId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept suggestion");
      }

      await fetchSuggestions();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAccepting(null);
    }
  };

  const handleRejectSuggestion = async (suggestionId) => {
    setIsRejecting(suggestionId);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions/${suggestionId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject suggestion");
      }

      await fetchSuggestions();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRejecting(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    return (
      <span
        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSuggestions = suggestions.filter((s) =>
    filterStatus === "all" ? true : s.status === filterStatus
  );

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-9 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Suggestion Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!docId || !projectId || !testTypeId) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl">
        <AlertCircle className="w-6 h-6 text-gray-400 mr-2" />
        <p className="text-sm text-gray-600 font-medium">
          Please select a document to view suggestions
        </p>
      </div>
    );
  }

  if (loading) return <SkeletonLoader />;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Header with Filters and Add Button */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Document Suggestions
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {["all", "pending", "accepted", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Add Suggestion Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              New Suggestion
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions List */}
      <div className="space-y-3">
        {filteredSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              No suggestions found
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {filterStatus !== "all"
                ? `No ${filterStatus} suggestions`
                : "Be the first to add a suggestion"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suggestion.status)}
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <button
                      onClick={() =>
                        setExpandedSuggestion(
                          expandedSuggestion === suggestion._id
                            ? null
                            : suggestion._id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedSuggestion === suggestion._id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-red-700 mb-2 flex items-center">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Original Text
                      </p>
                      <p className="text-sm text-gray-800 line-through">
                        {suggestion.originalText}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-green-700 mb-2 flex items-center">
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                        Suggested Text
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {suggestion.suggestedText}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSuggestion === suggestion._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pb-4 mb-4 border-b border-gray-200"
                      >
                        {suggestion.description && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Description
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {suggestion.description}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {suggestion.suggestedBy?.name || "Unknown User"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(
                                  suggestion.createdAt || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                            Position: {suggestion.startIndex} - {suggestion.endIndex}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {suggestion.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion._id)}
                        disabled={isAccepting === suggestion._id || isRejecting === suggestion._id}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAccepting === suggestion._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(suggestion._id)}
                        disabled={isAccepting === suggestion._id || isRejecting === suggestion._id}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRejecting === suggestion._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Suggestion Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isAdding && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <MessageSquarePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add New Suggestion
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Suggest improvements to the document
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isAdding && setShowAddModal(false)}
                  disabled={isAdding}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddSuggestion} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.originalText}
                      onChange={(e) =>
                        setFormData({ ...formData, originalText: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows="4"
                      placeholder="Enter the text to be replaced..."
                      required
                      disabled={isAdding}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.suggestedText}
                      onChange={(e) =>
                        setFormData({ ...formData, suggestedText: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows="4"
                      placeholder="Enter the replacement text..."
                      required
                      disabled={isAdding}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Index <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.startIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, startIndex: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                      required
                      disabled={isAdding}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Index <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.endIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, endIndex: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                      required
                      disabled={isAdding}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    placeholder="Explain why this change is needed..."
                    disabled={isAdding}
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        originalText: "",
                        suggestedText: "",
                        startIndex: 0,
                        endIndex: 0,
                        description: "",
                      });
                    }}
                    disabled={isAdding}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <MessageSquarePlus className="w-4 h-4" />
                        Add Suggestion
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}