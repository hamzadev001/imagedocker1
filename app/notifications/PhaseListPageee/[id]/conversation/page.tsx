"use client";

import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
}

export default function ConversationPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`http://hamzaepicness.atwebpages.com/fetch_messages.php?etablissement=${params.id}`);
      if (!response.ok) throw new Error("Failed to load messages");
      
      const data = await response.json();
      setMessages(data);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to load messages");
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "User",
      timestamp: new Date().toLocaleTimeString(),
      isUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    try {
      // Simulate API call - replace with actual API endpoint
      await fetch("http://hamzaepicness.atwebpages.com/send_message.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etablissement: params.id,
          message: newMessage,
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col items-center justify-center h-64 bg-white/90 rounded-xl p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">{error}</p>
          <Link href={`/notifications/PhaseListPageee/${params.id}`} className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Conversation">
      <div className="relative min-h-screen">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10"></div>

        {/* Content */}
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="p-4">
            <Link
              href={`/notifications/PhaseListPageee/${params.id}`}
              className="flex items-center gap-2 text-white hover:text-teal-300 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Details</span>
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl p-4 ${
                    message.isUser
                      ? "bg-teal-600 text-white"
                      : "bg-white/80 text-gray-800"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">{message.sender}</p>
                  <p>{message.text}</p>
                  <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 bg-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={sendMessage}
                className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 