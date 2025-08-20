'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Key, BarChart3, Trash2, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  invitation_code: string;
  created_at: string;
  last_login: string | null;
  failed_attempts: number;
  locked_until: string | null;
  stay_logged_in: boolean;
}

interface InvitationCode {
  id: string;
  code: string;
  created_at: string;
  used_by: string | null;
  used_by_username: string | null;
  used_at: string | null;
  is_active: boolean;
}

interface ChatStats {
  totalSessions: number;
  totalMessages: number;
  activeUsers: number;
}

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [chatStats, setChatStats] = useState<ChatStats>({ totalSessions: 0, totalMessages: 0, activeUsers: 0 });
  const [newInvitationCode, setNewInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const authenticateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
  const response = await fetch(`/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passcode: adminPasscode })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast.success('Admin access granted');
        fetchAllData();
      } else {
        toast.error('Invalid admin passcode');
      }
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchInvitationCodes(),
      fetchChatStats()
    ]);
  };

  const fetchUsers = async () => {
    try {
  const response = await fetch(`/api/admin/users`, {
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchInvitationCodes = async () => {
    try {
  const response = await fetch(`/api/admin/invitation-codes`, {
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitationCodes(data);
      }
    } catch (error) {
      console.error('Error fetching invitation codes:', error);
    }
  };

  const fetchChatStats = async () => {
    try {
  const response = await fetch(`/api/admin/chat-stats`, {
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatStats(data);
      }
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  const createInvitationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newInvitationCode.length !== 15) {
      toast.error('Invitation code must be exactly 15 characters');
      return;
    }

    try {
  const response = await fetch(`/api/admin/invitation-codes`, {
        method: 'POST',
        headers: {
          'X-Admin-Passcode': adminPasscode,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: newInvitationCode })
      });

      if (response.ok) {
        setNewInvitationCode('');
        await fetchInvitationCodes();
        toast.success('Invitation code created');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create invitation code');
      }
    } catch (error) {
      toast.error('Failed to create invitation code');
    }
  };

  const toggleInvitationCode = async (id: string, isActive: boolean) => {
    try {
  const response = await fetch(`/api/admin/invitation-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'X-Admin-Passcode': adminPasscode,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        await fetchInvitationCodes();
        toast.success(isActive ? 'Code deactivated' : 'Code activated');
      }
    } catch (error) {
      toast.error('Failed to update invitation code');
    }
  };

  const unlockUser = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/unlock`, {
        method: 'POST',
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        await fetchUsers();
        toast.success('User account unlocked');
      }
    } catch (error) {
      toast.error('Failed to unlock user');
    }
  };

  const deleteUserChats = async (userId: string) => {
    if (!confirm('Are you sure you want to delete all chats for this user?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/chats`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        await fetchChatStats();
        toast.success('User chats deleted');
      }
    } catch (error) {
      toast.error('Failed to delete user chats');
    }
  };

  const deleteAllChats = async () => {
    if (!confirm('Are you sure you want to delete ALL chat history? This cannot be undone!')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/chats/all`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Passcode': adminPasscode
        }
      });

      if (response.ok) {
        await fetchChatStats();
        toast.success('All chat history deleted');
      }
    } catch (error) {
      toast.error('Failed to delete chat history');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 border-[#722F37]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-[#FF00FF]" />
            </div>
            <CardTitle className="text-xl font-space-mono text-[#FF00FF]">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter the 6-digit admin passcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={authenticateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-passcode" className="text-gray-200">
                  Admin Passcode
                </Label>
                <Input
                  id="admin-passcode"
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  required
                  maxLength={6}
                  className="bg-black/50 border-[#722F37] text-white text-center text-xl tracking-widest"
                  placeholder="••••••"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#003B6F] hover:bg-[#004080]"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-[#FF00FF]" />
          <h1 className="text-3xl font-bold font-space-mono text-white">
            Admin Control Panel
          </h1>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-black/40 border-[#722F37]/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#FF00FF]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-[#722F37]/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Chat Sessions
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-[#003B6F]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{chatStats.totalSessions}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-[#722F37]/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Total Messages
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-[#722F37]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{chatStats.totalMessages}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-black/40 border-[#722F37]/30">
              <CardHeader>
                <CardTitle className="text-white">Registered Users</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage user accounts and security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-200">Username</TableHead>
                      <TableHead className="text-gray-200">Created</TableHead>
                      <TableHead className="text-gray-200">Last Login</TableHead>
                      <TableHead className="text-gray-200">Status</TableHead>
                      <TableHead className="text-gray-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-white font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          {user.locked_until && new Date(user.locked_until) > new Date() ? (
                            <Badge variant="destructive">Locked</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {user.locked_until && new Date(user.locked_until) > new Date() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unlockUser(user.id)}
                                className="text-green-400 border-green-400 hover:bg-green-400/10"
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUserChats(user.id)}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <Card className="bg-black/40 border-[#722F37]/30">
              <CardHeader>
                <CardTitle className="text-white">Create Invitation Code</CardTitle>
                <CardDescription className="text-gray-300">
                  Generate a new 15-digit invitation code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createInvitationCode} className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="new-code" className="text-gray-200">
                        Invitation Code (15 digits)
                      </Label>
                      <Input
                        id="new-code"
                        value={newInvitationCode}
                        onChange={(e) => setNewInvitationCode(e.target.value)}
                        maxLength={15}
                        className="bg-black/50 border-[#722F37] text-white font-mono"
                        placeholder="123456789012345"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="bg-[#003B6F] hover:bg-[#004080] mt-6"
                      disabled={newInvitationCode.length !== 15}
                    >
                      Create Code
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-[#722F37]/30">
              <CardHeader>
                <CardTitle className="text-white">Invitation Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-200">Code</TableHead>
                      <TableHead className="text-gray-200">Created</TableHead>
                      <TableHead className="text-gray-200">Used By</TableHead>
                      <TableHead className="text-gray-200">Status</TableHead>
                      <TableHead className="text-gray-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitationCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="text-white font-mono">
                          {code.code}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(code.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {code.used_by_username || 'Unused'}
                        </TableCell>
                        <TableCell>
                          {!code.is_active ? (
                            <Badge variant="secondary">Inactive</Badge>
                          ) : code.used_by ? (
                            <Badge variant="destructive">Used</Badge>
                          ) : (
                            <Badge variant="default">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={code.is_active}
                            onCheckedChange={() => toggleInvitationCode(code.id, code.is_active)}
                            disabled={!!code.used_by}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <Card className="bg-black/40 border-[#722F37]/30">
              <CardHeader>
                <CardTitle className="text-white">Data Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Dangerous operations - use with caution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-gray-300 mb-4">
                    This action will permanently delete ALL chat history from the system.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={deleteAllChats}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Chat History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}