'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthStore();

  const [loginData, setLoginData] = useState({
    username: '',
    passcode: '',
    stayLoggedIn: false
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    passcode: '',
    invitationCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginData.username, loginData.passcode, loginData.stayLoggedIn);
      toast.success('Welcome back to ZURDIR!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(registerData.username, registerData.passcode, registerData.invitationCode);
      toast.success('Welcome to ZURDIR! You can now log in.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 border-[#003B6F] backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-space-mono text-[#FF00FF]">
          Access Terminal
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enter your credentials or join the collective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#722F37]/20">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#003B6F] data-[state=active]:text-white"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-[#003B6F] data-[state=active]:text-white"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-gray-200">
                  Username
                </Label>
                <Input
                  id="login-username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-passcode" className="text-gray-200">
                  Passcode
                </Label>
                <Input
                  id="login-passcode"
                  type="password"
                  value={loginData.passcode}
                  onChange={(e) => setLoginData({ ...loginData, passcode: e.target.value })}
                  required
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  placeholder="Enter your passcode"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stay-logged-in"
                  checked={loginData.stayLoggedIn}
                  onCheckedChange={(checked) => 
                    setLoginData({ ...loginData, stayLoggedIn: checked as boolean })
                  }
                  className="border-[#722F37] data-[state=checked]:bg-[#003B6F]"
                />
                <Label htmlFor="stay-logged-in" className="text-sm text-gray-300">
                  Stay logged in (30 days)
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#003B6F] hover:bg-[#004080] text-white font-space-mono transition-all duration-300 hover:shadow-lg hover:shadow-[#003B6F]/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  'Enter ZURDIR'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-gray-200">
                  Username
                </Label>
                <Input
                  id="register-username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  minLength={1}
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-passcode" className="text-gray-200">
                  Passcode
                </Label>
                <Input
                  id="register-passcode"
                  type="password"
                  value={registerData.passcode}
                  onChange={(e) => setRegisterData({ ...registerData, passcode: e.target.value })}
                  required
                  minLength={8}
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  placeholder="Create a passcode (8+ characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation-code" className="text-gray-200">
                  Invitation Code
                </Label>
                <Input
                  id="invitation-code"
                  type="text"
                  value={registerData.invitationCode}
                  onChange={(e) => setRegisterData({ ...registerData, invitationCode: e.target.value })}
                  required
                  maxLength={15}
                  minLength={15}
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  placeholder="Enter your 15-digit invitation code"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#003B6F] hover:bg-[#004080] text-white font-space-mono transition-all duration-300 hover:shadow-lg hover:shadow-[#003B6F]/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  'Join ZURDIR'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}