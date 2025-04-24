"use client";

import React, { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext';
import Login from './components/Login';
import Chat from './components/Chat';
import styles from './page.module.css';

export default function Home() {
  const { isSocketReady, username, users, groups, getUsers, getGroups } = useSocket();
  const [activeChat, setActiveChat] = useState<string>('');
  const [chatType, setChatType] = useState<'private' | 'group'>('private');
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  useEffect(() => {
    if (username) {
      getUsers();
      getGroups();
    }
  }, [username, getUsers, getGroups]);

  // Refresh users and groups every 30 seconds
  useEffect(() => {
    if (username) {
      const interval = setInterval(() => {
        getUsers();
        getGroups();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [username, getUsers, getGroups]);

  const handleChatSelect = (name: string, type: 'private' | 'group') => {
    setActiveChat(name);
    setChatType(type);
  };

  if (!isSocketReady) {
    return <div className={styles.loading}>Connecting to server...</div>;
  }

  if (!username) {
    return <Login />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.username}>
            <h3>{username}</h3>
            <span className={styles.onlineStatus}>Online</span>
          </div>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'groups' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
        
        <div className={styles.chatList}>
          {activeTab === 'users' ? (
            users.length > 0 ? (
              users
                .filter(user => user !== username)
                .map(user => (
                  <div 
                    key={user} 
                    className={`${styles.chatItem} ${activeChat === user && chatType === 'private' ? styles.active : ''}`}
                    onClick={() => handleChatSelect(user, 'private')}
                  >
                    <div className={styles.chatAvatar}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.chatName}>{user}</div>
                  </div>
                ))
            ) : (
              <div className={styles.emptyList}>No users available</div>
            )
          ) : (
            groups.length > 0 ? (
              groups.map(group => (
                <div 
                  key={group.name} 
                  className={`${styles.chatItem} ${activeChat === group.name && chatType === 'group' ? styles.active : ''}`}
                  onClick={() => handleChatSelect(group.name, 'group')}
                >
                  <div className={styles.chatAvatar}>
                    <i className="group-icon">G</i>
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatName}>{group.name}</div>
                    {group.memberCount && (
                      <div className={styles.memberCount}>{group.memberCount} members</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>No groups available</div>
            )
          )}
        </div>
      </div>
      
      <div className={styles.chatArea}>
        {activeChat ? (
          <Chat activeChat={activeChat} chatType={chatType} />
        ) : (
          <div className={styles.noChatSelected}>
            <h2>Welcome, {username}!</h2>
            <p>Select a user or group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
