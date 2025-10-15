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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
    setLoading(true);
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
      setShowAddForm(false);
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
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleRejectSuggestion = async (suggestionId) => {
    setLoading(true);
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
      setLoading(false);
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
        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSuggestions = suggestions.filter((s) =>
    filterStatus === "all" ? true : s.status === filterStatus
  );

  if (!docId || !projectId || !testTypeId) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
        <p className="text-sm text-gray-600">
          Please select a document to view suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <MessageSquarePlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Document Suggestions
          </h2>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {filteredSuggestions.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Suggestion</span>
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Suggestion Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <form onSubmit={handleAddSuggestion} className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Original Text
                  </label>
                  <textarea
                    value={formData.originalText}
                    onChange={(e) =>
                      setFormData({ ...formData, originalText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Suggested Text
                  </label>
                  <textarea
                    value={formData.suggestedText}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestedText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Index
                  </label>
                  <input
                    type="number"
                    value={formData.startIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, startIndex: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Index
                  </label>
                  <input
                    type="number"
                    value={formData.endIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, endIndex: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Why this change is needed..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Add Suggestion</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        {["all", "pending", "accepted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {loading && filteredSuggestions.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
            <MessageSquarePlus className="w-12 h-12 text-gray-300 mb-3" />
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
            {filteredSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
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
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedSuggestion === suggestion._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-700 mb-1 flex items-center">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Original
                      </p>
                      <p className="text-sm text-gray-800 line-through">
                        {suggestion.originalText}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-700 mb-1 flex items-center">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Suggested
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {suggestion.suggestedText}
                      </p>
                    </div>
                  </div>

                  {expandedSuggestion === suggestion._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-3 border-t border-gray-200"
                    >
                      {suggestion.description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Description
                          </p>
                          <p className="text-sm text-gray-600">
                            {suggestion.description}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>
                              {suggestion.suggestedBy?.name || "Unknown User"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(
                                suggestion.createdAt || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Position: {suggestion.startIndex} - {suggestion.endIndex}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {suggestion.status === "pending" && (
                    <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion._id)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(suggestion._id)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
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
    </div>
  );
}