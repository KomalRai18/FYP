#!/bin/bash

echo "Testing Fake News Detection API..."
echo "=================================="

BASE_URL="http://localhost:3000/api/twitter"

echo ""
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | python3 -m json.tool

echo ""
echo "2. Testing Model Status..."
curl -s "$BASE_URL/model/status" | python3 -m json.tool

echo ""
echo "3. Training Model with Sample Data..."
curl -s -X POST "$BASE_URL/model/train" \
  -H "Content-Type: application/json" \
  -d @ml_model/sample_training_data.json | python3 -m json.tool

echo ""
echo "4. Testing Text Analysis (Fake News)..."
curl -s -X POST "$BASE_URL/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "BREAKING: Scientists discover that drinking water causes immediate death, government cover-up exposed!"}' | python3 -m json.tool

echo ""
echo "5. Testing Text Analysis (Real News)..."
curl -s -X POST "$BASE_URL/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Local school district announces new STEM program for elementary students starting next fall."}' | python3 -m json.tool

echo ""
echo "6. Testing URL Analysis..."
curl -s -X POST "$BASE_URL/analyze/url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' | python3 -m json.tool

echo ""
echo "Testing completed!"