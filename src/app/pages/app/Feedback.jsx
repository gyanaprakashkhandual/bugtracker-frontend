'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageSquare,
    FiImage,
    FiUser,
    FiClock,
    FiPlus,
    FiX,
    FiUpload,
    FiCheck,
    FiHeart,
    FiSend,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';

// Feedback Header Component (Integrated)
const FeedbackHeader = () => {
    return (
        <div className="relative w-screen min-w-full max-w-full h-[200px] min-h-[200px] max-h-[200px] overflow-hidden bg-gradient-radial from-slate-50 via-slate-100 to-slate-200">
            {/* Animated Water Waves Background */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.04" />
                    </linearGradient>
                    <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#475569" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e40af" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Wave Layer 1 */}
                <motion.path
                    d="M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z"
                    fill="url(#waveGradient1)"
                    initial={{ d: "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z",
                            "M0,90 C300,40 600,140 900,90 C1050,65 1200,115 1200,90 L1200,200 L0,200 Z",
                            "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z"
                        ]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Wave Layer 2 */}
                <motion.path
                    d="M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z"
                    fill="url(#waveGradient2)"
                    initial={{ d: "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z",
                            "M0,130 C400,170 700,90 1000,130 C1100,150 1200,110 1200,130 L1200,200 L0,200 Z",
                            "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z"
                        ]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                />

                {/* Wave Layer 3 */}
                <motion.path
                    d="M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z"
                    fill="url(#waveGradient3)"
                    initial={{ d: "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z",
                            "M0,150 C350,180 650,120 950,150 C1075,165 1200,135 1200,150 L1200,200 L0,200 Z",
                            "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z"
                        ]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </svg>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    {/* App Name */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-2"
                    >
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-slate-700 to-blue-800 bg-clip-text text-transparent">
                            Caffetest
                        </h2>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-3"
                    >
                        Give Feedback
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        Your valuable feedback helps us improve. We're committed to working on every suggestion you share.
                    </motion.p>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="absolute top-8 left-8 sm:left-12"
                >
                    <svg width="30" height="30" viewBox="0 0 30 30" className="text-blue-300 opacity-50">
                        <motion.circle
                            cx="15"
                            cy="15"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 1, delay: 0.8 }}
                        />
                    </svg>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="absolute bottom-8 right-8 sm:right-12"
                >
                    <svg width="25" height="25" viewBox="0 0 25 25" className="text-slate-400 opacity-50">
                        <motion.polygon
                            points="12.5,2 15,10 23,10 17,15 19,23 12.5,18 6,23 8,15 2,10 10,10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
};

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        feedbackDescription: '',
        image: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Comment modal states
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Expanded card states
    const [expandedCards, setExpandedCards] = useState({});
    const [cardComments, setCardComments] = useState({});

    // Image viewer modal
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);

    const BASE_URL = 'https://caffetest.onrender.com/api/v1/feed-back';

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    const apiCall = async (url, options = {}) => {
        const token = getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${BASE_URL}/all`);
            setFeedbacks(data.data || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            alert('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'test_case_preset');

        try {
            setUploading(true);
            const response = await fetch('https://api.cloudinary.com/v1_1/dvytvjplt/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            const imageUrl = await uploadToCloudinary(file);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        } catch (error) {
            alert('Failed to upload image: ' + error.message);
            setImagePreview('');
        }
    };

    const createFeedback = async (e) => {
        e.preventDefault();

        if (!formData.feedbackDescription.trim()) {
            alert('Please enter feedback description');
            return;
        }

        try {
            await apiCall(BASE_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setShowCreateForm(false);
            setFormData({ feedbackDescription: '', image: '' });
            setImagePreview('');
            fetchFeedbacks();
            alert('Feedback submitted successfully!');
        } catch (error) {
            alert('Failed to create feedback: ' + error.message);
        }
    };

    // Toggle like functionality
    const toggleLike = async (feedbackId) => {
        try {
            const data = await apiCall(`${BASE_URL}/${feedbackId}/like`, {
                method: 'POST'
            });

            // Update the feedback in the list
            setFeedbacks(prevFeedbacks =>
                prevFeedbacks.map(feedback =>
                    feedback._id === feedbackId
                        ? {
                            ...feedback,
                            likesCount: data.data.likesCount,
                            isLiked: data.data.isLiked
                        }
                        : feedback
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to update like');
        }
    };

    // Open comment modal
    const openCommentModal = async (feedback) => {
        setSelectedFeedback(feedback);
        setShowCommentModal(true);
        setCommentText('');
        await fetchComments(feedback._id);
    };

    // Fetch comments for a feedback
    const fetchComments = async (feedbackId) => {
        try {
            setLoadingComments(true);
            const data = await apiCall(`${BASE_URL}/${feedbackId}/comments`);
            setComments(data.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Failed to fetch comments');
        } finally {
            setLoadingComments(false);
        }
    };

    // Add a comment
    const addComment = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) {
            alert('Please enter a comment');
            return;
        }

        try {
            setSubmittingComment(true);
            const data = await apiCall(`${BASE_URL}/${selectedFeedback._id}/comments`, {
                method: 'POST',
                body: JSON.stringify({ comment: commentText })
            });

            // Update comments list
            setComments(prev => [...prev, data.data.comment]);

            // Update feedback comments count in the main list
            setFeedbacks(prevFeedbacks =>
                prevFeedbacks.map(feedback =>
                    feedback._id === selectedFeedback._id
                        ? { ...feedback, commentsCount: data.data.commentsCount }
                        : feedback
                )
            );

            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    // Close comment modal
    const closeCommentModal = () => {
        setShowCommentModal(false);
        setSelectedFeedback(null);
        setComments([]);
        setCommentText('');
    };

    // Open image viewer
    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Close image viewer
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    // Toggle card expansion
    const toggleCardExpansion = async (feedbackId) => {
        const isExpanded = expandedCards[feedbackId];

        if (!isExpanded) {
            // Fetch comments for this card
            try {
                const data = await apiCall(`${BASE_URL}/${feedbackId}/comments`);
                setCardComments(prev => ({
                    ...prev,
                    [feedbackId]: data.data || []
                }));
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }

        setExpandedCards(prev => ({
            ...prev,
            [feedbackId]: !isExpanded
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-3 text-slate-600 text-xs font-medium">Loading feedbacks...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 hide-scrollbar">
            <div>
                <FeedbackHeader />
            </div>
            <div className="max-w-full mx-auto p-2">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                        <h1 className="text-slate-900 font-bold mt-0.5">
                            {feedbacks.length} Feedback{feedbacks.length !== 1 ? 's' : ''}
                        </h1>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm text-xs font-medium transition-colors"
                        >
                            <FiPlus className="w-3.5 h-3.5" />
                            Give Feedback
                        </motion.button>
                    </div>
                </motion.div>

                {/* Create Form */}
                <AnimatePresence>
                    {showCreateForm && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateForm(false)}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col mx-4"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <FiMessageSquare className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Share Your Feedback
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <FiX className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                {/* Form Content */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <form onSubmit={createFeedback} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Your Feedback
                                            </label>
                                            <textarea
                                                required
                                                value={formData.feedbackDescription}
                                                onChange={(e) => setFormData({ ...formData, feedbackDescription: e.target.value })}
                                                rows="4"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:border-blue-500 text-xs resize-none"
                                                placeholder="Tell us what you think..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Attach Image (Optional)
                                            </label>
                                            <div className="flex items-start gap-3">
                                                <label className="flex-shrink-0">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        disabled={uploading}
                                                    />
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-medium cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {uploading ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent"></div>
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload className="w-3.5 h-3.5" />
                                                                Choose Image
                                                            </>
                                                        )}
                                                    </motion.div>
                                                </label>

                                                {imagePreview && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="h-20 w-20 object-cover rounded-lg border border-slate-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <FiX className="w-2.5 h-2.5" />
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setFormData({ feedbackDescription: '', image: '' });
                                                    setImagePreview('');
                                                }}
                                                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploading}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                            >
                                                <FiCheck className="w-3.5 h-3.5" />
                                                Submit Feedback
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Feedback Grid */}
                {feedbacks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-white rounded-xl border border-slate-200"
                    >
                        <FiMessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-slate-900 mb-1">No feedbacks yet</h3>
                        <p className="text-slate-500 text-xs mb-4">
                            Be the first to share your feedback
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                        >
                            Create Feedback
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        <AnimatePresence>
                            {feedbacks.map((feedback, index) => (
                                <motion.div
                                    key={feedback._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all hover:border-slate-300"
                                >
                                    {/* User Info */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FiUser className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-xs truncate">
                                                {feedback.user?.name || 'Anonymous'}
                                            </p>
                                            <p className="text-slate-500 text-[10px] truncate">
                                                {feedback.user?.role || 'User'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    {feedback.image && (
                                        <div className="mb-3 relative group">
                                            <img
                                                src={feedback.image}
                                                alt="Feedback"
                                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                            />
                                            <motion.button
                                                initial={{ opacity: 0 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openImageModal(feedback.image)}
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                            >
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-900">
                                                    <FiImage className="w-3.5 h-3.5" />
                                                    View Full
                                                </div>
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="mb-3">
                                        <p className="text-slate-700 text-xs leading-relaxed line-clamp-4">
                                            {feedback.feedbackDescription}
                                        </p>
                                    </div>

                                    {/* Actions (Like & Comment) */}
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => toggleLike(feedback._id)}
                                            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                                        >
                                            <FiHeart
                                                className={`w-4 h-4 transition-colors ${feedback.isLiked
                                                    ? 'fill-red-500 text-red-500'
                                                    : 'text-slate-400 hover:text-red-500'
                                                    }`}
                                            />
                                            <span className={feedback.isLiked ? 'text-red-500' : 'text-slate-600'}>
                                                {feedback.likesCount || 0}
                                            </span>
                                        </motion.button>

                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => openCommentModal(feedback)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                        >
                                            <FiMessageSquare className="w-4 h-4" />
                                            <span>{feedback.commentsCount || 0}</span>
                                        </motion.button>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {formatDate(feedback.createdAt)}
                                        </div>
                                        <motion.button
                                            tooltip-data="See Comments"
                                            tooltip-placement="top"
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => toggleCardExpansion(feedback._id)}
                                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                                        >
                                            {expandedCards[feedback._id] ? (

                                                <FiChevronUp className="w-4 h-4 text-slate-500" />
                                            ) : (
                                                <FiChevronDown className="w-4 h-4 text-slate-500" />
                                            )}
                                        </motion.button>
                                    </div>

                                    {/* Expanded Comments Section */}
                                    <AnimatePresence>
                                        {expandedCards[feedback._id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                                                    {cardComments[feedback._id]?.length === 0 ? (
                                                        <p className="text-slate-400 text-xs text-center py-2">
                                                            No comments yet
                                                        </p>
                                                    ) : (
                                                        cardComments[feedback._id]?.map((comment) => (
                                                            <motion.div
                                                                key={comment._id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="bg-slate-50 rounded-lg p-2"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <FiUser className="w-3 h-3 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <p className="font-semibold text-slate-900 text-[10px]">
                                                                                {comment.user?.name || 'Anonymous'}
                                                                            </p>
                                                                            <span className="text-slate-400 text-[9px]">
                                                                                {formatDate(comment.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-slate-700 text-[10px] leading-relaxed">
                                                                            {comment.comment}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Comment Modal */}
            <AnimatePresence>
                {showCommentModal && selectedFeedback && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCommentModal}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col mx-4"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <FiMessageSquare className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Comments ({comments.length})
                                    </h3>
                                </div>
                                <button
                                    onClick={closeCommentModal}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingComments ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FiMessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-500 text-xs">No comments yet</p>
                                        <p className="text-slate-400 text-xs mt-1">Be the first to comment</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <motion.div
                                            key={comment._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-slate-50 rounded-lg p-3"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <FiUser className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-slate-900 text-xs">
                                                            {comment.user?.name || 'Anonymous'}
                                                        </p>
                                                        <span className="text-slate-400 text-[10px]">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 text-xs leading-relaxed">
                                                        {comment.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Comment Input */}
                            <form onSubmit={addComment} className="p-4 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                        disabled={submittingComment}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={submittingComment || !commentText.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        {submittingComment ? (
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <FiSend className="w-3.5 h-3.5" />
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {showImageModal && selectedImage && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeImageModal}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />

                        {/* Image Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] h-[90vh] flex items-center justify-center"
                        >
                            {/* Close Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={closeImageModal}
                                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
                            >
                                <FiX className="w-6 h-6 text-slate-900" />
                            </motion.button>

                            {/* Image Container */}
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="relative max-w-full max-h-full"
                            >
                                <img
                                    src={selectedImage}
                                    alt="Full size"
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeedbackPage;