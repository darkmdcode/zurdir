'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Shield, 
  FileText, 
  Search, 
  Plus,
  Trash2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
}

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'chat' | 'admin' | 'files' | 'search') => void;
  onSessionSelect: (sessionId: string) => void;
}

export function Sidebar({ currentView, onViewChange, onSessionSelect }: SidebarProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'chat') {
      fetchChatSessions();
    }
  }, [currentView]);

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const newSession = await response.json();
        setChatSessions([newSession, ...chatSessions]);
        onSessionSelect(newSession.id);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setChatSessions(chatSessions.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const navigationItems = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'files', label: 'File Manager', icon: FileText },
    { id: 'search', label: 'Web Search', icon: Search },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
  ];

  return (
    <div className="w-80 bg-black/60 backdrop-blur-sm border-r border-[#722F37]/30 flex flex-col">
      <div className="p-4 border-b border-[#722F37]/30">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-gray-300 hover:text-white hover:bg-[#722F37]/20",
                currentView === item.id && "bg-[#003B6F]/30 text-white"
              )}
              onClick={() => onViewChange(item.id as any)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {currentView === 'chat' && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[#722F37]/30">
            <Button
              onClick={createNewChat}
              className="w-full bg-[#003B6F] hover:bg-[#004080] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">
                  Loading chats...
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No chats yet. Create your first chat!
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group p-3 rounded-lg hover:bg-[#722F37]/10 cursor-pointer border border-transparent hover:border-[#722F37]/30 transition-all"
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {session.message_count} messages
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}