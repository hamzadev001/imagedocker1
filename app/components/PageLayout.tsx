import React from 'react';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="p-6 sm:ml-72">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
} 