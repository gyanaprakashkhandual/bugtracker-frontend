'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const BASE_URL = 'http://localhost:5000/api/v1/bug-report';

export default function BugReportPage() {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    bugDescription: '',
    bugPriority: 'Medium',
    bugImage: []
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

  const priorityOptions = [
    { value: 'Low', color: 'bg-green-500', icon: '🟢' },
    { value: 'Medium', color: 'bg-yellow-500', icon: '🟡' },
    { value: 'High', color: 'bg-orange-500', icon: '🟠' },
    { value: 'Critical', color: 'bg-red-500', icon: '🔴' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'test_case_preset');

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        bugImage: [...prev.bugImage, ...uploadedUrls]
      }));

      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...previews]);

      showAlert({ type: 'success', message: 'Images uploaded successfully!' });
    } catch (error) {
      showAlert({ type: 'error', message: 'Failed to upload images. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      bugImage: prev.bugImage.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.bugDescription || !formData.bugPriority) {
      showAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert({ type: 'success', message: 'Bug report submitted successfully!' });
        
        setFormData({
          name: '',
          bugDescription: '',
          bugPriority: 'Medium',
          bugImage: []
        });
        setImagePreview([]);
      } else {
        showAlert({ type: 'error', message: data.message || 'Failed to submit bug report.' });
      }
    } catch (error) {
      showAlert({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-4 shadow-lg"
          >
            <Bug className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Report a Bug</h1>
          <p className="text-gray-600">Help us improve by reporting any issues you encounter</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorityOptions.map((priority) => (
                  <motion.button
                    key={priority.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData(prev => ({ ...prev, bugPriority: priority.value }))}
                    className={`relative px-4 py-3 rounded-xl font-medium transition-all ${
                      formData.bugPriority === priority.value
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{priority.icon}</span>
                    {priority.value}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="bugDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Bug Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bugDescription"
                name="bugDescription"
                value={formData.bugDescription}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="Describe the bug in detail... What happened? What did you expect to happen?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Screenshots (Optional)
              </label>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-600">Uploading images...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload screenshots
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </motion.div>

              {imagePreview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {imagePreview.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploading}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
                submitting || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Report...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit Bug Report
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Tips for reporting bugs:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Be specific about what you were doing when the bug occurred</li>
              <li>Include steps to reproduce the issue</li>
              <li>Add screenshots if possible to help us understand better</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}