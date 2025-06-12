import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#f6fef8] overflow-x-hidden">
      {/* SVG decorativo canto superior esquerdo */}
      <svg className="absolute top-0 left-0 w-64 h-64 opacity-20 pointer-events-none z-0" viewBox="0 0 200 200" fill="none">
        <ellipse cx="100" cy="100" rx="100" ry="80" fill="#22c55e" />
        <ellipse cx="60" cy="140" rx="40" ry="20" fill="#2563eb" />
        <ellipse cx="160" cy="40" rx="30" ry="15" fill="#f59e42" />
      </svg>
      {/* SVG decorativo canto inferior direito */}
      <svg className="absolute bottom-0 right-0 w-80 h-80 opacity-10 pointer-events-none z-0" viewBox="0 0 300 300" fill="none">
        <ellipse cx="200" cy="200" rx="100" ry="80" fill="#22c55e" />
        <ellipse cx="240" cy="260" rx="40" ry="20" fill="#2563eb" />
        <ellipse cx="100" cy="100" rx="60" ry="30" fill="#f59e42" />
      </svg>
      <div className="flex flex-col min-h-screen relative z-10">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default BaseLayout;
