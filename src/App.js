import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaChevronLeft, FaChevronRight, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import './App.css';

const API_URL = 'https://huemagik-render.onrender.com';

function App() {
  const [palette, setPalette] = useState([]);
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const processImage = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('colors', colorCount);

    try {
      const response = await axios.post(`${API_URL}/process_image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: false,
      });
      
      if (response.data && response.data.colors) {
        const extractedPalette = response.data.colors.map(color => ({
          hex: `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`,
          rgb: `${color[0]}, ${color[1]}, ${color[2]}`,
        }));
        
        setPalette(extractedPalette);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError(`Failed to process the image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [colorCount]);

  useEffect(() => {
    if (uploadedImage) {
      processImage(uploadedImage);
    }
  }, [uploadedImage, processImage]);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const deleteImage = () => {
    setUploadedImage(null);
    setPalette([]);
    setError(null);
  };

  const navigatePalette = (direction) => {
    setCurrentPaletteIndex((prevIndex) => {
      if (direction === 'left') {
        return prevIndex > 0 ? prevIndex - 1 : 2;
      } else {
        return prevIndex < 2 ? prevIndex + 1 : 0;
      }
    });
  };

  const downloadPalette = (format) => {
    if (format === 'pdf') {
      const pdf = new jsPDF();
      palette.forEach((color, index) => {
        pdf.setFillColor(color.hex);
        pdf.rect(20, 20 + (index * 40), 170, 30, 'F');
        pdf.setTextColor(0);
        pdf.text(`${color.hex} - RGB(${color.rgb})`, 25, 40 + (index * 40));
      });
      pdf.save("palette.pdf");
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = palette.length * 60;
      const ctx = canvas.getContext('2d');
      palette.forEach((color, index) => {
        ctx.fillStyle = color.hex;
        ctx.fillRect(0, index * 60, 300, 50);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(`${color.hex} - RGB(${color.rgb})`, 10, (index * 60) + 40);
      });
      const link = document.createElement('a');
      link.download = 'palette.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="container">
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="title">HUEMAGIK</h1>
        <p className="subtitle">BY MAGIKMODS</p>
      </motion.header>
      <div className="content">
        <motion.div 
          className={`box upload-box ${isMobile ? 'mobile' : ''}`}
          whileHover={{ boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)' }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inner-box">
            <AnimatePresence>
              {uploadedImage ? (
                <motion.div 
                  className="uploaded-image-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" className="uploaded-image" />
                  <motion.button 
                    className="delete-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={deleteImage}
                  >
                    <FaTimes />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className="upload-options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="upload-option"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <FaCloudUploadAlt className="icon" />
                    <p>UPLOAD</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
          </div>
        </motion.div>
        <motion.div 
          className={`box palette-box ${isMobile ? 'mobile' : ''}`}
          whileHover={{ boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inner-box">
            {isLoading ? (
              <p className="message">Processing image...</p>
            ) : error ? (
              <p className="message error">{error}</p>
            ) : palette.length > 0 ? (
              <>
                <div className="palette-navigation">
                  <button onClick={() => navigatePalette('left')} className="nav-btn">
                    <FaChevronLeft />
                  </button>
                  <div className="palette-colors">
                    {palette.map((color, index) => (
                      <motion.div 
                        key={index} 
                        className="color-bar"
                        style={{ backgroundColor: color.hex }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="color-code">
                          {currentPaletteIndex === 0 ? '' : 
                           currentPaletteIndex === 1 ? color.hex : 
                           `RGB(${color.rgb})`}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={() => navigatePalette('right')} className="nav-btn">
                    <FaChevronRight />
                  </button>
                </div>
                <div className="download-buttons">
                  <motion.button 
                    className="download-btn"
                    whileHover={{ backgroundColor: '#3A7BC8' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadPalette('pdf')}
                  >
                    DOWNLOAD PDF
                  </motion.button>
                  <motion.button 
                    className="download-btn"
                    whileHover={{ backgroundColor: '#3A7BC8' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadPalette('png')}
                  >
                    DOWNLOAD PNG
                  </motion.button>
                </div>
              </>
            ) : (
              <p className="message">Upload an image to generate a palette</p>
            )}
          </div>
        </motion.div>
      </div>
      <div className="color-count-selector">
        <label htmlFor="colorCount">Number of colors:</label>
        <input 
          type="range" 
          id="colorCount" 
          min="3" 
          max="9" 
          value={colorCount} 
          onChange={(e) => setColorCount(parseInt(e.target.value))}
        />
        <span>{colorCount}</span>
      </div>
      <motion.div 
        className="about-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2><FaInfoCircle /> About HueMagik</h2>
        <p>
          Welcome to HueMagik, where we turn your visual inspirations into stunning color palettes! 
          Our app doesn't just look at pictures – it sees the world through your eyes. Whether you're 
          capturing a breathtaking sunset, a vibrant street scene, or your favorite artwork, HueMagik 
          distills the essence of these moments into a harmonious color scheme.
        </p>
        <p>
          Think of it as having a personal color stylist in your pocket. HueMagik doesn't store or 
          use your images; instead, it works its magic right before your eyes, transforming visual 
          input into a palette that captures the mood and energy of your inspiration. Whether you're 
          a designer seeking the perfect color combination, an artist looking for inspiration, or 
          simply someone who appreciates the beauty of color in everyday life, HueMagik is your 
          gateway to a more colorful world.
        </p>
        <p>
          So go ahead, point your camera at something beautiful, or upload that image that's been 
          inspiring you. Let HueMagik reveal the hidden harmony of colors that surrounds us all. 
          It's not just about seeing colors – it's about feeling them.
        </p>
      </motion.div>
      <footer className="footer">
        <p>© 2024 HueMagik. All rights reserved.</p>
        <p>Created by MagikMods</p>
        <p>Data processing is GDPR compliant</p>
      </footer>
      <div className="background-animation">
        {[...Array(10)].map((_, index) => (
          <motion.div
            key={index}
            className="color-circle"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;