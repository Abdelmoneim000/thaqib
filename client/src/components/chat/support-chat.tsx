import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Headphones } from "lucide-react";

interface SupportMessage {
    id: string;
    content: string;
    senderId: string;
    senderRole: string;
    createdAt: string;
}

export function SupportChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);

    // Get or create support conversation
    const { data: conversation, isLoading: isLoadingConversation } = useQuery({
        queryKey: ["/api/conversations/support"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/conversations/support", { credentials: "include" });
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("Failed to fetch support conversation");
                const data = await res.json();
                setConversationId(data.id);
                return data;
            } catch {
                return null;
            }
        },
        enabled: isOpen && !!user,
    });

    // Fetch messages if conversation exists
    const { data: messages, isLoading: isLoadingMessages } = useQuery<SupportMessage[]>({
        queryKey: [`/api/conversations/${conversationId}/messages`],
        enabled: !!conversationId && isOpen,
        refetchInterval: isOpen ? 3000 : false,
    });

    const sendMutation = useMutation({
        mutationFn: async (content: string) => {
            // Create conversation if it doesn't exist
            if (!conversationId) {
                const res = await apiRequest("POST", "/api/conversations", {
                    otherUserId: "admin",
                    isAdminChat: true,
                });
                const conv = await res.json();
                setConversationId(conv.id);

                // Send message to new conversation
                await apiRequest("POST", `/api/conversations/${conv.id}/messages`, { content });
            } else {
                await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
            }
        },
        onSuccess: () => {
            setMessage("");
            if (conversationId) {
                queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
            }
        },
    });

    const handleSend = () => {
        if (!message.trim()) return;
        sendMutation.mutate(message.trim());
    };

    if (!user || user.role === "admin") return null;

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                    data-testid="support-chat-toggle"
                >
                    <Headphones className="h-6 w-6" />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96">
                    <Card className="shadow-2xl border-2">
                        <CardHeader className="p-4 pb-2 bg-blue-600 text-white rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Headphones className="h-5 w-5" />
                                    <CardTitle className="text-base text-white">Platform Support</CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-blue-100">Chat with our admin team</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Messages area */}
                            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {isLoadingMessages || isLoadingConversation ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : !messages || messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Send a message to start a conversation with our support team.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.senderId === user?.id
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white border text-foreground"
                                                    }`}
                                            >
                                                {msg.senderRole === "admin" && msg.senderId !== user?.id && (
                                                    <p className="text-xs font-medium mb-1 opacity-70">Admin</p>
                                                )}
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    className="text-sm"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!message.trim() || sendMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 shrink-0"
                                >
                                    {sendMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
