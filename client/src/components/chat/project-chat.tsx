import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Message, Conversation } from "@shared/schema";

interface ProjectChatProps {
  projectId: string;
  currentUserId: string;
  currentUserRole: "client" | "analyst";
}

export function ProjectChat({ projectId, currentUserId, currentUserRole }: ProjectChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: loadingConversation } = useQuery<Conversation>({
    queryKey: ["/api/conversations/project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/project/${projectId}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversation?.id, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversation!.id}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
    enabled: !!conversation?.id,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${conversation!.id}/messages`, {
        senderId: currentUserId,
        senderRole: currentUserRole,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversation?.id, "messages"] });
      setNewMessage("");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversation?.id) {
      apiRequest("POST", `/api/conversations/${conversation.id}/read`, {
        userId: currentUserId,
      });
    }
  }, [conversation?.id, currentUserId, messages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !conversation) return;
    sendMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingConversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card className="h-full flex flex-col items-center justify-center" data-testid="card-chat-unavailable">
        <MessageSquare className="h-10 w-10 mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">Chat unavailable</p>
        <p className="text-xs text-muted-foreground">An analyst must be assigned to enable chat</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col" data-testid="card-project-chat">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Project Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                    data-testid={`message-${message.id}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs",
                        message.senderRole === "client" 
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      )}>
                        {message.senderRole === "client" ? "C" : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {new Date(message.createdAt!).toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sendMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMutation.isPending}
              data-testid="button-send-message"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
