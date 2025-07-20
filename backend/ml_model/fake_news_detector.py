#!/usr/bin/env python3

import sys
import json
import numpy as np
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping
import pickle
import os
import requests
from bs4 import BeautifulSoup
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

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

class FakeNewsDetector:
    def __init__(self, model_path='./ml_model/fake_news_model.h5', tokenizer_path='./ml_model/tokenizer.pkl'):
        self.model_path = model_path
        self.tokenizer_path = tokenizer_path
        self.model = None
        self.tokenizer = None
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.max_length = 100
        self.vocab_size = 10000
        
    def preprocess_text(self, text):
        """Clean and preprocess text data"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs, mentions, hashtags
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'@\w+|#\w+', '', text)
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and remove stopwords
        words = text.split()
        words = [self.lemmatizer.lemmatize(word) for word in words if word not in self.stop_words and len(word) > 2]
        
        return ' '.join(words)
    
    def extract_text_from_url(self, url):
        """Extract text content from a URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
        except Exception as e:
            return f"Error extracting text from URL: {str(e)}"
    
    def create_model(self):
        """Create and compile the LSTM model"""
        model = Sequential([
            Embedding(self.vocab_size, 128, input_length=self.max_length),
            Bidirectional(LSTM(64, dropout=0.3, recurrent_dropout=0.3, return_sequences=True)),
            Bidirectional(LSTM(32, dropout=0.3, recurrent_dropout=0.3)),
            Dense(64, activation='relu'),
            Dropout(0.5),
            Dense(32, activation='relu'),
            Dropout(0.3),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train_model(self, texts, labels):
        """Train the model with provided data"""
        # Preprocess texts
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        # Create and fit tokenizer
        self.tokenizer = Tokenizer(num_words=self.vocab_size, oov_token='<OOV>')
        self.tokenizer.fit_on_texts(processed_texts)
        
        # Convert texts to sequences
        sequences = self.tokenizer.texts_to_sequences(processed_texts)
        padded_sequences = pad_sequences(sequences, maxlen=self.max_length, padding='post', truncating='post')
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            padded_sequences, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Create model
        self.model = self.create_model()
        
        # Early stopping
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=3,
            restore_best_weights=True
        )
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=10,
            batch_size=32,
            validation_data=(X_test, y_test),
            callbacks=[early_stopping],
            verbose=1
        )
        
        # Save model and tokenizer
        self.save_model()
        
        # Evaluate model
        test_predictions = self.model.predict(X_test)
        test_predictions_binary = (test_predictions > 0.5).astype(int)
        accuracy = accuracy_score(y_test, test_predictions_binary)
        
        return {
            'accuracy': float(accuracy),
            'history': history.history
        }
    
    def load_model(self):
        """Load pre-trained model and tokenizer"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.tokenizer_path):
                self.model = load_model(self.model_path)
                with open(self.tokenizer_path, 'rb') as f:
                    self.tokenizer = pickle.load(f)
                return True
            return False
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def save_model(self):
        """Save model and tokenizer"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            # Save model
            self.model.save(self.model_path)
            
            # Save tokenizer
            with open(self.tokenizer_path, 'wb') as f:
                pickle.dump(self.tokenizer, f)
            
            return True
        except Exception as e:
            print(f"Error saving model: {str(e)}")
            return False
    
    def predict(self, text):
        """Predict if news is fake or real"""
        try:
            if self.model is None or self.tokenizer is None:
                if not self.load_model():
                    return {
                        'error': 'Model not trained or loaded. Please train the model first.',
                        'prediction': None,
                        'confidence': None
                    }
            
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Convert to sequence
            sequence = self.tokenizer.texts_to_sequences([processed_text])
            padded_sequence = pad_sequences(sequence, maxlen=self.max_length, padding='post', truncating='post')
            
            # Make prediction
            prediction_prob = self.model.predict(padded_sequence, verbose=0)[0][0]
            
            # Convert to binary prediction
            prediction = 'fake' if prediction_prob < 0.5 else 'real'
            confidence = float(1 - prediction_prob) if prediction == 'fake' else float(prediction_prob)
            
            return {
                'prediction': prediction,
                'confidence': confidence,
                'probability_real': float(prediction_prob),
                'probability_fake': float(1 - prediction_prob)
            }
        
        except Exception as e:
            return {
                'error': f'Prediction error: {str(e)}',
                'prediction': None,
                'confidence': None
            }
    
    def predict_url(self, url):
        """Predict if news from URL is fake or real"""
        try:
            # Extract text from URL
            text = self.extract_text_from_url(url)
            
            if text.startswith("Error extracting"):
                return {
                    'error': text,
                    'prediction': None,
                    'confidence': None
                }
            
            # Make prediction on extracted text
            result = self.predict(text)
            result['extracted_text'] = text[:500] + "..." if len(text) > 500 else text
            
            return result
        
        except Exception as e:
            return {
                'error': f'URL prediction error: {str(e)}',
                'prediction': None,
                'confidence': None
            }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': 'Usage: python fake_news_detector.py <mode> <input>',
            'modes': ['predict_text', 'predict_url', 'train']
        }))
        sys.exit(1)
    
    mode = sys.argv[1]
    input_data = sys.argv[2]
    
    detector = FakeNewsDetector()
    
    if mode == 'predict_text':
        result = detector.predict(input_data)
        print(json.dumps(result))
    
    elif mode == 'predict_url':
        result = detector.predict_url(input_data)
        print(json.dumps(result))
    
    elif mode == 'train':
        # For training, input_data should be a path to training data JSON file
        try:
            with open(input_data, 'r') as f:
                training_data = json.load(f)
            
            texts = training_data['texts']
            labels = training_data['labels']  # 0 for fake, 1 for real
            
            result = detector.train_model(texts, labels)
            print(json.dumps(result))
        
        except Exception as e:
            print(json.dumps({
                'error': f'Training error: {str(e)}'
            }))
    
    else:
        print(json.dumps({
            'error': f'Unknown mode: {mode}',
            'available_modes': ['predict_text', 'predict_url', 'train']
        }))

if __name__ == "__main__":
    main()