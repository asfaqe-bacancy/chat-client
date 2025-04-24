
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          No messages yet. Start a conversation!
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className={`flex w-full mb-4 ${
              message.from === username ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`flex flex-col max-w-xs mx-2 rounded-lg px-3 py-2 ${
                message.from === username 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100'
              }`}>
                <span className={`text-xs ${
                  message.from === username ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.from}
                </span>
                <p className="text-sm">{message.message}</p>
                <span className={`text-xs self-end mt-1 ${
                  message.from === username ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};