import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery({
    queryKey: ['/api/chats', sessionId],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/chats/${sessionId}/messages`, { message });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      queryClient.invalidateQueries({ queryKey: ['/api/chats', sessionId] });
      if (data.feedback) {
        toast({
          title: "Coach Feedback",
          description: data.feedback,
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [(session as any)?.messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const messages: Message[] = (session as any)?.messages || [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="chat-interface">
      <div className="bg-gradient-to-r from-primary to-secondary p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white" data-testid="chat-title">
              AI Relationship Coach
            </h3>
            <p className="text-blue-100">Get personalized guidance and practice conversations</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto" data-testid="chat-messages">
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-primary text-sm" />
              </div>
              <div className="bg-slate-50 rounded-lg p-3 max-w-md">
                <p className="text-slate-900">
                  Hi! I'm here to help you practice relationship skills. What would you like to work on today?
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              data-testid={`message-${index}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-primary text-sm" />
                </div>
              )}
              
              <div className={`rounded-lg p-3 max-w-md ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-50 text-slate-900'
              }`}>
                <p>{msg.content}</p>
              </div>
              
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white text-sm" />
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t pt-4">
          <div className="flex space-x-4 mb-3">
            <Input 
              type="text" 
              placeholder="Type your response here..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="chat-input"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="chat-send"
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm"
                  data-testid={`suggestion-${index}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
