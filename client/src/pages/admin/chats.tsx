import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  User
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message, User as UserType } from "@shared/schema";

export default function AdminChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/admin/conversations"],
  });

  const { data: users } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", "/api/admin/conversations", { userId });
      return res.json();
    },
    onSuccess: (conversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conversations"] });
      setSelectedConversation(conversation.id);
      toast({ title: "Conversation created" });
    },
    onError: () => {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
        senderRole: "admin",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      setNewMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({ conversationId: selectedConversation, content: newMessage.trim() });
    }
  };

  const handleStartConversation = () => {
    if (selectedUserId) {
      createConversationMutation.mutate(selectedUserId);
      setSelectedUserId("");
    }
  };

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getUserRole = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user?.role || "unknown";
  };

  const usersWithoutConversation = users?.filter(
    u => u.role !== "admin" && !conversations?.some(c => c.clientId === u.id)
  ) || [];

  return (
    <AdminLayout>
      <div className="p-6 h-[calc(100vh-theme(spacing.14))]">
        <div className="flex gap-6 h-full">
          <Card className="w-80 flex flex-col" data-testid="card-conversations-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Support Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  data-testid="select-user"
                >
                  <option value="">Start new chat...</option>
                  {usersWithoutConversation.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleStartConversation}
                  disabled={!selectedUserId || createConversationMutation.isPending}
                  data-testid="button-start-chat"
                >
                  Start Chat
                </Button>
              </div>

              <ScrollArea className="flex-1">
                {isLoadingConversations ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : conversations?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No support chats yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {conversations?.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded cursor-pointer border ${selectedConversation === conv.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                          }`}
                        onClick={() => setSelectedConversation(conv.id)}
                        data-testid={`conversation-${conv.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {getUserName(conv.clientId)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getUserRole(conv.clientId)}
                          </Badge>
                        </div>
                        {conv.lastMessagePreview && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col" data-testid="card-chat-messages">
            <CardHeader className="border-b">
              <CardTitle>
                {selectedConversation
                  ? `Chat with ${getUserName(conversations?.find(c => c.id === selectedConversation)?.clientId || "")}`
                  : "Select a conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Select a conversation to view messages</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    {isLoadingMessages ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-12 w-3/4" />
                        ))}
                      </div>
                    ) : messages?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${message.senderRole === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {message.senderRole === "admin" ? "Thaqib Help" : getUserName(message.senderId)}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
