import React, { useState, useEffect, useRef } from 'react';
import { useSocket, ChatMessage } from '../context/SocketContext';
import styles from './Chat.module.css';

type ChatProps = {
  activeChat: string;
  chatType: 'private' | 'group';
};

const Chat: React.FC<ChatProps> = ({ activeChat, chatType }) => {
  const { messages, sendPrivateMessage, sendGroupMessage, username } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages based on active chat
  const filteredMessages = messages.filter((msg) => {
    if (chatType === 'private') {
      return (msg.from === activeChat && msg.to === username) || 
             (msg.from === username && msg.to === activeChat);
    } else {
      return msg.group === activeChat;
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send button clicked");
    if (!newMessage.trim()) {
      console.log("Message is empty, not sending");
      return;
    }
  
    console.log(`Sending message to ${activeChat}: ${newMessage}`);
    
    if (chatType === 'private') {
      console.log("Sending private message");
      sendPrivateMessage(activeChat, newMessage);
    } else {
      console.log("Sending group message");
      sendGroupMessage(activeChat, newMessage);
    }
    
    setNewMessage('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>{activeChat} {chatType === 'group' ? '(Group)' : ''}</h2>
      </div>
      
      <div className={styles.messagesContainer}>
        {filteredMessages.length === 0 ? (
          <div className={styles.emptyChat}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.from === username ? styles.sentMessage : styles.receivedMessage}`}
            >
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.sender}>{msg.from}</span>
                  <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p>{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;