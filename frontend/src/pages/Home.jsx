import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // For animations

const Home = () => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          Welcome to the File Manager
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Organize and manage your folders and images efficiently.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/login">
            <motion.button 
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg shadow-blue-300/30 min-w-[140px]"
              whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button 
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full border-2 border-blue-600 shadow-lg shadow-blue-100/30 min-w-[140px]"
              whileHover={{ scale: 1.05, backgroundColor: "#f0f9ff" }}
              whileTap={{ scale: 0.95 }}
            >
              Signup
            </motion.button>
          </Link>
        </motion.div>
        
        <motion.div 
          className="flex justify-center flex-wrap gap-6 mt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {/* Folder Icon */}
          <motion.div 
            className="w-20 h-20 md:w-24 md:h-24 bg-amber-300 rounded-lg relative"
            style={{ clipPath: "polygon(0% 25%, 35% 25%, 40% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          ></motion.div>
          
          {/* File Icon */}
          <motion.div 
            className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg relative"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-300"></div>
            <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-300"></div>
            <div className="absolute top-12 left-4 right-4 h-0.5 bg-gray-300"></div>
          </motion.div>
          
          {/* Image Icon */}
          <motion.div 
            className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500 rounded-lg relative overflow-hidden"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="absolute w-8 h-8 bg-amber-400 rounded-full top-3 left-3"></div>
            <div className="absolute bottom-0 left-0 w-full h-6 bg-blue-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;