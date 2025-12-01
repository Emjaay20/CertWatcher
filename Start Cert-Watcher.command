#!/bin/bash
echo "Starting Cert-Watcher..."

# Define paths
PROJECT_DIR="/Users/yusufabubakar/.gemini/antigravity/scratch/cert-watcher"

# Start Backend
echo "Starting Backend..."
cd "$PROJECT_DIR/server"
npm start &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd "$PROJECT_DIR/client"
npm run dev &
FRONTEND_PID=$!

# Wait for startup
sleep 4
open "http://localhost:5173"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "Cert-Watcher is running."
echo "Press CTRL+C to stop both servers."
wait
