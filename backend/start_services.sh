#!/bin/bash

echo "Starting TruthCheck AI Services..."
echo

echo "Starting Python AI Service..."
python3 ai_service.py &
AI_PID=$!

echo "Waiting for AI service to start..."
sleep 5

echo "Starting Node.js Server..."
npm run start:dev &
NODE_PID=$!

echo
echo "Services are starting..."
echo "- AI Service: http://localhost:5000"
echo "- Node.js Server: http://localhost:4000"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $AI_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 