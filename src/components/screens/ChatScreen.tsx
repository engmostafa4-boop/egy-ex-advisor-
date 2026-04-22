import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, Info } from 'lucide-react';
import { askGemini } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = Date.now().toString() + Math.random().toString();
    const newMsg: Message = { id: userMsgId, role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    const response = await askGemini(text);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      role: 'assistant',
      content: response
    }]);
    setIsLoading(false);
  };

  const suggestedPrompts = [
    "تحليل سهم التجاري الدولي (COMI)",
    "أفضل أسهم التوزيعات النقدية في مصر",
    "ما هو مؤشر EGX30؟",
    "أخبار السوق اليوم"
  ];

  return (
    <div className="flex flex-col h-full relative">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center bg-gradient-to-b from-slate-800/20 to-transparent relative p-8">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500"></div>
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 animate-pulse relative z-10">
            <TrendingUp className="text-emerald-400 w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2 relative z-10">أهلاً بك في المستشار الذكي EGX</h2>
          <p className="text-slate-400 max-w-md text-sm mb-12 relative z-10">مساعدك الذكي لتحليل الأسهم المصرية وفهم حركة السوق بناءً على أحدث التقنيات.</p>

          <div className="w-full max-w-lg space-y-3 mb-12 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="bg-slate-800/60 hover:bg-slate-700 p-3 rounded-2xl border border-slate-700 text-xs transition-all text-slate-300 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 space-y-6 pt-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[90%]",
                  msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-md",
                  msg.role === 'user' 
                    ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30" 
                    : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={cn(
                  "p-3.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700/80" 
                    : "bg-slate-800/50 text-slate-300 rounded-tl-none border border-slate-700/50 whitespace-pre-wrap"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                key="loading-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 max-w-[90%] ml-auto"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/50 border border-slate-700/50 flex space-x-1.5 space-x-reverse h-10 items-center">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-4" />
          </AnimatePresence>
          
          {messages.length > 0 && <div className="h-searchbox"></div>}
        </div>
      )}

      {/* Input Box */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-6 mt-4 relative z-10 animate-in slide-in-from-bottom-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[1.25rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
          <div className="relative bg-slate-900 border border-slate-700/80 focus-within:border-emerald-500/50 rounded-2xl flex items-center p-2 shadow-2xl transition-colors">
            <input
              type="text"
              dir="rtl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="اسأل عن أي سهم مصري..."
              className="bg-transparent flex-1 px-4 text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm h-12"
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-lg shadow-emerald-500/30"
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-3 pt-1 flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          مخرجات الذكاء الاصطناعي قد تحتوي على أخطاء. الرجاء التحقق منها.
        </p>
      </div>
    </div>
  );
}
