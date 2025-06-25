import React from 'react';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon } from './icons.tsx'; // Assuming you have these icons

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col space-y-1 text-sm max-w-xs mx-2 ${isUser ? 'order-1 items-end' : 'order-2 items-start'}`}>
        <div>
          <span 
            className={`px-4 py-2 rounded-lg inline-block shadow ${isUser ? 
              'bg-green-600 text-white rounded-br-none dark:bg-green-500' : 
              'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-slate-600 dark:text-slate-100'}`}
            style={{ overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'auto' }}
          >
            {message.text}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{formatTimestamp(message.timestamp)}</span>
      </div>
       <div className={`order-${isUser ? 2 : 1}`}>
        {isUser ? (
          <UserIcon className="w-6 h-6 rounded-full text-green-700 dark:text-green-400" />
        ) : (
          <BotIcon className="w-6 h-6 rounded-full text-gray-700 dark:text-slate-300" />
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;