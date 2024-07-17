import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaChevronLeft, FaChevronRight, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import './App.css';

const API_URL = 'https://huemagik-render.onrender.com';

const colorQuotes = [
  "Colors are the smiles of nature.",
  "Life is a painting, and you are the artist. You have on your palette all the colors in the spectrum",
  "Color is a power which directly influences the soul.",
  "Colors are the keyboard, the eyes are the harmonies, the soul is the piano with many strings.",
  "The purest and most thoughtful minds are those which love color the most.",
  "Color is my day-long obsession, joy and torment.",
];

function App() {
  const [palette, setPalette] = useState([]);
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setCurrentQuote(colorQuotes[Math.floor(Math.random() * colorQuotes.length)]);
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const processImage = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

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
      setProgress(100);
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

  const backgroundVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.div 
      className="container"
      variants={backgroundVariants}
      animate="animate"
    >
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="title"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          HUEMAGIK
        </motion.h1>
        <motion.p 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Free Color Palette Generator
        </motion.p>
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
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
              <motion.div 
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="message">Generating palette: {progress}%</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="color-quote">{currentQuote}</p>
              </motion.div>
            ) : error ? (
              <motion.p 
                className="message error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            ) : palette.length > 0 ? (
              <>
                <div className="palette-navigation">
                  <motion.button 
                    onClick={() => navigatePalette('left')} 
                    className="nav-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaChevronLeft />
                  </motion.button>
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
                        <motion.span 
                          className="color-code"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          {currentPaletteIndex === 0 ? '' : 
                           currentPaletteIndex === 1 ? color.hex : 
                           `RGB(${color.rgb})`}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button 
                    onClick={() => navigatePalette('right')} 
                    className="nav-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaChevronRight />
                  </motion.button>
                </div>
                <div className="download-buttons">
                  <motion.button 
                    className="download-btn"
                    whileHover={{ backgroundColor: '#3A7BC8', scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadPalette('pdf')}
                  >
                    DOWNLOAD PDF
                  </motion.button>
                  <motion.button 
                    className="download-btn"
                    whileHover={{ backgroundColor: '#3A7BC8', scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadPalette('png')}
                  >
                    DOWNLOAD PNG
                  </motion.button>
                </div>
              </>
            ) : (
              <motion.p 
                className="message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Upload an image to generate a palette
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
      <motion.div 
        className="color-count-selector"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
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
      </motion.div>
      <motion.div 
        className="about-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2><FaInfoCircle /> About HueMagik</h2>
        <p>
        HueMagik is an innovative, free color palette generator tool designed for designers, artists, and creative enthusiasts. 
        This powerful color extraction tool harnesses advanced image processing algorithms to 
        analyze and transform visual inspiration into stunning color schemes.
        </p>
        <p>
         <h2>🎨 Key Features</h2>

        <ul>
        <li>Instant Color Extraction: Upload any image and get an instant color palette</li>
        <li>Dominant Color Identification: Automatically detects and highlights the most prominent colors</li>
        <li>Custom Palette Creation: Generate unique color combinations from your favorite images</li>
        <li>Export results in various formats (RGB, HEX, HSL)</li>
        </ul>
        </p>
        <p>
        <h2>🔒 Data Privacy</h2>
        <ul>
        <li>No storage of uploaded images or color data</li>
        <li>Real-time processing with immediate data discard</li>
        <li>No access to your color schemes or design ideas</li>
        </ul>
        </p>
      </motion.div>
      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>© 2024 HueMagik. All rights reserved.</p>
        <p>Have a question <a href="https://forms.gle/GV6e9FmGFQ4gmVsf6">Write to us</a></p>
      </motion.footer>
      <div className="background-animation">
        {[...Array(20)].map((_, index) => (
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
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              borderRadius: '50%',
              position: 'absolute',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default App;