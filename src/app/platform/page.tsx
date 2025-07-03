import { ChatInterface } from '@/components/chat/ChatInterface';
import { FileUpload } from '@/components/upload/FileUpload';
import { ContextPanel } from '@/components/context/ContextPanel';
import { Header } from '@/components/layout/Header';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <ChatInterface />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <FileUpload />
            <ContextPanel />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-dark-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-dark-400">
            <p className="mb-2">
              <span className="font-bold bg-gradient-to-r from-primary-400 to-blue-500 bg-clip-text text-transparent">
                ContextLinc
              </span>
              {' '}by{' '}
              <a 
                href="https://brainsait.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                BRAINSAIT LTD
              </a>
            </p>
            <p className="text-sm">
              Next-generation context engineering platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}