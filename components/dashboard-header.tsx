'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

interface DashboardHeaderProps {
  user: {
    id: string;
    username: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-[#722F37]/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-space-mono font-bold text-[#FF00FF]">
            ZURDIR
          </h1>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-300">
            Time Vortex Terminal
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border border-[#003B6F]">
              <AvatarFallback className="bg-[#003B6F] text-white text-xs">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-200">{user.username}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-[#722F37]/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
}