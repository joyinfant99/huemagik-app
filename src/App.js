import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCamera, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import './App.css';
// joy
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
    formData.append('colors', 5);  // Number of colors to extract

    try {
      const response = await axios.post('https://huemagik-backend-env.eba-dmg3y9rq.us-west-2.elasticbeanstalk.com/process_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
    const width = 2480;  // A4 width at 300 DPI
    const height = 3508; // A4 height at 300 DPI
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
  
    // Fill background
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, width, height);
  
    // Add rounded corners
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(0, height - 100);
    ctx.quadraticCurveTo(0, height, 100, height);
    ctx.lineTo(width - 100, height);
    ctx.quadraticCurveTo(width, height, width, height - 100);
    ctx.lineTo(width, 100);
    ctx.quadraticCurveTo(width, 0, width - 100, 0);
    ctx.lineTo(100, 0);
    ctx.quadraticCurveTo(0, 0, 0, 100);
    ctx.closePath();
    ctx.clip();
  
    // Add HueMagik branding
    ctx.fillStyle = 'black';
    ctx.font = 'bold 100px Alata';
    ctx.fillText('HUEMAGIK', 100, 150);
  
    // Draw image
    const drawContent = () => {
      if (uploadedImage) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let drawWidth = 1100;
          let drawHeight = drawWidth / aspectRatio;
          ctx.drawImage(img, 100, 250, drawWidth, drawHeight);
          drawPalettes();
          finalize();
        };
        img.src = uploadedImage;
      } else {
        drawPalettes();
        finalize();
      }
    };
  
    const drawPalettes = () => {
      const startY = 1500;
      const paletteWidth = 740;
      const paletteHeight = 500;
      const gap = 50;
  
      // Draw palettes
      ['', 'HEX: ', 'RGB: '].forEach((prefix, index) => {
        const x = 100 + (index % 3) * (paletteWidth + gap);
        const y = startY;
  
        // Draw palette container
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(x, y, paletteWidth, paletteHeight);
        ctx.shadowColor = 'transparent';
  
        // Draw color bars
        palette.forEach((color, colorIndex) => {
          const barHeight = paletteHeight / palette.length;
          ctx.fillStyle = color.hex;
          ctx.fillRect(x, y + colorIndex * barHeight, paletteWidth, barHeight);
  
          if (prefix) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '30px Alata';
            ctx.fillText(prefix + (prefix === 'HEX: ' ? color.hex : color.rgb), 
                         x + 10, y + colorIndex * barHeight + barHeight / 2 + 10);
          }
        });
      });
    };
  
    const finalize = () => {
      // Add footer
      ctx.fillStyle = '#4A90E2';
      ctx.font = '40px Alata';
      ctx.fillText('HUMEMAGIK', 100, height - 150);
      ctx.fillStyle = 'black';
      ctx.font = '40px Alata';
      ctx.fillText('BY MAGIKMODS', 100, height - 100);
  
      // Create download
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = 'palette.png';
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save('palette.pdf');
      }
    };
  
    drawContent();
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