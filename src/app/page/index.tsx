"use client";

import { useState } from 'react';
import Head from 'next/head';
import { useSocket } from '../context/SocketContext';
import Login from '../components/Login';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/ChatContainer';

export default function Home() {
  const { isConnected, username } = useSocket();
  const [selectedChat, setSelectedChat] = useState<{ type: 'private' | 'group'; name: string } | null>(null);

  const handleSelectPrivateChat = (username: string) => {
    setSelectedChat({ type: 'private', name: username });
  };

  const handleSelectGroupChat = (groupName: string) => {
    setSelectedChat({ type: 'group', name: groupName });
  };

  if (!isConnected || !username) {
    return <Login />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        onSelectPrivateChat={handleSelectPrivateChat}
        onSelectGroupChat={handleSelectGroupChat}
      />
      <ChatContainer selectedChat={selectedChat} />
    </div>
  );
}