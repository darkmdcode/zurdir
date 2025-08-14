'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { DashboardHeader } from '@/components/dashboard-header';
import { ChatInterface } from '@/components/chat-interface';
import { Sidebar } from '@/components/sidebar';
import { AdminPanel } from '@/components/admin-panel';
import { FileManager } from '@/components/file-manager';
import { WebSearch } from '@/components/web-search';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type View = 'chat' | 'admin' | 'files' | 'search';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const auth = await checkAuth();
      if (!auth) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF00FF] mx-auto mb-4"></div>
          <p className="text-lg font-space-mono">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatInterface 
            selectedSessionId={selectedSessionId}
            onSessionChange={setSelectedSessionId}
          />
        );
      case 'admin':
        return <AdminPanel />;
      case 'files':
        return <FileManager />;
      case 'search':
        return <WebSearch />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          onSessionSelect={setSelectedSessionId}
        />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}