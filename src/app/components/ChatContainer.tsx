"use client";

// components/ChatContainer.tsx
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { FaUser, FaUsers, FaSignOutAlt } from 'react-icons/fa';

interface ChatContainerProps {
  selectedChat: { type: 'private' | 'group'; name: string } | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ selectedChat }) => {
  const { 
    username, 
    messages, 
    sendPrivateMessage, 
    sendGroupMessage,
    leaveGroup
  } = useSocket();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      if (selectedChat.type === 'private') {
        await sendPrivateMessage(selectedChat.name, message);
      } else {
        await sendGroupMessage(selectedChat.name, message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedChat || selectedChat.type !== 'group') return;
    
    const confirmed = window.confirm(`Are you sure you want to leave the group "${selectedChat.name}"?`);
    if (!confirmed) return;
    
    try {
      await leaveGroup(selectedChat.name);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  // Filter messages for current chat
  const filteredMessages = messages.filter(message => {
    if (!selectedChat) return false;
    
    if (selectedChat.type === 'private') {
      return (
        (message.from === selectedChat.name && message.to === username) ||
        (message.from === username && message.to === selectedChat.name)
      );
    } else {
      return (
          (message.group === selectedChat.name) ||
        (message.type === 'notification' && message.group === selectedChat.name) ||
        (message.group === selectedChat.name)
      );
    }
  });

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Welcome to the Chat App</h2>
          <p className="mt-2 text-gray-500">Select a user or group to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
            ${selectedChat.type === 'private' ? 'bg-gray-200' : 'bg-green-100 text-green-700'}`}>
            {selectedChat.type === 'private' ? (
              selectedChat.name.charAt(0).toUpperCase()
            ) : (
              <FaUsers />
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium">{selectedChat.name}</p>
            <p className="text-xs text-gray-500">
              {selectedChat.type === 'private' ? 'Private Chat' : 'Group Chat'}
            </p>
          </div>
        </div>
        
        {selectedChat.type === 'group' && (
          <button
            onClick={handleLeaveGroup}
            className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
            title="Leave group"
          >
            <FaSignOutAlt />
          </button>
        )}
      </div>
      
      <MessageList messages={filteredMessages} username={username} />
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        recipient={selectedChat.name}
        chatType={selectedChat.type}
        disabled={isLoading}
      />
    </div>
  );
};