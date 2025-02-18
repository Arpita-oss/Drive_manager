import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { motion, AnimatePresence } from 'framer-motion';

const FolderView = () => {
    const { parentId } = useParams();
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [subfolders, setSubfolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredImages, setFilteredImages] = useState([]);

    // New effect for filtering images based on search query
    useEffect(() => {
        if (images.length > 0) {
            if (searchQuery.trim() === '') {
                setFilteredImages(images);
            } else {
                const filtered = images.filter(image =>
                    image.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredImages(filtered);
            }
        } else {
            setFilteredImages([]);
        }
    }, [searchQuery, images]);

    // Function to fetch images
    const fetchImages = async () => {
        if (!parentId) return;

        try {
            const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders/images/${parentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }

            const data = await response.json();
            setImages(data.images);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        setUploadLoading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('image', e.target.image.files[0]);
        formData.append('name', e.target.imageName.value);

        try {
            const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders/upload-image/${parentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            console.log('Upload response:', data); // Log the response

            if (data.success && data.image) {
                // Ensure the image has complete URL
                setImages(prev => [...prev, data.image]);
            } else {
                throw new Error('Invalid response format from server');
            }

            setShowUploadModal(false);
            e.target.reset();
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error.message);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;

        setDeleteLoading(true);
        setDeleteError(null);

        try {
            const response = await fetch(
                `https://drive-manager-backend.onrender.com/api/folders/delete-image/${imageToDelete._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            setImages(images.filter(img => img._id !== imageToDelete._id));
            setImageToDelete(null);
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Add this to your useEffect
    useEffect(() => {
        if (parentId) {
            fetchImages();
        }
    }, [parentId, token]);

    useEffect(() => {
        if (images.length > 0) {
            console.log('Fetched images:', images);
            images.forEach(img => {
                if (!img.url) {
                    console.error('Missing URL for image:', img);
                } else {
                    console.log('Image URL:', img.url);
                }
            });
        }
    }, [images]);

    useEffect(() => {
        console.log('Current parentId:', parentId); // Debug log
        console.log('Current token:', token ? 'Token exists' : 'No token');

        if (!token) {
            navigate('/login');
        } else {
            // Only fetch folder details if we have a parentId
            if (parentId) {
                fetchFolderDetails();
            }
            // For subfolders, handle root case differently
            fetchSubfolders();
        }
    }, [token, parentId, navigate]);

    const handleApiError = async (response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            try {
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('JSON parsing error:', error);
                throw new Error('Invalid JSON response from server');
            }
        } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned non-JSON response');
        }
    };

    const fetchFolderDetails = async () => {
        if (!parentId) {
            setCurrentFolder({ name: 'Root Folder' });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders/${parentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }
                const errorData = await handleApiError(response);
                throw new Error(errorData.message || 'Failed to fetch folder details');
            }

            const data = await response.json();
            setCurrentFolder(data.folder);
        } catch (err) {
            console.error('Folder details error:', err);
            setError(err.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubfolders = async () => {
        setLoading(true);
        setError(null);

        try {
            // If no parentId, fetch root folders
            const url = parentId
                ? `https://drive-manager-backend.onrender.com/api/folders/subfolders/${parentId}`
                : `https://drive-manager-backend.onrender.com/api/folders`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }
                const errorData = await handleApiError(response);
                throw new Error(errorData.message || 'Failed to fetch subfolders');
            }

            const data = await response.json();
            setSubfolders(data.folders);
        } catch (err) {
            console.error('Subfolders error:', err);
            setError(err.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const createSubfolder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const folderData = {
                name: e.target.folderName.value,
                parentId: parentId || null  // Handle root folder case
            };

            const response = await fetch('https://drive-manager-backend.onrender.com/api/folders/create-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(folderData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }
                const errorData = await handleApiError(response);
                throw new Error(errorData.message || 'Failed to create subfolder');
            }

            const data = await response.json();
            setSubfolders(prev => [...prev, data.folder]);
            e.target.reset();
        } catch (err) {
            console.error('Create subfolder error:', err);
            setError(err.message || 'Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center">
                    <Link to="/dashboard" className="flex items-center text-blue-500 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1">Back</span>
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h1 className="ml-2 text-xl font-semibold text-gray-800">
                        {loading ? 'Loading...' : currentFolder?.name || 'Folder View'}
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                    <span className="mr-2">Logout</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </nav>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Folder Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {currentFolder?.name || 'Loading folder...'}
                    </h2>
                    <p className="text-gray-600">Manage subfolders and files</p>
                </div>

                {/* Create Subfolder Section */}
                <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Subfolder</h3>
                    <form onSubmit={createSubfolder} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="folderName"
                                placeholder="Enter subfolder name"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-md text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </div>
                            ) : 'Create Subfolder'}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Subfolders Grid */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-800">Subfolders</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {subfolders.length} {subfolders.length === 1 ? 'Subfolder' : 'Subfolders'}
                        </span>
                    </div>

                    {subfolders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-lg">No subfolders yet</p>
                            <p className="mt-1">Create your first subfolder to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {subfolders.map(folder => (
                                <Link
                                    key={folder._id}
                                    to={`/folder/${folder._id}`}
                                    className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                                >
                                    <div className="flex items-center p-4 border-b border-gray-100">
                                        <div className="bg-blue-100 p-2 rounded-md mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-800 truncate flex-grow">{folder.name}</h4>
                                    </div>
                                    <div className="px-4 py-3 bg-gray-50 text-gray-500 text-sm">
                                        <div className="flex justify-between">
                                            <span>Created</span>
                                            <span>{new Date(folder.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <AnimatePresence>
                        {showUploadModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 backdrop-blur bg-opacity-50 z-50 flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                                >
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Image</h3>
                                    <form onSubmit={handleImageUpload}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Image Name
                                            </label>
                                            <input
                                                type="text"
                                                name="imageName"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter image name"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Image
                                            </label>
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                required
                                                className="w-full"
                                            />
                                        </div>
                                        {uploadError && (
                                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                                {uploadError}
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowUploadModal(false)}
                                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploadLoading}
                                                className={`px-4 py-2 rounded-md text-white ${uploadLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                                    } transition-colors`}
                                            >
                                                {uploadLoading ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {imageToDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                                >
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Delete Image</h3>
                                    <p className="text-gray-600 mb-4">
                                        Are you sure you want to delete "{imageToDelete.name}"? This action cannot be undone.
                                    </p>

                                    {deleteError && (
                                        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                            {deleteError}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setImageToDelete(null)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                            disabled={deleteLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteImage}
                                            disabled={deleteLoading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                                        >
                                            {deleteLoading ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-8">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-800 whitespace-nowrap">Images</h3>

                            {/* Search and Upload Button Container */}
                            <div className="flex flex-col sm:flex-row w-full gap-4">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search images by name..."
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="w-full sm:w-auto px-4 sm:px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    Upload Image
                                </button>
                            </div>
                        </div>

                        {/* No Results Message */}
                        {filteredImages.length === 0 && searchQuery !== '' ? (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-lg">No images found</p>
                                <p className="mt-1">No images match your search for "{searchQuery}"</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            /* Image Grid */
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {filteredImages.map(image => (
                                    <motion.div
                                        key={image._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border border-gray-200 rounded-lg overflow-hidden group relative"
                                    >
                                        <div className="relative pt-[100%]">
                                            <img
                                                src={image.url || 'https://via.placeholder.com/150'}
                                                alt={image.name}
                                                className="absolute top-0 left-0 w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150';
                                                }}
                                            />
                                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                                                <button
                                                    onClick={() => setImageToDelete(image)}
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-3 sm:p-4">
                                            <h4 className="font-medium text-gray-800 truncate text-sm sm:text-base">{image.name}</h4>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                {new Date(image.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderView;