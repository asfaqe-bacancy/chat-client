"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  username: string | null;
  users: string[];
  groups: { name: string; memberCount: number }[];
  messages: ChatMessage[];
  register: (username: string) => Promise<{ success: boolean; message: string }>;
  sendPrivateMessage: (to: string, message: string) => Promise<{ success: boolean; message: string }>;
  sendGroupMessage: (group: string, message: string) => Promise<{ success: boolean; message: string }>;
  joinGroup: (groupName: string) => Promise<{ success: boolean; message: string }>;
  leaveGroup: (groupName: string) => Promise<{ success: boolean; message: string }>;
  getUsers: () => void;
  getGroups: () => void;
}

export interface ChatMessage {
  id: string;
  type: 'private-received' | 'private-sent' | 'group' | 'notification';
  from?: string;
  to?: string;
  group?: string;
  content: string;
  timestamp: Date;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  username: null,
  users: [],
  groups: [],
  messages: [],
  register: () => Promise.resolve({ success: false, message: 'Socket not initialized' }),
  sendPrivateMessage: () => Promise.resolve({ success: false, message: 'Socket not initialized' }),
  sendGroupMessage: () => Promise.resolve({ success: false, message: 'Socket not initialized' }),
  joinGroup: () => Promise.resolve({ success: false, message: 'Socket not initialized' }),
  leaveGroup: () => Promise.resolve({ success: false, message: 'Socket not initialized' }),
  getUsers: () => {},
  getGroups: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Array<{name: string, memberCount: number}>>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Generate unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    // Handle private messages
    socketInstance.on('privateMessage', (data) => {
      const message: ChatMessage = {
        id: generateId(),
        type: 'private-received',
        from: data.from,
        content: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessages(prev => [...prev, message]);
    });

    // Handle sent private messages
    socketInstance.on('privateMessageSent', (data) => {
      const message: ChatMessage = {
        id: generateId(),
        type: 'private-sent',
        to: data.to,
        content: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessages(prev => [...prev, message]);
    });

    // Handle group messages
    socketInstance.on('groupMessage', (data) => {
      const message: ChatMessage = {
        id: generateId(),
        type: 'group',
        from: data.from,
        group: data.group,
        content: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessages(prev => [...prev, message]);
    });

    // Handle group notifications
    socketInstance.on('groupNotification', (data) => {
      const message: ChatMessage = {
        id: generateId(),
        type: 'notification',
        group: data.group,
        content: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessages(prev => [...prev, message]);
    });
    
    setSocket(socketInstance);
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Try to restore session from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username');
    if (savedUsername && socket) {
      socket.emit('register', savedUsername, (response: any) => {
        if (response.success) {
          setUsername(savedUsername);
          getUsers();
          getGroups();
        } else {
          localStorage.removeItem('chat_username');
        }
      });
    }
  }, [socket]);

  const register = async (usernameToRegister: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }
      
      socket.emit('register', usernameToRegister, (response: any) => {
        if (response.success) {
          setUsername(usernameToRegister);
          localStorage.setItem('chat_username', usernameToRegister);
          getUsers();
          getGroups();
          resolve({ success: true, message: response.message });
        } else {
          resolve({ success: false, message: response.message });
        }
      });
    });
  };

  const sendPrivateMessage = (to: string, message: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }
      
      socket.emit('privateMessage', { to, message }, (response: any) => {
        resolve(response);
      });
    });
  };

  const sendGroupMessage = (group: string, message: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }
      
      socket.emit('groupMessage', { group, message }, (response: any) => {
        resolve(response);
      });
    });
  };

  const joinGroup = (groupName: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }
      
      socket.emit('joinGroup', groupName, (response: any) => {
        if (response.success) {
          getGroups();
        }
        resolve(response);
      });
    });
  };

  const leaveGroup = (groupName: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }
      
      socket.emit('leaveGroup', groupName, (response: any) => {
        if (response.success) {
          getGroups();
        }
        resolve(response);
      });
    });
  };

  const getUsers = () => {
    if (!socket) return;
    
    socket.emit('getUsers', (response: any) => {
      if (response.success) {
        setUsers(response.users.filter((user: string) => user !== username));
      }
    });
  };

  const getGroups = () => {
    if (!socket) return;
    
    socket.emit('getGroups', (response: any) => {
      if (response.success) {
        setGroups(response.groups);
      }
    });
  };

  // Refresh data periodically
  useEffect(() => {
    if (!socket || !username) return;
    
    const interval = setInterval(() => {
      getUsers();
      getGroups();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [socket, username]);

  const value = {
    socket,
    isConnected,
    username,
    users,
    groups,
    messages,
    register,
    sendPrivateMessage,
    sendGroupMessage,
    joinGroup,
    leaveGroup,
    getUsers,
    getGroups,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};