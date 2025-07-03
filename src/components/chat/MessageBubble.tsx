'use client';

import { Message } from './ChatInterface';
import { formatDistanceToNow } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        isUser 
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white' 
          : isSystem
          ? 'bg-red-900/20 border border-red-700/30 text-red-300'
          : 'bg-dark-800 border border-dark-700 text-white'
      }`}>
        {/* Message Content */}
        <div className="prose prose-invert max-w-none">
          {message.content.split('\\n').map((line, index) => (
            <p key={index} className={`${index > 0 ? 'mt-2' : ''} leading-relaxed`}>
              {line}
            </p>
          ))}
        </div>
        
        {/* Files */}
        {message.files && message.files.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm opacity-80 mb-2">Attached files:</p>
            <div className="space-y-1">
              {message.files.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="w-4 h-4">📎</span>
                  <span>{file.name}</span>
                  <span className="opacity-60">({formatFileSize(file.size)})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Context Info for Assistant Messages */}
        {!isUser && !isSystem && message.context && (
          <div className="mt-3 pt-3 border-t border-dark-600">
            <div className="flex items-center justify-between text-xs text-dark-400">
              <span>Processed in {message.context.processingTime}</span>
              <span>Confidence: {Math.round(message.context.confidence * 100)}%</span>
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          isUser ? 'text-white/70' : 'text-dark-400'
        }`}>
          {formatDistanceToNow(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}