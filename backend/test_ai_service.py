#!/usr/bin/env python3
"""
Test script for the AI service
"""

import requests
import json

def test_ai_service():
    """Test the AI service endpoints"""
    
    base_url = "http://localhost:5000"
    
    print("Testing AI Service...")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Text analysis
    print("\n2. Testing text analysis...")
    test_text = "Scientists discover new species of dinosaur in Argentina. The fossilized remains suggest this was a herbivorous dinosaur that lived during the Late Cretaceous period."
    
    try:
        response = requests.post(
            f"{base_url}/analyze/text",
            json={"text": test_text},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text analysis passed")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}%")
            print(f"   Explanation: {result.get('explanation', 'N/A')[:100]}...")
        else:
            print(f"❌ Text analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Text analysis error: {e}")
    
    # Test 3: URL analysis
    print("\n3. Testing URL analysis...")
    test_url = "https://twitter.com/example/status/123456789"
    
    try:
        response = requests.post(
            f"{base_url}/analyze/url",
            json={"url": test_url},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ URL analysis passed")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}%")
        else:
            print(f"❌ URL analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ URL analysis error: {e}")
    
    # Test 4: Fake news detection
    print("\n4. Testing fake news detection...")
    fake_text = "BREAKING: Alien spaceship spotted over White House! Government confirms extraterrestrial visit and secret meeting with President. Sources say aliens are planning to take over Earth next week!"
    
    try:
        response = requests.post(
            f"{base_url}/analyze/text",
            json={"text": fake_text},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Fake news detection passed")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}%")
            print(f"   Explanation: {result.get('explanation', 'N/A')[:100]}...")
        else:
            print(f"❌ Fake news detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Fake news detection error: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_ai_service() 