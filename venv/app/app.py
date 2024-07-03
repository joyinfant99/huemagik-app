from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import io
import base64
import traceback

app = Flask(__name__)
CORS(app)

def get_colors(image, number_of_colors):
    try:
        # Resize image to speed up processing
        image = image.resize((150, 150))
        
        # Convert image to RGB values
        image = image.convert("RGB")
        image_array = np.array(image)
        
        # Reshape the image to be a list of pixels
        image_array = image_array.reshape((image_array.shape[0] * image_array.shape[1], 3))
        
        # Cluster and extract colors
        kmeans = KMeans(n_clusters=number_of_colors)
        kmeans.fit(image_array)
        
        # Get the colors
        colors = kmeans.cluster_centers_
        
        # Convert to integer RGB values
        colors = colors.round().astype(int)
        
        return colors.tolist()
    except Exception as e:
        print(f"Error in get_colors: {str(e)}")
        traceback.print_exc()
        return None

def simple_get_colors(image, number_of_colors):
    try:
        # Resize image to speed up processing
        image = image.resize((150, 150))
        
        # Convert image to RGB values
        image = image.convert("RGB")
        pixels = list(image.getdata())
        
        # Count occurrences of each color
        color_count = {}
        for pixel in pixels:
            if pixel in color_count:
                color_count[pixel] += 1
            else:
                color_count[pixel] = 1
        
        # Sort colors by count and get the top 'number_of_colors'
        sorted_colors = sorted(color_count.items(), key=lambda x: x[1], reverse=True)
        top_colors = sorted_colors[:number_of_colors]
        
        return [list(color[0]) for color in top_colors]
    except Exception as e:
        print(f"Error in simple_get_colors: {str(e)}")
        traceback.print_exc()
        return None

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        number_of_colors = int(request.form.get('colors', 9))
        
        # Open the image using Pillow
        image = Image.open(image_file)
        
        # Process the image and get colors
        colors = get_colors(image, number_of_colors)
        
        if colors is None:
            # If KMeans fails, try the simple method
            colors = simple_get_colors(image, number_of_colors)
        
        if colors is None:
            return jsonify({'error': 'Failed to process image'}), 500
        
        return jsonify({'colors': colors})
    except Exception as e:
        print(f"Error in process_image: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)