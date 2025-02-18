import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchFolders();
    }
  }, [token, navigate]);

  const deleteFolder = async (parentId, e) => {
    e.preventDefault(); // Prevent navigation from Link
    e.stopPropagation(); // Prevent event bubbling

    setDeletingFolder(parentId);
    try {
      const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders/delete-folder/${parentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFolders(folders.filter(parent => parent._id !== parentId));
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete folder');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to the server');
    } finally {
      setDeletingFolder(null);
    }
  };

  const createFolder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const folderData = {
        name: e.target.folderName.value,
        parentId: null  // Explicitly set parentId to null
      };

      const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(folderData),
      });

      const data = await response.json();

      if (response.ok) {
        // Only add to folders if it's a root folder
        if (!data.folder.parentId) {
          setFolders(prev => [...prev, data.folder]);
        }
        e.target.reset();
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(data.message || 'Failed to create folder');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    setLoading(true);
    setError(null);

    try {
      // This endpoint should now only return root folders
      const response = await fetch(`https://drive-manager-backend.onrender.com/api/folders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Filter out any folders that might have parentId, just to be safe
        const rootFolders = data.folders.filter(folder => !folder.parentId);
        setFolders(rootFolders);
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(data.message || 'Failed to fetch folders');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm px-4 py-2 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              {/* Folder Icon */}
              <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h1 className="text-xl font-medium text-gray-800">Drive</h1>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-grow max-w-2xl">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Search in Drive"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isGridView ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 4h18M3 12h18M3 20h18" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16 pb-6">
        {/* Action Bar */}
        <div className="fixed left-0 right-0 bg-white border-b z-[5] py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <button
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('input[name="folderName"]').focus();
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-gray-700">New</span>
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 pt-16">
          {/* Create Folder Form */}
          <div className="bg-white rounded-lg shadow-sm mb-8 p-6 transform transition-all duration-300 hover:shadow-md">
            <form onSubmit={createFolder} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="folderName"
                  placeholder="Create new folder"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : 'Create'}
              </button>
            </form>
          </div>

          {/* Folders Grid/List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Your Folders</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {filteredFolders.length} {filteredFolders.length === 1 ? 'Folder' : 'Folders'}
              </span>
            </div>

            {filteredFolders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No folders</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                isGridView 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredFolders.map(folder => (
                  <Link
                    key={folder._id}
                    to={`/folder/${folder._id}`}
                    className={`group relative bg-white border border-gray-200 rounded-lg transition-all duration-200 ${
                      isGridView 
                        ? 'hover:shadow-md' 
                        : 'hover:bg-gray-50 flex items-center'
                    }`}
                  >
                    <div className={`flex items-center p-4 ${!isGridView && 'flex-1'}`}>
                      <div className="bg-blue-50 p-2 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors duration-200">
                        <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{folder.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(folder.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteFolder(folder._id, e)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        disabled={deletingFolder === folder._id}
                      >
                        {deletingFolder === folder._id ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;