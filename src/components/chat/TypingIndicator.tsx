'use client';

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 max-w-[80%]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-dark-400 text-sm">ContextLinc is thinking...</span>
        </div>
      </div>
    </div>
  );
}