#!/bin/bash

echo "Setting up Python environment for Fake News Detection..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Create virtual environment (optional but recommended)
echo "Creating virtual environment..."
python3 -m venv ml_env

# Activate virtual environment
echo "Activating virtual environment..."
source ml_env/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install required packages
echo "Installing Python dependencies..."
pip install -r ml_model/requirements.txt

echo "Setup completed successfully!"
echo ""
echo "To activate the virtual environment in the future, run:"
echo "source backend/ml_env/bin/activate"
echo ""
echo "To test the setup, you can run:"
echo "python3 backend/ml_model/fake_news_detector.py predict_text 'This is a test news article'"