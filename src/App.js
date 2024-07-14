import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCamera, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import './App.css';

function App() {
  const [palette, setPalette] = useState([]);
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const processImage = async (file) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('colors', 5);  // Number of colours to extract

    try {
      const response = await axios.post('http://huemagik.us-west-2.elasticbeanstalk.com/process_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
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
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const deleteImage = () => {
    setUploadedImage(null);
    setPalette([]);
    setError(null);
  };

  const openCamera = () => {
    // Camera functionality remains the same
    // ...
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
    // Download functionality remains the same
    // ...
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
          className="box upload-box"
          whileHover={{ boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)' }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inner-box">
            {uploadedImage ? (
              <div className="uploaded-image-container">
                <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                <motion.button 
                  className="delete-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={deleteImage}
                >
                  <FaTimes />
                </motion.button>
              </div>
            ) : (
              <div className="upload-options">
                <motion.div 
                  className="upload-option"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <FaCloudUploadAlt className="icon" />
                  <p>UPLOAD</p>
                </motion.div>
                <motion.div 
                  className="upload-option"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={openCamera}
                >
                  <FaCamera className="icon" />
                  <p>CAMERA</p>
                </motion.div>
              </div>
            )}
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </div>
        </motion.div>
        <motion.div 
          className="box palette-box"
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
                      <div 
                        key={index} 
                        className="color-bar"
                        style={{ backgroundColor: color.hex }}
                      >
                        <span className="color-code">
                          {currentPaletteIndex === 0 ? '' : 
                           currentPaletteIndex === 1 ? color.hex : 
                           `RGB(${color.rgb})`}
                        </span>
                      </div>
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
    </div>
  );
}

export default App;