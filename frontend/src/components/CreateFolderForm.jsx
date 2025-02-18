export const CreateFolderForm = ({ loading, error, onCreate }) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      onCreate({
        name: formData.get('folderName'),
        parentId: formData.get('parentId')
      });
    };
  
    return (
      <div className="bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">New Folder</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              name="folderName"
              placeholder="Folder name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium ${loading ? 
              'bg-blue-400 cursor-not-allowed' : 
              'bg-blue-600 hover:bg-blue-700'} text-white transition-all`}
          >
            {loading ? 'Creating...' : 'Create Folder'}
          </button>
        </form>
        {error && <ErrorHandler error={error} />}
      </div>
    );
  };