'use client';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Brand Section */}
          <div className="flex flex-col">
            <span className="text-sm text-dark-300 font-serif">
              Dr. Mohamed El Fadil
            </span>
            <span className="text-xl font-bold font-serif bg-gradient-to-r from-primary-400 to-blue-500 bg-clip-text text-transparent">
              BrainSAIT
            </span>
          </div>
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold font-serif bg-gradient-to-r from-primary-400 to-blue-500 bg-clip-text text-transparent">
              ContextLinc
            </h1>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-dark-300">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}