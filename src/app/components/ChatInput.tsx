"use client";

import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  recipient: string;
  chatType: 'private' | 'group';
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  recipient,
  chatType,
  disabled = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message ${chatType === 'private' ? recipient : `in ${recipient}`}...`}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-600 text-white py-2 px-4 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};