'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus, FaEdit, FaTrash, FaImage, FaSave,
    FaTimes, FaSearch, FaFilter, FaEye, FaEyeSlash,
    FaFolder, FaFileAlt, FaTag
} from 'react-icons/fa';

const TestDataComponent = () => {
    const [testData, setTestData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [testTypes, setTestTypes] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedTestType, setSelectedTestType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        isPublic: false,
        project: '',
        testType: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    // Load styling preferences from localStorage
    const [styling, setStyling] = useState({
        theme: 'light',
        fontSize: 'medium',
        sidebarCollapsed: false
    });

    useEffect(() => {
        loadStylingPreferences();
        fetchProjects();
        fetchTestTypes();
        fetchTestData();
    }, []);

    const loadStylingPreferences = () => {
        const saved = localStorage.getItem('testDataStyling');
        if (saved) {
            setStyling(JSON.parse(saved));
        }
    };

    const saveStylingPreferences = (newStyling) => {
        setStyling(newStyling);
        localStorage.setItem('testDataStyling', JSON.stringify(newStyling));
    };

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProjects(data.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTestTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/test-types', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTestTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching test types:', error);
        }
    };

    const fetchTestData = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = '/api/data';
            const params = new URLSearchParams();

            if (selectedProject) params.append('project', selectedProject);
            if (selectedTestType) params.append('testType', selectedTestType);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTestData(data.data);
            }
        } catch (error) {
            console.error('Error fetching test data:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                })
            });

            const result = await response.json();
            if (result.success) {
                setIsModalOpen(false);
                resetForm();
                fetchTestData();
            }
        } catch (error) {
            console.error('Error creating test data:', error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/data/${editingData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                })
            });

            const result = await response.json();
            if (result.success) {
                setIsModalOpen(false);
                resetForm();
                fetchTestData();
            }
        } catch (error) {
            console.error('Error updating test data:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this test data?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/data/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (result.success) {
                    fetchTestData();
                }
            } catch (error) {
                console.error('Error deleting test data:', error);
            }
        }
    };

    const handleImageUpload = async (testDataId, file) => {
        setUploadingImage(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`/api/data/${testDataId}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                fetchTestData();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/data/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                fetchTestData();
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            tags: '',
            isPublic: false,
            project: '',
            testType: ''
        });
        setEditingData(null);
    };

    const openEditModal = (data) => {
        setEditingData(data);
        setFormData({
            title: data.title,
            content: data.content,
            tags: data.tags.join(', '),
            isPublic: data.isPublic,
            project: data.project._id,
            testType: data.testType._id
        });
        setIsModalOpen(true);
    };

    const filteredData = testData.filter(data =>
        data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={`min-h-screen ${styling.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`${styling.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${styling.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Test Data Management</h1>
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => saveStylingPreferences({
                                ...styling,
                                theme: styling.theme === 'light' ? 'dark' : 'light'
                            })}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            {styling.theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <FaPlus />
                            <span>Add Test Data</span>
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search test data..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${styling.theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                    }`}
                            />
                        </div>
                    </div>

                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${styling.theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            }`}
                    >
                        <option value="">All Projects</option>
                        {projects.map(project => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedTestType}
                        onChange={(e) => setSelectedTestType(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${styling.theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            }`}
                    >
                        <option value="">All Test Types</option>
                        {testTypes.map(type => (
                            <option key={type._id} value={type._id}>
                                {type.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={fetchTestData}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <FaFilter />
                        <span>Apply Filters</span>
                    </button>
                </div>
            </div>

            {/* Test Data Grid */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredData.map((data) => (
                            <motion.div
                                key={data._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`rounded-lg border ${styling.theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700'
                                        : 'bg-white border-gray-200'
                                    } shadow-lg hover:shadow-xl transition-shadow`}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-lg truncate">{data.title}</h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(data)}
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(data._id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm mb-3">
                                        <span className="flex items-center space-x-1">
                                            <FaFolder className="text-blue-500" />
                                            <span>{data.project.name}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <FaFileAlt className="text-green-500" />
                                            <span>{data.testType.name}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            {data.isPublic ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-gray-500" />}
                                        </span>
                                    </div>

                                    <p className={`text-sm mb-3 ${styling.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                        {data.content.substring(0, 100)}...
                                    </p>

                                    {data.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {data.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                >
                                                    <FaTag size={8} />
                                                    <span>{tag}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Images */}
                                    {data.images.length > 0 && (
                                        <div className="mb-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                {data.images.map((image) => (
                                                    <div key={image._id} className="relative group">
                                                        <img
                                                            src={image.url}
                                                            alt={image.caption}
                                                            className="w-full h-20 object-cover rounded"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleDeleteImage(image._id)}
                                                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Upload */}
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleImageUpload(data._id, e.target.files[0]);
                                                }
                                            }}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        >
                                            <FaImage />
                                            <span>{uploadingImage ? 'Uploading...' : 'Add Image'}</span>
                                        </button>
                                        <span className="text-xs text-gray-500">
                                            v{data.version}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-500">No test data found. Create your first test data entry!</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-lg ${styling.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                }`}
                        >
                            <div className={`p-4 border-b ${styling.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">
                                        {editingData ? 'Edit Test Data' : 'Create New Test Data'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={editingData ? handleUpdate : handleCreate} className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Project</label>
                                        <select
                                            required
                                            value={formData.project}
                                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border ${styling.theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(project => (
                                                <option key={project._id} value={project._id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Test Type</label>
                                        <select
                                            required
                                            value={formData.testType}
                                            onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border ${styling.theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select Test Type</option>
                                            {testTypes.map(type => (
                                                <option key={type._id} value={type._id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border ${styling.theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows="6"
                                        className={`w-full px-3 py-2 rounded-lg border ${styling.theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="tag1, tag2, tag3"
                                        className={`w-full px-3 py-2 rounded-lg border ${styling.theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isPublic" className="text-sm font-medium">
                                        Make this test data public
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className={`px-4 py-2 rounded-lg border ${styling.theme === 'dark'
                                                ? 'border-gray-600 hover:bg-gray-700'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                    >
                                        <FaSave />
                                        <span>{editingData ? 'Update' : 'Create'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestDataComponent;