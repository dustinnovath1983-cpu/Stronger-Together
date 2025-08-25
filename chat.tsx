import { useContext, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { AuthContext } from "@/App";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatInterface from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user, isLoading } = useContext(AuthContext);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/chat/:id?");
  const { toast } = useToast();

  const { data: sessions } = useQuery({
    queryKey: ['/api/chats'],
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chats', {
        title: `Chat Session ${new Date().toLocaleDateString()}`,
        messages: []
      });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setLocation(`/chat/${session.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create chat session",
      });
    },
  });

  useEffect(() => {
    if (user && !params?.id && sessions && (sessions as any[]).length === 0) {
      // Create first session automatically
      createSessionMutation.mutate();
    }
  }, [user, params?.id, sessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const currentSessionId = params?.id;
  const currentSession = (sessions as any[])?.find((s: any) => s.id === currentSessionId);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="chat-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-testid="sessions-title">Chat Sessions</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => createSessionMutation.mutate()}
                    disabled={createSessionMutation.isPending}
                    data-testid="new-chat-button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(sessions as any[])?.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted" />
                    <p className="text-sm">No chat sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(sessions as any[])?.map((session: any) => (
                      <button
                        key={session.id}
                        onClick={() => setLocation(`/chat/${session.id}`)}
                        className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${
                          currentSessionId === session.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                        }`}
                        data-testid={`session-${session.id}`}
                      >
                        <div className="font-medium text-sm truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {currentSessionId ? (
              <ChatInterface sessionId={currentSessionId} />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
                  <h3 className="text-xl font-semibold mb-2" data-testid="no-session-title">
                    Start a Conversation
                  </h3>
                  <p className="text-muted mb-6">
                    Create a new chat session to begin practicing your relationship skills with our AI coach.
                  </p>
                  <Button 
                    onClick={() => createSessionMutation.mutate()}
                    disabled={createSessionMutation.isPending}
                    data-testid="start-new-chat-button"
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Start New Chat"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
