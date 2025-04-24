"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type User = {
  id: string;
  username: string;
  isSocketReady?: boolean;
};

type Message = {
  id: string;
  sender: string;
  receiver?: string;
  group?: string;
  content: string;
};

type Group = {
  id: string;
  name: string;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isSocketReady: boolean;
  username: string;
  users: User[];
  groups: Group[];
  messages: Message[];
  register: (username: string) => Promise<{ success: boolean; message: string }>;
  sendPrivateMessage: (receiver: string, content: string) => void;
  sendGroupMessage: (group: string, content: string) => void;
  joinGroup: (group: string) => void;
  leaveGroup: (group: string) => void;
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
  const [messages, setMessages] = useState<Message[]>([]);

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

    socketInstance.on("update_users", (updatedUsers: User[]) => {
      console.log("Users updated:", updatedUsers);
      setUsers(updatedUsers);
    });

    socketInstance.on("update_groups", (updatedGroups: Group[]) => {
      console.log("Groups updated:", updatedGroups);
      setGroups(updatedGroups);
    });

    socketInstance.on("receive_message", (message: Message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
        }
        resolve(response);
      });
    });
  };

  const sendPrivateMessage = (receiver: string, content: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("privateMessage", { to: receiver, message: content });
    }
  };

  const sendGroupMessage = (group: string, content: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("groupMessage", { group, message: content });
    }
  };

  const joinGroup = (group: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("joinGroup", group);
    }
  };

  const leaveGroup = (group: string) => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("leaveGroup", group);
    }
  };

  const getUsers = () => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("getUsers");
    }
  };

  const getGroups = () => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      currentSocket.emit("getGroups");
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
