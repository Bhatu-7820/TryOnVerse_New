import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';

export default function AIAssistant() {
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your TryOnVerse styling assistant. Ask me about finding your size, virtual try-ons, custom tailoring, or new arrivals."
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || typing) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTyping(true);

    setTimeout(() => {
      let reply = "You can explore our Size Assistant to find recommended sizes based on your height and measurements, or check our Size Chart on any product page.";
      const lower = userText.toLowerCase();

      if (lower.includes('3d') || lower.includes('try') || lower.includes('virtual')) {
        reply = "You can launch our 3D Virtual Fitting Room from any product card or by visiting /try-on to preview fabric draping, size silhouettes, and colors in real-time.";
      } else if (lower.includes('size') || lower.includes('scan') || lower.includes('fit') || lower.includes('measure')) {
        reply = "Use our Size Assistant at /body-scan to calibrate your measurements and save a size profile to your account for accurate fit recommendations.";
      } else if (lower.includes('auction') || lower.includes('bid')) {
        reply = "Check out our Fashion Runway Auctions at /auctions to discover limited-edition drops and place live bids.";
      } else if (lower.includes('design') || lower.includes('custom') || lower.includes('tailor')) {
        reply = "Visit our Custom Studio at /designer to pick a silhouette, apply colors and typography, and request tailor production.";
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
      setTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="mb-3 flex h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-[#EAEAEC] bg-white shadow-xl sm:mb-4 sm:w-96 text-[#111111]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EAEAEC] bg-[#111111] p-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                  <FiMessageSquare className="text-xs" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-none">Fit & Style Concierge</h3>
                  <p className="text-[10px] text-gray-300 mt-0.5">Shopping, Sizing & Try-On Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-300 hover:text-white transition"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#FAFAFA]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#111111] text-white'
                        : 'bg-white text-[#111111] border border-[#EAEAEC] shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded bg-white px-3 py-2 text-[#7E818C] border border-[#EAEAEC] text-[11px]">
                    Checking styling guide...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#EAEAEC] bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about size, try-on, or custom looks..."
                className="flex-1 rounded border border-[#EAEAEC] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded bg-[#111111] text-white hover:bg-black disabled:opacity-40 transition"
              >
                <FiSend className="text-xs" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-white shadow-md hover:bg-black transition"
          title="Fit & Style Concierge"
        >
          <FiMessageSquare className="text-lg" />
        </button>
      )}
    </div>
  );
}
