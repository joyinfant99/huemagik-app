import React from 'react';
import { motion } from 'framer-motion';

const PaletteBox = ({ palette }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-4 md:p-6 flex-1"
    >
      {palette.length > 0 ? (
        <div className="flex flex-col h-full">
          <div className="flex-grow flex flex-wrap">
            {palette.map((color, index) => (
              <motion.div 
                key={index} 
                className="w-1/3 md:w-1/6 h-24 md:h-full relative"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 px-1 rounded">
                  {color}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors w-full md:w-auto"
          >
            Download
          </motion.button>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm md:text-base">
          Upload an image to generate a palette
        </div>
      )}
    </motion.div>
  );
};

export default PaletteBox;