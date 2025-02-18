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
      const response = await fetch(`http://localhost:5000/api/folders/delete-folder/${parentId}`, {
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
  
      const response = await fetch(`http://localhost:5000/api/folders/create-folder`, {
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
      const response = await fetch(`http://localhost:5000/api/folders`, {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h1 className="ml-2 text-xl font-semibold text-gray-800">File Manager</h1>
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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My Folders</h2>
          <p className="text-gray-600">Create and manage your folders</p>
        </div>

        {/* Create Folder Section */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Folder</h3>
          <form onSubmit={createFolder} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                name="folderName"
                placeholder="Enter folder name"
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
              ) : 'Create Folder'}
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

        {/* Folders Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Your Folders</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}
            </span>
          </div>

          {folders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg">No folders yet</p>
              <p className="mt-1">Create your first folder to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.map(folder => (
                <Link
                  key={folder._id}
                  to={`/folder/${folder._id}`}
                  className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden group relative"
                >
                  <div className="flex items-center p-4 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800 truncate flex-grow">{folder.name}</h4>
                    <button
                      onClick={(e) => deleteFolder(folder._id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      disabled={deletingFolder === folder._id}
                    >
                      {deletingFolder === folder._id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;