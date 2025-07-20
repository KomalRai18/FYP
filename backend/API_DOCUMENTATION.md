# Fake News Detection API Documentation

## Overview

This API provides endpoints for detecting fake news using machine learning. It supports both text analysis and URL analysis, allowing users to check the authenticity of news content.

## Base URL

```
http://localhost:3000/api/twitter
```

## Authentication

Currently, no authentication is required for the prediction endpoints. The training endpoint may require admin authentication in production.

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the API service is running.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "Fake News Detection API",
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  },
  "message": "Service is running normally"
}
```

### 2. Model Status

**GET** `/model/status`

Check if the ML model is trained and ready for predictions.

**Response:**
```json
{
  "success": true,
  "data": {
    "model_trained": true,
    "model_exists": true,
    "tokenizer_exists": true,
    "model_stats": {
      "size": 15.2,
      "created": "2024-01-01T10:00:00.000Z",
      "modified": "2024-01-01T10:00:00.000Z"
    },
    "ready_for_prediction": true
  },
  "message": "Model is trained and ready for predictions"
}
```

### 3. Analyze Text

**POST** `/analyze/text`

Analyze text content for fake news detection.

**Request Body:**
```json
{
  "text": "Your news text content here..."
}
```

**Validation:**
- `text` is required and must be a non-empty string
- Maximum length: 10,000 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "input_text": "Your news text content here...",
    "prediction": "real",
    "confidence": 0.87,
    "probability_real": 0.87,
    "probability_fake": 0.13,
    "analysis_type": "text"
  },
  "message": "The news appears to be real with 87% confidence."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Text input is required and must be a non-empty string"
}
```

### 4. Analyze URL

**POST** `/analyze/url`

Extract text from a URL and analyze it for fake news detection.

**Request Body:**
```json
{
  "url": "https://example.com/news-article"
}
```

**Validation:**
- `url` is required and must be a valid HTTP/HTTPS URL
- Protocol (http/https) will be added if missing

**Response:**
```json
{
  "success": true,
  "data": {
    "input_url": "https://example.com/news-article",
    "extracted_text": "Article content extracted from the URL...",
    "prediction": "fake",
    "confidence": 0.92,
    "probability_real": 0.08,
    "probability_fake": 0.92,
    "analysis_type": "url"
  },
  "message": "The news from the URL appears to be fake with 92% confidence."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid URL format. Please provide a valid HTTP/HTTPS URL."
}
```

### 5. Train Model

**POST** `/model/train`

Train the ML model with new data (Admin functionality).

**Request Body:**
```json
{
  "texts": [
    "News article 1 content...",
    "News article 2 content...",
    "News article 3 content..."
  ],
  "labels": [0, 1, 0]
}
```

**Validation:**
- `texts` and `labels` are required arrays
- Both arrays must have the same length
- Minimum 10 training samples required
- Labels must be 0 (fake) or 1 (real)

**Response:**
```json
{
  "success": true,
  "data": {
    "accuracy": 0.89,
    "training_samples": 100,
    "model_saved": true
  },
  "message": "Model trained successfully with 89% accuracy."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Both texts and labels arrays are required for training"
}
```

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": object | null,
  "message": string,
  "error": string (only when success is false)
}
```

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

## Prediction Confidence Levels

- **High Confidence**: 0.8 - 1.0 (80-100%)
- **Medium Confidence**: 0.6 - 0.79 (60-79%)
- **Low Confidence**: 0.5 - 0.59 (50-59%)

## Usage Examples

### Using cURL

**Analyze Text:**
```bash
curl -X POST http://localhost:3000/api/twitter/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Breaking news: Scientists discover cure for all diseases"}'
```

**Analyze URL:**
```bash
curl -X POST http://localhost:3000/api/twitter/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/news-article"}'
```

**Check Model Status:**
```bash
curl http://localhost:3000/api/twitter/model/status
```

### Using JavaScript (Frontend)

```javascript
// Analyze text
const analyzeText = async (text) => {
  try {
    const response = await fetch('http://localhost:3000/api/twitter/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Analyze URL
const analyzeUrl = async (url) => {
  try {
    const response = await fetch('http://localhost:3000/api/twitter/analyze/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Error Handling

The API returns detailed error messages for debugging:

```json
{
  "success": false,
  "error": "Model not trained or loaded. Please train the model first.",
  "details": {
    "error": "Model not trained or loaded. Please train the model first.",
    "prediction": null,
    "confidence": null
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:4000`

Update the CORS configuration in `index.js` to add more allowed origins.

## Model Training

Before using the prediction endpoints, you need to train the model:

1. Use the sample training data provided in `sample_training_data.json`
2. Call the `/model/train` endpoint with your training data
3. The model will be saved automatically and ready for predictions

## Setup Instructions

1. Install Python dependencies:
   ```bash
   cd backend
   chmod +x setup_ml.sh
   ./setup_ml.sh
   ```

2. Start the backend server:
   ```bash
   npm run start:dev
   ```

3. Train the model (optional - use sample data):
   ```bash
   curl -X POST http://localhost:3000/api/twitter/model/train \
     -H "Content-Type: application/json" \
     -d @ml_model/sample_training_data.json
   ```

4. Test the API:
   ```bash
   curl -X POST http://localhost:3000/api/twitter/analyze/text \
     -H "Content-Type: application/json" \
     -d '{"text": "This is a test news article"}'
   ```