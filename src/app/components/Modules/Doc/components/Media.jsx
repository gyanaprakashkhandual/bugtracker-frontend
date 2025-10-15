"use client";

import { useState, useEffect, useRef } from "react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Paperclip,
  Code,
  Table,
  Upload,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Video,
  File,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Settings,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api/v1/doc";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvytvjplt/upload";
const UPLOAD_PRESET = "test_case_preset";

export default function MediaComponent() {
  const { docId } = useDoc();
  const { testTypeId } = useTestType();

  const [projectId, setProjectId] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("images");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [tables, setTables] = useState([]);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  // Form states
  const [imageForm, setImageForm] = useState({
    caption: "",
    altText: "",
    alignment: "left",
    wrapping: "inline",
  });

  const [attachmentForm, setAttachmentForm] = useState({
    description: "",
  });

  const [codeForm, setCodeForm] = useState({
    language: "javascript",
    code: "",
    title: "",
    theme: "dark",
    lineNumbers: true,
    highlightLines: [],
  });

  const [tableForm, setTableForm] = useState({
    title: "",
    headers: [""],
    rows: [[""]],
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    striped: true,
    columnWidths: [],
  });

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Initialize client-side values
  useEffect(() => {
    if (typeof window !== "undefined") {
      setProjectId(localStorage.getItem("currentProjectId"));
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (docId && projectId && testTypeId && token) {
      fetchDocumentData();
    }
  }, [docId, projectId, testTypeId, token]);

  const fetchDocumentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch document data");

      const data = await response.json();
      setImages(data.images || []);
      setAttachments(data.attachments || []);
      setCodeBlocks(data.codeBlocks || []);
      setTables(data.tables || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file, resourceType = "auto") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const url = CLOUDINARY_URL.replace("/image/", `/${resourceType}/`);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload to Cloudinary");

    return await response.json();
  };

  // Image Operations
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadToCloudinary(file, "image");
      setUploadedFile({ url: result.secure_url, publicId: result.public_id });
      setShowImageModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: uploadedFile.url,
            publicId: uploadedFile.publicId,
            caption: imageForm.caption,
            altText: imageForm.altText,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add image");

      const data = await response.json();
      setImages(data.images);
      setShowImageModal(false);
      setUploadedFile(null);
      setImageForm({ caption: "", altText: "", alignment: "left", wrapping: "inline" });
      setSuccess("Image added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = async (imageId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images/${imageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(imageForm),
        }
      );

      if (!response.ok) throw new Error("Failed to update image");

      await fetchDocumentData();
      setEditingItem(null);
      setSuccess("Image updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete image");

      await fetchDocumentData();
      setSuccess("Image deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Attachment Operations
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadToCloudinary(file, "raw");
      
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: file.name,
            url: result.secure_url,
            publicId: result.public_id,
            fileType: file.type,
            size: file.size,
            description: attachmentForm.description,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add attachment");

      const data = await response.json();
      setAttachments(data.attachments);
      setAttachmentForm({ description: "" });
      setSuccess("Attachment added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments/${attachmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete attachment");

      await fetchDocumentData();
      setSuccess("Attachment deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Code Block Operations
  const handleAddCodeBlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            language: codeForm.language,
            code: codeForm.code,
            title: codeForm.title || "Code Snippet",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add code block");

      const data = await response.json();
      setCodeBlocks(data.codeBlocks);
      setShowCodeModal(false);
      setCodeForm({
        language: "javascript",
        code: "",
        title: "",
        theme: "dark",
        lineNumbers: true,
        highlightLines: [],
      });
      setSuccess("Code block added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCodeBlock = async (codeBlockId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks/${codeBlockId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(codeForm),
        }
      );

      if (!response.ok) throw new Error("Failed to update code block");

      await fetchDocumentData();
      setEditingItem(null);
      setSuccess("Code block updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCodeBlock = async (codeBlockId) => {
    if (!confirm("Are you sure you want to delete this code block?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks/${codeBlockId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete code block");

      await fetchDocumentData();
      setSuccess("Code block deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Table Operations
  const handleAddTable = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: tableForm.title || "Untitled Table",
            headers: tableForm.headers,
            rows: tableForm.rows,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add table");

      const data = await response.json();
      setTables(data.tables);
      setShowTableModal(false);
      setTableForm({
        title: "",
        headers: [""],
        rows: [[""]],
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        striped: true,
        columnWidths: [],
      });
      setSuccess("Table added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTable = async (tableId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables/${tableId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tableForm),
        }
      );

      if (!response.ok) throw new Error("Failed to update table");

      await fetchDocumentData();
      setEditingItem(null);
      setSuccess("Table updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm("Are you sure you want to delete this table?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables/${tableId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete table");

      await fetchDocumentData();
      setSuccess("Table deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTableRow = () => {
    setTableForm({
      ...tableForm,
      rows: [...tableForm.rows, Array(tableForm.headers.length).fill("")],
    });
  };

  const addTableColumn = () => {
    setTableForm({
      ...tableForm,
      headers: [...tableForm.headers, ""],
      rows: tableForm.rows.map((row) => [...row, ""]),
    });
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newRows = [...tableForm.rows];
    newRows[rowIndex][colIndex] = value;
    setTableForm({ ...tableForm, rows: newRows });
  };

  const updateTableHeader = (index, value) => {
    const newHeaders = [...tableForm.headers];
    newHeaders[index] = value;
    setTableForm({ ...tableForm, headers: newHeaders });
  };

  if (!docId || !projectId || !testTypeId) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
        <p className="text-sm text-gray-600">
          Please select a document to manage media
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Media & Content</h2>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2"
          >
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-green-800">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        {[
          { id: "images", label: "Images", icon: ImageIcon, count: images.length },
          { id: "attachments", label: "Attachments", icon: Paperclip, count: attachments.length },
          { id: "code", label: "Code Blocks", icon: Code, count: codeBlocks.length },
          { id: "tables", label: "Tables", icon: Table, count: tables.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Images</h3>
              <div className="flex space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Upload Image</span>
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No images added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={image.altText || "Image"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      {editingItem === image._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={imageForm.caption}
                            onChange={(e) =>
                              setImageForm({ ...imageForm, caption: e.target.value })
                            }
                            placeholder="Caption"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={imageForm.altText}
                            onChange={(e) =>
                              setImageForm({ ...imageForm, altText: e.target.value })
                            }
                            placeholder="Alt text"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateImage(image._id)}
                              className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-gray-700">
                            {image.caption || "No caption"}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(image._id);
                                setImageForm({
                                  caption: image.caption || "",
                                  altText: image.altText || "",
                                  alignment: image.alignment || "left",
                                  wrapping: image.wrapping || "inline",
                                });
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded flex items-center justify-center space-x-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image._id)}
                              className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attachments Tab */}
        {activeTab === "attachments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Attachments</h3>
              <div className="flex space-x-2">
                <input
                  type="file"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                  id="attachment-upload"
                />
                <label
                  htmlFor="attachment-upload"
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Upload File</span>
                </label>
              </div>
            </div>

            {attachments.length === 0 ? (
              <div className="text-center py-12">
                <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No attachments added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <motion.div
                    key={attachment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={attachment.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Blocks Tab */}
        {activeTab === "code" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Code Blocks</h3>
              <button
                onClick={() => setShowCodeModal(true)}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Code Block</span>
              </button>
            </div>

            {codeBlocks.length === 0 ? (
              <div className="text-center py-12">
                <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No code blocks added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {codeBlocks.map((block) => (
                  <motion.div
                    key={block._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-800 p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-300">
                          {block.title || "Code Snippet"}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                          {block.language}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopyCode(block.code, block._id)}
                          className="px-2 py-1 text-xs bg-gray-700 text-white rounded flex items-center space-x-1 hover:bg-gray-600"
                        >
                          {copiedCode === block._id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedCode === block._id ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(block._id);
                            setCodeForm({
                              language: block.language,
                              code: block.code,
                              title: block.title,
                              theme: block.theme || "dark",
                              lineNumbers: block.lineNumbers !== false,
                              highlightLines: block.highlightLines || [],
                            });
                            setShowCodeModal(true);
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCodeBlock(block._id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="bg-gray-900 p-4 overflow-x-auto">
                      <code className="text-xs text-gray-300 font-mono">
                        {block.code}
                      </code>
                    </pre>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === "tables" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Tables</h3>
              <button
                onClick={() => setShowTableModal(true)}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            </div>

            {tables.length === 0 ? (
              <div className="text-center py-12">
                <Table className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No tables added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tables.map((table) => (
                  <motion.div
                    key={table._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 p-3 flex items-center justify-between border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {table.title}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(table._id);
                            setTableForm({
                              title: table.title,
                              headers: table.headers,
                              rows: table.rows,
                              borderStyle: table.borderStyle || "solid",
                              borderColor: table.borderColor || "#e5e7eb",
                              striped: table.striped !== false,
                              columnWidths: table.columnWidths || [],
                            });
                            setShowTableModal(true);
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table._id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            {table.headers.map((header, idx) => (
                              <th
                                key={idx}
                                className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-300"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className={
                                table.striped && rowIdx % 2 === 1
                                  ? "bg-gray-50"
                                  : ""
                              }
                            >
                              {row.map((cell, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className="px-3 py-2 text-gray-700 border-b border-gray-200"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">Add Image Details</h3>
              {uploadedFile && (
                <img
                  src={uploadedFile.url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={imageForm.caption}
                    onChange={(e) =>
                      setImageForm({ ...imageForm, caption: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Image caption"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={imageForm.altText}
                    onChange={(e) =>
                      setImageForm({ ...imageForm, altText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Alternative text"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddImage}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Image"}
                </button>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setUploadedFile(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Block Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCodeModal(false);
              setEditingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? "Edit Code Block" : "Add Code Block"}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={codeForm.title}
                      onChange={(e) =>
                        setCodeForm({ ...codeForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="Code snippet title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={codeForm.language}
                      onChange={(e) =>
                        setCodeForm({ ...codeForm, language: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <textarea
                    value={codeForm.code}
                    onChange={(e) =>
                      setCodeForm({ ...codeForm, code: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono"
                    rows="12"
                    placeholder="Enter your code here..."
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    editingItem
                      ? handleUpdateCodeBlock(editingItem)
                      : handleAddCodeBlock()
                  }
                  disabled={loading || !codeForm.code}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingItem
                    ? "Update Code Block"
                    : "Add Code Block"}
                </button>
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Modal */}
      <AnimatePresence>
        {showTableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowTableModal(false);
              setEditingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-4xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? "Edit Table" : "Add Table"}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Table Title
                  </label>
                  <input
                    type="text"
                    value={tableForm.title}
                    onChange={(e) =>
                      setTableForm({ ...tableForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Table title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Headers
                  </label>
                  <div className="flex space-x-2 mb-2">
                    {tableForm.headers.map((header, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={header}
                        onChange={(e) => updateTableHeader(idx, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder={`Header ${idx + 1}`}
                      />
                    ))}
                    <button
                      onClick={addTableColumn}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Rows
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tableForm.rows.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex space-x-2">
                        {row.map((cell, cellIdx) => (
                          <input
                            key={cellIdx}
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              updateTableCell(rowIdx, cellIdx, e.target.value)
                            }
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder={`Cell ${cellIdx + 1}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addTableRow}
                    className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    editingItem ? handleUpdateTable(editingItem) : handleAddTable()
                  }
                  disabled={loading || tableForm.headers.length === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingItem
                    ? "Update Table"
                    : "Add Table"}
                </button>
                <button
                  onClick={() => {
                    setShowTableModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {(loading || uploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-800">
              {uploading ? "Uploading..." : "Loading..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}