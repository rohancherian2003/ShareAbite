#!/bin/bash

# Function to clean up background processes when you press Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Stopping ShareAbite servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Catch Ctrl+C and run the cleanup function
trap cleanup SIGINT SIGTERM

echo "🚀 Starting ShareAbite Servers..."

# Start the Backend in the background
cd "mca project/backend" || exit
npm run dev &
BACKEND_PID=$!

# Start the Frontend in the background
cd ../frontend || exit
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==============================================="
echo "✅ Backend running on http://localhost:5001"
echo "✅ Frontend running on http://localhost:5173"
echo "==============================================="
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait to keep the script running
wait $BACKEND_PID $FRONTEND_PID
