
// components/MessageList.tsx
import { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../context/SocketContext';
import { ChatMessageItem } from './ChatMessage';

interface MessageListProps {
  messages: ChatMessageType[];
  username: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, username }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No messages yet. Start a conversation!
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} currentUsername={username} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};