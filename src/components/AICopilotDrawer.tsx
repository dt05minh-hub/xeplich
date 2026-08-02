import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, User, MessageSquare, ChevronDown, Minimize2 } from 'lucide-react';
import { requestAICopilotReply } from '../lib/aiClient';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  stateContext: any;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  stateContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ Lý AI Lập Lịch Thích Ứng. Bạn cần tư vấn sắp xếp lịch học, ca CSKH hay tối ưu thời gian hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const reply = await requestAICopilotReply({
        message: textToSend.trim(),
        stateContext
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: err?.message || 'Không thể kết nối máy chủ AI. Vui lòng kiểm tra lại cấu hình Gemini API Key trong phần Cài đặt.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Gợi ý lịch học tối nay',
    'Cân bằng ca CSKH & Đồ án',
    'Phân tích khung giờ năng lượng'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Popup Window */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] h-[520px] max-h-[80vh] bg-white rounded-3xl border border-indigo-100 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white">Trợ Lý AI Co-Pilot</h3>
                <span className="text-[10px] text-emerald-300 font-medium flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Đang trực tuyến (Gemini)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Thu nhỏ chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-indigo-600 text-xs italic bg-indigo-50 border border-indigo-100 p-2.5 rounded-2xl w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI đang phân tích & trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Input */}
          <div className="p-3.5 border-t border-slate-200 space-y-2.5 bg-white shrink-0">
            <div className="flex overflow-x-auto space-x-1.5 pb-1 scrollbar-none">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-xl text-[10px] text-slate-700 font-medium shrink-0 transition-all active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => {
          if (isOpen) {
            onClose();
          } else if (onOpen) {
            onOpen();
          }
        }}
        className={`group relative flex items-center justify-center rounded-full p-3.5 text-white shadow-xl transition-all duration-300 active:scale-90 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-900 rotate-90 scale-95'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:scale-110 hover:shadow-indigo-500/40'
        }`}
        title={isOpen ? 'Đóng AI Chat' : 'Trợ Lý AI Co-Pilot'}
      >
        {/* Glow / Pulse Animation behind button when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-white" />
            <span className="hidden sm:inline font-bold text-xs pr-1">Hỏi AI</span>
          </div>
        )}

        {/* Unread / Online badge */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </button>

    </div>
  );
};

