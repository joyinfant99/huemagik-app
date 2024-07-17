import React from 'react';
import { motion } from 'framer-motion';

const Header = () => (
  <motion.header 
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-6 md:mb-8"
  >
    <h1 className="text-3xl md:text-4xl font-bold">HUEMAGIK</h1>
    <p className="text-sm text-gray-400">Free Color Palette Generator</p>
  </motion.header>
);

export default Header;