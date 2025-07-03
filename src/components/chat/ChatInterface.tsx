'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeMessage } from './WelcomeMessage';
import { useSendMessage, useChatHistory } from '@/hooks/useAPI';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: File[];
  context?: any;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use API hooks
  const { sendMessage, loading: isSending, error: sendError } = useSendMessage();
  const { data: chatHistory, loading: historyLoading, refetch: refetchHistory } = useChatHistory(50, 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    if (chatHistory?.messages) {
      const formattedMessages: Message[] = chatHistory.messages.map((msg: any) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        context: msg.metadata
      }));
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    // Add user message optimistically
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      files,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Upload files first if any
      let fileIds: string[] = [];
      if (files && files.length > 0) {
        // TODO: Implement file upload
        console.log('Files to upload:', files);
      }

      // Send message via API
      const response = await sendMessage(content, fileIds);
      
      const assistantMessage: Message = {
        id: response.messageId || `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        context: {
          processingTime: response.metadata?.processingTime || '0s',
          confidence: response.metadata?.confidence || 0.8,
          sources: response.context?.filesProcessed > 0 ? ['uploaded-files'] : ['knowledge-base'],
          model: response.metadata?.model,
          tokensUsed: response.metadata?.tokensUsed,
          contextRelevance: response.metadata?.contextRelevance
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh chat history to stay in sync
      refetchHistory();
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateMockResponse = (content: string, files?: File[]): string => {
    if (files && files.length > 0) {
      return `I've received ${files.length} file(s): ${files.map(f => f.name).join(', ')}. I'm processing these through the multi-modal pipeline to extract context and generate embeddings. This will enhance our conversation with the content from your files.\\n\\nRegarding your message: "${content}"\\n\\nI'm analyzing this using the 11-layer Context Window Architecture to provide you with the most relevant and contextual response. The context engine is working to understand your intent and provide actionable insights.`;
    }
    
    if (content.toLowerCase().includes('context')) {
      return `Great question about context engineering! The ContextLinc platform implements a sophisticated 11-layer Context Window Architecture:\\n\\n1. **Instructions Layer** - Defines my capabilities and ethical boundaries\\n2. **User Info Layer** - Your preferences and interaction history\\n3. **Knowledge Layer** - Retrieved documents and domain expertise\\n4. **Memory Layer** - Short, medium, and long-term conversation memory\\n\\nThis layered approach ensures I provide the right information, in the right format, at the right time. Is there a specific aspect of context engineering you'd like to explore?`;
    }
    
    return `Thank you for your message: "${content}"\\n\\nI'm processing this through the ContextLinc platform's advanced context engineering system. The platform is designed to transform AI interactions by providing sophisticated context awareness and multi-modal processing capabilities.\\n\\nHow can I assist you further with context engineering or any other topic?`;
  };

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-700 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">ContextLinc Assistant</h2>
            <p className="text-sm text-dark-400">Context-aware AI conversation</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-dark-400">Active</span>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-dark-700">
        <InputArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}