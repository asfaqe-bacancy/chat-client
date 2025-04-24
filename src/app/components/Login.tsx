"use client";

import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export default function Login() {
  const { register, isConnected, isSocketReady } = useSocket();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting to server...');







  //   const io = require("socket.io-client");

  // // Replace with your WebSocket server URL
  // const socket = io("http://localhost:3132");

  // // Log when connected
  // socket.on("connect", () => {
  //   console.log("Connected to WebSocket server");
  // });

  // // Log any messages received
  // socket.on("message", (data) => {
  //   console.log("Message from server:", data);
  // });

  // // Log disconnection
  // socket.on("disconnect", () => {
  //   console.log("Disconnected from server");
  // });


  // Show connection status to the user
  useEffect(() => {


    console.log('Test ----?>  ');
    console.log('Connection status updated:', { isConnected, isSocketReady });
    if (isSocketReady) {
      setConnectionStatus('Connected to server');
    } else if (isConnected) {
      setConnectionStatus('Connection established, preparing socket...');
    } else {
      setConnectionStatus('Connecting to server...');
    }
  }, [isConnected, isSocketReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submitted with username:", username);

    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required. Please enter a valid username.');
      return;
    }

    // Don't proceed if socket isn't ready
    if (!isSocketReady) {
      setError('Waiting for server connection. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to register with username:', username);
      const result = await register(username);
      console.log('Register result:', result);

      if (!result.success) {
        console.error('Registration failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Failed to connect. Please try again.');
    } finally {
      console.log('Registration process completed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Chat App</h1>
          <p className="mt-2 text-gray-600">Sign in to start chatting</p>
          
          {/* Show connection status */}
          <div className={`mt-2 text-sm ${isSocketReady ? 'text-green-600' : 'text-amber-600'}`}>
            {connectionStatus}
          </div>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !isSocketReady}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : !isSocketReady ? 'Waiting for connection...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}