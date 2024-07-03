import React from 'react';
import { motion } from 'framer-motion';

const UploadBox = ({ setPalette }) => {
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate palette generation
      const randomPalette = Array(6).fill().map(() => 
        '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
      );
      setPalette(randomPalette);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-4 md:p-6 flex-1"
    >
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 md:p-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4"
          >
            <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </motion.div>
          <p className="text-sm md:text-base text-gray-400">Click to upload or drag and drop</p>
        </label>
      </div>
    </motion.div>
  );
};

export default UploadBox;