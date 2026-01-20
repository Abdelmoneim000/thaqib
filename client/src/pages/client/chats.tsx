import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import ClientLayout from "@/components/client-layout";

function ChatPanel({ 
  conversation, 
  onBack 
}: { 
  conversation: Conversation; 
  onBack: () => void;
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "client-1";

  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversation.id, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`);
      return res.json();
    },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          senderId: currentUserId,
          senderRole: "client",
          content,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversation.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-to-chats">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {(conversation.analystName || "A")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{conversation.analystName || "Analyst"}</p>
          <p className="text-xs text-muted-foreground">Data Analyst</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.senderRole === "client" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${msg.id}`}
              >
                {msg.senderRole === "analyst" && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">A</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.senderRole === "client"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderRole === "client" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {msg.senderRole === "client" && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">C</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            data-testid="input-chat-message"
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || sendMutation.isPending}
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
    </div>
  );
}

function ChatList({ 
  conversations, 
  onSelectChat 
}: { 
  conversations: Conversation[]; 
  onSelectChat: (conv: Conversation) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-medium mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start a conversation with an analyst by clicking "Chat" on their project application
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card 
          key={conv.id} 
          className="cursor-pointer hover-elevate"
          onClick={() => onSelectChat(conv)}
          data-testid={`card-chat-${conv.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(conv.analystName || "A")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{conv.analystName || "Analyst"}</p>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conv.lastMessagePreview && (
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessagePreview}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ClientChatsPage() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations?userId=client-1&role=client`);
      return res.json();
    },
  });

  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <ClientLayout>
      <div className="p-6 h-[calc(100vh-3.5rem)]">
        {selectedChat ? (
          <Card className="h-full">
            <ChatPanel 
              conversation={selectedChat} 
              onBack={() => setSelectedChat(null)} 
            />
          </Card>
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">Chats</h1>
              <p className="text-muted-foreground">Your conversations with data analysts</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChatList 
                conversations={sortedConversations} 
                onSelectChat={setSelectedChat}
              />
            )}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
