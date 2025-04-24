"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type User = string;

type Group = {
  name: string;
  memberCount?: number;
};

export type ChatMessage = {
  id: string;
  from: string;
  to?: string;
  group?: string;
  message: string;
  timestamp: string;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isSocketReady: boolean;
  username: string;
  users: User[];
  groups: Group[];
  messages: ChatMessage[];
  register: (username: string) => Promise<{ success: boolean; message: string }>;
  sendPrivateMessage: (receiver: string, content: string) => void;
  sendGroupMessage: (group: string, content: string) => void;
  joinGroup: (group: string) => Promise<{ success: boolean; message: string }>;
  leaveGroup: (group: string) => Promise<{ success: boolean; message: string }>;
  getUsers: () => void;
  getGroups: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socketInstance = io("http://localhost:3132");

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setIsSocketReady(true); // Set socket as ready when connected
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
      setIsSocketReady(false);
    });

    // Listen for privateMessage events
    socketInstance.on("privateMessage", (message: ChatMessage) => {
      console.log("Private message received:", message);
      const messageWithId = {
        ...message, 
        id: generateMessageId()
      };
      setMessages((prev) => [...prev, messageWithId]);
    });

    // Listen for groupMessage events
    socketInstance.on("groupMessage", (message: ChatMessage) => {
      console.log("Group message received:", message);
      const messageWithId = {
        ...message, 
        id: generateMessageId()
      };
      setMessages((prev) => [...prev, messageWithId]);
    });

    // Listen for groupNotification events
    socketInstance.on("groupNotification", (notification) => {
      console.log("Group notification:", notification);
      // Handle group notifications if needed
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const generateMessageId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const register = (username: string) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        resolve({ success: false, message: "Socket not connected. Please try again." });
        return;
      }

      currentSocket.emit("register", username, (response: { success: boolean; message: string }) => {
        if (response.success) {
          setUsername(username);
          // Fetch users and groups after successful registration
          getUsers();
          getGroups();
        }
        resolve(response);
      });
    });
  };

  const sendPrivateMessage = (receiver: string, content: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      const message = { to: receiver, message: content };
      currentSocket.emit("privateMessage", message);
      
      // Add the sent message to our messages state
      const newMessage: ChatMessage = {
        id: generateMessageId(),
        from: username,
        to: receiver,
        message: content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const sendGroupMessage = (group: string, content: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      const message = { group, message: content };
      currentSocket.emit("groupMessage", message);
      
      // Add the sent message to our messages state
      const newMessage: ChatMessage = {
        id: generateMessageId(),
        from: username,
        group: group,
        message: content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const joinGroup = (group: string) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        resolve({ success: false, message: "Socket not connected. Please try again." });
        return;
      }

      currentSocket.emit("joinGroup", group, (response: { success: boolean; message: string }) => {
        if (response.success) {
          // Refresh groups after joining
          getGroups();
        }
        resolve(response);
      });
    });
  };

  const leaveGroup = (group: string) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        resolve({ success: false, message: "Socket not connected. Please try again." });
        return;
      }

      currentSocket.emit("leaveGroup", group, (response: { success: boolean; message: string }) => {
        if (response.success) {
          // Refresh groups after leaving
          getGroups();
        }
        resolve(response);
      });
    });
  };

  const getUsers = () => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("getUsers", (response: { users: string[] }) => {
        console.log('Received users:', response.users);
        setUsers(response.users);
      });
    }
  };

  const getGroups = () => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("getGroups", (response: { groups: Group[] }) => {
        console.log('Received groups:', response.groups);
        setGroups(response.groups);
      });
    }
  };

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    isSocketReady,
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

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
