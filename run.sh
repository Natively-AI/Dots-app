#!/bin/bash

# Dots MVP - Run Script
# This script helps you start the backend and frontend servers

echo "🚀 Starting Dots MVP..."

# Check if database is running
if ! docker ps | grep -q dots_db; then
    echo "📦 Starting PostgreSQL database..."
    docker-compose up db -d
    sleep 3
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH

# Check if backend is already running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "Starting FastAPI server on http://localhost:8000"
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    sleep 2
else
    echo "Backend is already running!"
fi

cd ..

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Starting Next.js server on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
else
    echo "Frontend is already running!"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait

