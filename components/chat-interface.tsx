'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Send, Pause, Settings, ChevronDown, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface AIModel {
  name: string;
  size: number;
}

interface ChatInterfaceProps {
  selectedSessionId: string | null;
  onSessionChange: (sessionId: string) => void;
}

export function ChatInterface({ selectedSessionId, onSessionChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [thinkingTime, setThinkingTime] = useState([0]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/ai/models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
        if (data.models?.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch AI models');
    }
  };

  const fetchMessages = async () => {
    if (!selectedSessionId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `/api/ai/sessions/${selectedSessionId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const sessionMessages = await response.json();
        setMessages(sessionMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedSessionId]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedSessionId || !selectedModel || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: selectedSessionId,
          model: selectedModel,
          thinkingTime: thinkingTime[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev.slice(0, -1), tempUserMessage, aiMessage]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to get AI response');
        // Remove the temporary user message on error
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the temporary user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedSessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Brain className="h-16 w-16 mx-auto mb-4 text-[#FF00FF]" />
          <h2 className="text-xl font-space-mono mb-2">Welcome to the AI Terminal</h2>
          <p>Select a chat session or create a new one to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* AI Settings Panel */}
      <Collapsible open={showSettings} onOpenChange={setShowSettings}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="m-4 mb-0 text-gray-300 hover:text-white hover:bg-[#722F37]/20"
          >
            <Settings className="h-4 w-4 mr-2" />
            AI Configuration
            <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", showSettings && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="m-4 bg-black/40 border-[#722F37]/30">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">AI Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-black/50 border-[#722F37] text-white">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#722F37]">
                      {availableModels.map((model) => (
                        <SelectItem key={model.name} value={model.name} className="text-white">
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">
                    Thinking Time: {thinkingTime[0]}s
                  </Label>
                  <Slider
                    value={thinkingTime}
                    onValueChange={setThinkingTime}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">
                    Add delay before AI responds (Take Your Time feature)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === 'user'
                    ? "bg-[#003B6F] text-white"
                    : "bg-[#722F37]/20 text-gray-100 border border-[#722F37]/30"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-60 mt-2">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#722F37]/20 text-gray-100 border border-[#722F37]/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF00FF]"></div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-[#722F37]/30 bg-black/40">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message to the AI..."
            className="flex-1 bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F] resize-none"
            rows={1}
            disabled={isLoading || !selectedModel}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || !selectedModel}
            className="bg-[#003B6F] hover:bg-[#004080] text-white px-6"
          >
            {isLoading ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}