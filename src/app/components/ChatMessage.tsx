// components/ChatMessage.tsx
import { ChatMessage } from '../context/SocketContext';

interface MessageProps {
  message: ChatMessage;
  currentUsername: string | null;
}

export const ChatMessageItem: React.FC<MessageProps> = ({ message, currentUsername }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = () => {
    switch (message.type) {
      case 'private-received':
        return (
          <div className="flex flex-col max-w-xs mx-2 rounded-lg px-3 py-2 bg-gray-100">
            <span className="text-xs text-gray-500">{message.from}</span>
            <p className="text-sm">{message.content}</p>
            <span className="text-xs text-gray-400 self-end mt-1">{formatTime(message.timestamp)}</span>
          </div>
        );
      case 'private-sent':
        return (
          <div className="flex flex-col max-w-xs mx-2 rounded-lg px-3 py-2 bg-blue-500 text-white self-end">
            <span className="text-xs text-blue-100">To: {message.to}</span>
            <p className="text-sm">{message.content}</p>
            <span className="text-xs text-blue-200 self-end mt-1">{formatTime(message.timestamp)}</span>
          </div>
        );
      case 'group':
        return (
          <div className={`flex flex-col max-w-xs mx-2 rounded-lg px-3 py-2 ${
            message.from === currentUsername ? 'bg-blue-500 text-white self-end' : 'bg-green-100'
          }`}>
            <div className="flex justify-between">
              <span className={`text-xs ${message.from === currentUsername ? 'text-blue-100' : 'text-green-700'}`}>
                {message.from} in {message.group}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
            <span className={`text-xs self-end mt-1 ${message.from === currentUsername ? 'text-blue-200' : 'text-green-600'}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        );
      case 'notification':
        return (
          <div className="flex items-center justify-center my-2">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {message.content} • {formatTime(message.timestamp)}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex w-full mb-4 ${message.type === 'notification' ? 'justify-center' : (
      message.type === 'private-sent' || (message.type === 'group' && message.from === currentUsername) ? 'justify-end' : 'justify-start'
    )}`}>
      {renderMessage()}
    </div>
  );
};
