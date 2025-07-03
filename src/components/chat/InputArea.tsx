'use client';

import { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onSendMessage: (content: string, files?: File[]) => void;
}

export function InputArea({ onSendMessage }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files);
      setMessage('');
      setFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4">
      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-dark-800 rounded-lg px-3 py-2 text-sm"
            >
              <span className="w-4 h-4">📎</span>
              <span className="truncate max-w-32">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.md,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.mp3,.wav"
        />
        
        {/* File attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-dark-400 hover:text-primary-400 transition-colors"
          title="Attach files"
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
        
        {/* Text input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about context engineering..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[2.5rem] max-h-32"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '2.5rem',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() && files.length === 0}
          className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-white p-2 rounded-lg transition-colors"
          title="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
      
      <div className="mt-2 text-xs text-dark-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}