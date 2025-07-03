'use client';

export function WelcomeMessage() {
  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
          🧠
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Welcome to ContextLinc
        </h3>
        <p className="text-dark-400 max-w-md mx-auto">
          I'm your context-aware AI assistant, powered by the 11-layer Context Window Architecture. 
          I can help you with questions, analyze documents, and provide insights based on sophisticated context understanding.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-left">
          <h4 className="font-medium text-primary-400 mb-2">📚 Multi-Modal Processing</h4>
          <p className="text-sm text-dark-300">
            Upload documents, images, videos, or audio files. I'll process them through the multi-modal pipeline and integrate the content into our conversation.
          </p>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-left">
          <h4 className="font-medium text-primary-400 mb-2">🧠 Context Engineering</h4>
          <p className="text-sm text-dark-300">
            Ask me about the 11-layer architecture, memory systems, or how context engineering transforms AI interactions.
          </p>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-left">
          <h4 className="font-medium text-primary-400 mb-2">💡 Intelligent Responses</h4>
          <p className="text-sm text-dark-300">
            I provide contextually relevant responses by understanding your intent, maintaining conversation history, and leveraging domain expertise.
          </p>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-left">
          <h4 className="font-medium text-primary-400 mb-2">🔄 Memory Systems</h4>
          <p className="text-sm text-dark-300">
            I maintain short-term conversation context, medium-term session memory, and long-term semantic understanding across interactions.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-dark-500">
          Start by asking me a question or uploading a file to begin our context-aware conversation.
        </p>
      </div>
    </div>
  );
}