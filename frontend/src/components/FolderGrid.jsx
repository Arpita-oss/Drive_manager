import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const folderVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const FolderGrid = ({ folders }) => {
  if (folders.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <div className="mb-4 text-4xl">📁</div>
      <p>No folders yet</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {folders.map((folder, index) => (
        <motion.div
          key={folder._id}
          variants={folderVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.05 }}
        >
          <Link
            to={`/folder/${folder._id}`}
            className="block border rounded-xl p-4 hover:shadow-lg transition-shadow bg-white group"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium truncate">{folder.name}</h3>
            </div>
            <p className="text-sm text-gray-500">
              Created {new Date(folder.createdAt).toLocaleDateString()}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};