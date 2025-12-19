
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { processQuery, ChatMessage } from "@/lib/chatService";

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            text: "Hello! I'm Zeniee, your inventory assistant. Ask me about stock, expiries, or shipments.",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");

        // Simulate bot delay
        setTimeout(() => {
            const responseText = processQuery(userMsg.text);
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 600);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-105",
                    isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-24 right-6 w-[350px] md:w-[400px] bg-background border border-border shadow-xl rounded-2xl overflow-hidden z-50 transition-all duration-300 origin-bottom-right flex flex-col",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                )}
                style={{ height: "500px", maxHeight: "80vh" }}
            >
                {/* Header */}
                <div className="bg-primary p-4 flex items-center justify-between shrink-0 text-primary-foreground">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Ask Zeniee</h3>
                            <p className="text-[10px] opacity-80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white">
                        <Minimize2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2 max-w-[85%]",
                                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                    msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                                )}
                            >
                                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                            </div>

                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line",
                                    msg.sender === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-card text-foreground border rounded-tl-sm"
                                )}
                            >
                                {msg.text}
                                <div className={cn(
                                    "text-[9px] mt-1 text-right opacity-70",
                                    msg.sender === "user" ? "text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-background border-t shrink-0">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2"
                    >
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about stock, expiry..."
                            className="flex-1 rounded-full bg-muted/50 border-transparent focus:border-primary focus:bg-background"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full shrink-0"
                            disabled={!inputValue.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};
