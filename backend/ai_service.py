import os
import pickle
import re
import nltk
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import requests
from urllib.parse import urlparse
import json

# Download required NLTK data
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('omw-1.4')

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizer
model = None
tokenizer = None
max_len = 300

# Text cleaning function
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    """Clean and preprocess text for analysis"""
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text, re.I|re.A)
    # Tokenize
    tokens = text.split()
    # Remove stopwords and lemmatize
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    # Join back to string
    return ' '.join(tokens)

def load_model():
    """Load the trained model and tokenizer"""
    global model, tokenizer
    
    try:
        # Load the model
        model = tf.keras.models.load_model('fake_news_detector.h5')
        
        # Load the tokenizer
        with open('tokenizer.pickle', 'rb') as handle:
            tokenizer = pickle.load(handle)
            
        print("Model and tokenizer loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def predict_news(text):
    """Predict if the given text is fake or real news"""
    global model, tokenizer
    
    if model is None or tokenizer is None:
        return {"error": "Model not loaded"}
    
    try:
        # Clean the text
        cleaned_text = clean_text(text)
        
        if not cleaned_text.strip():
            return {"error": "No valid text content found"}
        
        # Tokenize and pad
        seq = tokenizer.texts_to_sequences([cleaned_text])
        padded_seq = pad_sequences(seq, maxlen=max_len)
        
        # Predict
        prediction = model.predict(padded_seq, verbose=0)
        probability = float(prediction[0][0])
        
        # Determine verdict
        if probability > 0.7:
            verdict = "fake"
            confidence = probability * 100
        elif probability < 0.3:
            verdict = "real"
            confidence = (1 - probability) * 100
        else:
            verdict = "uncertain"
            confidence = 50.0
        
        # Generate explanation
        explanation = generate_explanation(verdict, probability, cleaned_text)
        
        # Calculate factors (mock values for now)
        factors = {
            "languagePattern": min(probability * 100, 95),
            "accountCredibility": 75.0,
            "contentConsistency": max((1 - probability) * 100, 25),
            "temporalAnalysis": 60.0
        }
        
        return {
            "success": True,
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "probability": round(probability, 4),
            "explanation": explanation,
            "factors": factors,
            "cleaned_text": cleaned_text[:200] + "..." if len(cleaned_text) > 200 else cleaned_text
        }
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {"error": f"Prediction failed: {str(e)}"}

def generate_explanation(verdict, probability, text):
    """Generate explanation for the prediction"""
    if verdict == "fake":
        if probability > 0.9:
            return "This content shows strong indicators of misinformation with highly suspicious language patterns and claims that contradict established facts."
        elif probability > 0.7:
            return "This content appears to be fake news based on unusual language patterns, sensationalist claims, and lack of credible sources."
        else:
            return "This content shows some characteristics of misinformation but requires further verification."
    
    elif verdict == "real":
        if probability < 0.1:
            return "This content appears to be from credible sources with factual information and proper attribution."
        else:
            return "This content shows characteristics of legitimate news with reasonable claims and language patterns."
    
    else:
        return "This content is ambiguous and requires additional context or verification to determine its authenticity."

def extract_tweet_content(url):
    """Extract content from Twitter URL (placeholder for now)"""
    try:
        # This is a placeholder - you'll need to implement actual Twitter API integration
        # For now, we'll return a mock response
        parsed_url = urlparse(url)
        if 'twitter.com' in parsed_url.netloc or 'x.com' in parsed_url.netloc:
            return {
                "success": True,
                "content": f"Mock tweet content from {url}. This is a placeholder for actual Twitter API integration.",
                "author": "mock_user",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        else:
            return {"error": "Not a valid Twitter URL"}
    except Exception as e:
        return {"error": f"Error extracting tweet content: {str(e)}"}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None
    })

@app.route('/analyze/text', methods=['POST'])
def analyze_text():
    """Analyze text content for fake news"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Text content is required"}), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({"error": "Text content cannot be empty"}), 400
        
        result = predict_news(text)
        
        if "error" in result:
            return jsonify(result), 500
        
        # Add metadata
        result["input_type"] = "text"
        result["timestamp"] = str(np.datetime64('now'))
        result["id"] = str(np.random.randint(1000000, 9999999))
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/analyze/url', methods=['POST'])
def analyze_url():
    """Analyze Twitter URL for fake news"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({"error": "URL is required"}), 400
        
        url = data['url']
        
        if not url or not url.strip():
            return jsonify({"error": "URL cannot be empty"}), 400
        
        # Extract content from URL
        tweet_data = extract_tweet_content(url)
        
        if "error" in tweet_data:
            return jsonify(tweet_data), 400
        
        # Analyze the extracted content
        result = predict_news(tweet_data["content"])
        
        if "error" in result:
            return jsonify(result), 500
        
        # Add metadata
        result["input_type"] = "url"
        result["timestamp"] = str(np.datetime64('now'))
        result["id"] = str(np.random.randint(1000000, 9999999))
        result["source_url"] = url
        result["tweet_metadata"] = {
            "author": tweet_data.get("author"),
            "timestamp": tweet_data.get("timestamp")
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/analyze', methods=['POST'])
def analyze_content():
    """Universal endpoint for analyzing content"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Check if it's a URL or text
        if 'url' in data and data['url']:
            return analyze_url()
        elif 'text' in data and data['text']:
            return analyze_text()
        else:
            return jsonify({"error": "Either 'url' or 'text' is required"}), 400
            
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    # Load model on startup
    if load_model():
        print("AI Service started successfully!")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Failed to load model. Exiting...") 