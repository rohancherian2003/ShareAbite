import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm ShareAbite AI. How can I help you today?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const faqs = [
    {
      q: "How do I donate food?",
      a: "Login as a Donor, register your restaurant, and click 'Add Donation' to list your food.",
    },
    {
      q: "How do I receive food?",
      a: "Login as a Receiver, browse available donations, and click 'Request Pickup'.",
    },
    {
      q: "Who can see my donation?",
      a: "All registered Receivers can see your available donations.",
    },
    {
      q: "What is ShareAbite?",
      a: "ShareAbite is a platform dedicated to reducing food waste by connecting donors with those in need.",
    },
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Simple FAQ matching
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const match = faqs.find((f) => {
        if (lowerText === f.q.toLowerCase()) return true;
        if (f.q.toLowerCase().includes("donate") && lowerText.includes("donate")) return true;
        if (f.q.toLowerCase().includes("receive") && lowerText.includes("receive")) return true;
        if (f.q.toLowerCase().includes("see") && lowerText.includes("see")) return true;
        if (f.q.toLowerCase().includes("what is") && (lowerText.includes("what is") || lowerText.includes("shareabite"))) return true;
        return false;
      });
      const botResponse = {
        id: Date.now() + 1,
        text: match
          ? match.a
          : "I'm not sure about that. Try asking about donating, receiving, or what ShareAbite is!",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 max-h-[70vh] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-black p-4 text-white flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">ShareAbite AI</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-[10px] opacity-70">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 min-h-0 p-4 h-96 overflow-y-scroll space-y-4 bg-gray-50 chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-black text-white rounded-tr-none shadow-md"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQs Quick Select */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
            {faqs.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(faq.q)}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[11px] font-medium text-gray-600 transition-colors"
              >
                {faq.q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-4 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
