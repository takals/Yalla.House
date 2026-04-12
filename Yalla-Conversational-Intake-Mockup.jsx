import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Pencil, Check, X, ChevronRight, Home, User, MapPin, Bed, Bath, Ruler, PoundSterling, Clock, FileText, Sparkles } from "lucide-react";

// ─── Conversation Flow Definition ─────────────────────────────────────────
const QUESTIONS = [
  {
    id: "greeting",
    field: null,
    text: "Hey! I'm Yalla — your property assistant. I'll help you create a brief that gets agents competing for your business. Ready to get started?",
    type: "confirm",
  },
  {
    id: "address",
    field: "address",
    text: "Great! Let's start simple — what's the address of the property you're selling?",
    type: "text",
    icon: MapPin,
    label: "Address",
  },
  {
    id: "type",
    field: "propertyType",
    text: "Got it. And what type of property is it?",
    type: "choice",
    options: ["House", "Flat", "Apartment", "Villa", "Commercial", "Land"],
    icon: Home,
    label: "Property Type",
  },
  {
    id: "bedrooms",
    field: "bedrooms",
    text: "How many bedrooms?",
    type: "choice",
    options: ["Studio", "1", "2", "3", "4", "5+"],
    icon: Bed,
    label: "Bedrooms",
  },
  {
    id: "bathrooms",
    field: "bathrooms",
    text: "And bathrooms?",
    type: "choice",
    options: ["1", "2", "3", "4+"],
    icon: Bath,
    label: "Bathrooms",
  },
  {
    id: "size",
    field: "size",
    text: "Do you know the approximate size? Even a rough estimate helps agents price accurately.",
    type: "text",
    placeholder: "e.g. 85 sqm, 900 sqft",
    icon: Ruler,
    label: "Size",
  },
  {
    id: "price",
    field: "price",
    text: "What are you hoping to get for it? Don't worry — this is a guide price, not a commitment.",
    type: "text",
    placeholder: "e.g. £450,000",
    icon: PoundSterling,
    label: "Guide Price",
  },
  {
    id: "description",
    field: "description",
    text: "Now the fun part. Tell me about the property — what makes it special? Think about what made you fall in love with it.",
    type: "textarea",
    placeholder: "Victorian terrace with original features, south-facing garden...",
    icon: FileText,
    label: "Description",
  },
  {
    id: "situation",
    field: "sellerSituation",
    text: "This helps agents tailor their approach — what's your situation? Are you in a rush, or is this more of a 'when the right offer comes' situation?",
    type: "text",
    placeholder: "e.g. Relocating for work, need to move by September",
    icon: Clock,
    label: "Seller Situation",
  },
  {
    id: "timeline",
    field: "timeline",
    text: "And roughly, when would you like to complete by?",
    type: "choice",
    options: ["ASAP", "1-3 months", "3-6 months", "6-12 months", "Flexible"],
    icon: Clock,
    label: "Timeline",
  },
  {
    id: "complete",
    field: null,
    text: null, // dynamically generated
    type: "complete",
  },
];

// ─── Avatar Component ─────────────────────────────────────────────────────
function Avatar({ speaking }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500 ${
          speaking
            ? "bg-gradient-to-br from-[#D4764E] to-[#BF6840] shadow-lg shadow-[#D4764E]/30 scale-110"
            : "bg-gradient-to-br from-[#D4764E] to-[#A85A36]"
        }`}
      >
        Y
      </div>
      {speaking && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#D4764E] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4764E]" />
        </div>
      )}
    </div>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────
function ChatBubble({ message, isUser, isTyping }) {
  if (isTyping) {
    return (
      <div className="flex gap-3 items-start">
        <Avatar speaking={true} />
        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-sm border border-[#E2E4EB]">
          <div className="flex gap-1.5 items-center h-5">
            <div className="w-2 h-2 bg-[#D4764E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-[#D4764E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-[#D4764E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#0F1117] text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
          <p className="text-[0.9375rem] leading-relaxed">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <Avatar speaking={false} />
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-sm border border-[#E2E4EB]">
        <p className="text-[0.9375rem] leading-relaxed text-[#0F1117]">{message}</p>
      </div>
    </div>
  );
}

// ─── Brief Panel Field ────────────────────────────────────────────────────
function BriefField({ icon: Icon, label, value, onEdit, highlight }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!value) return null;

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-500 ${
        highlight ? "bg-[#FFF5EE] border border-[#D4764E]/20 scale-[1.02]" : "hover:bg-[#F5F5F7] border border-transparent"
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 transition-colors duration-500 ${highlight ? "text-[#D4764E]" : "text-[#999]"}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#999] mb-0.5">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 text-sm text-[#0F1117] border border-[#D4764E] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#D4764E]/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEdit(editValue);
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <button onClick={() => { onEdit(editValue); setEditing(false); }} className="text-[#22C55E] hover:text-[#16A34A]">
              <Check size={16} />
            </button>
            <button onClick={() => setEditing(false)} className="text-[#999] hover:text-[#666]">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#0F1117] leading-snug">{value}</p>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#999] hover:text-[#D4764E]"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function ConversationalIntake() {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [briefData, setBriefData] = useState({});
  const [highlightField, setHighlightField] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Show first message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages([{ text: QUESTIONS[0].text, isUser: false }]);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Focus input after bot message
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  const currentQuestion = QUESTIONS[currentStep];

  function advanceConversation(userAnswer) {
    const q = QUESTIONS[currentStep];

    // Add user message
    const newMessages = [...messages, { text: userAnswer, isUser: true }];
    setMessages(newMessages);
    setInputValue("");

    // Update brief data
    if (q.field) {
      setBriefData((prev) => ({ ...prev, [q.field]: userAnswer }));
      setHighlightField(q.field);
      setTimeout(() => setHighlightField(null), 2000);
    }

    // Move to next step
    const nextStep = currentStep + 1;
    if (nextStep < QUESTIONS.length) {
      setCurrentStep(nextStep);
      setIsTyping(true);

      const delay = 800 + Math.random() * 800;
      setTimeout(() => {
        setIsTyping(false);
        const nextQ = QUESTIONS[nextStep];

        let botText;
        if (nextQ.type === "complete") {
          botText = `Looking good! Here's your Owner Brief — I've sent it to the panel on the right. You can click the pencil icon on any field to fine-tune it. When you're happy, hit "Send to Agents" and we'll find agents in your area.`;
        } else {
          botText = nextQ.text;
        }

        setMessages((prev) => [...prev, { text: botText, isUser: false }]);
      }, delay);
    }
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    advanceConversation(inputValue.trim());
  }

  function handleChoice(choice) {
    if (isTyping) return;
    advanceConversation(choice);
  }

  function handleConfirm() {
    if (isTyping) return;
    setStarted(true);
    advanceConversation("Let's do it!");
  }

  function toggleVoice() {
    setIsListening(!isListening);
    // In production: hook into Web Speech API here
  }

  function handleBriefEdit(field, value) {
    setBriefData((prev) => ({ ...prev, [field]: value }));
  }

  // Brief completion percentage
  const totalFields = QUESTIONS.filter((q) => q.field).length;
  const filledFields = Object.values(briefData).filter(Boolean).length;
  const completion = Math.round((filledFields / totalFields) * 100);

  // Brief fields config
  const briefFields = QUESTIONS.filter((q) => q.field).map((q) => ({
    field: q.field,
    label: q.label,
    icon: q.icon,
  }));

  return (
    <div className="flex h-screen bg-[#EDEEF2]" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* ─── Left: Conversation ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ maxWidth: "56%" }}>
        {/* Header */}
        <div className="h-16 bg-white border-b border-[#E2E4EB] flex items-center px-6 gap-3 flex-shrink-0">
          <Avatar speaking={isTyping} />
          <div>
            <p className="text-sm font-bold text-[#0F1117]">Yalla</p>
            <p className="text-[0.6875rem] text-[#999]">
              {isTyping ? "Typing..." : "Your property assistant"}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[0.6875rem] text-[#999]">
            <Sparkles size={12} className="text-[#D4764E]" />
            <span>AI-powered intake</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg.text} isUser={msg.isUser} />
          ))}
          {isTyping && <ChatBubble isTyping />}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#E2E4EB]">
          {/* Greeting confirm */}
          {currentStep === 0 && !started && !isTyping && (
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-[#D4764E] text-white font-bold rounded-xl hover:bg-[#BF6840] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4764E]/20"
              >
                Let's get started
                <ChevronRight size={16} className="inline ml-1 -mt-0.5" />
              </button>
            </div>
          )}

          {/* Choice buttons */}
          {currentQuestion?.type === "choice" && !isTyping && started && (
            <div className="flex flex-wrap gap-2 mb-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  className="px-4 py-2.5 bg-[#F5F5F7] text-[#0F1117] text-sm font-semibold rounded-xl border border-[#E2E4EB] hover:border-[#D4764E] hover:bg-[#FFF5EE] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Text/Textarea input */}
          {(currentQuestion?.type === "text" || currentQuestion?.type === "textarea") && !isTyping && started && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                {currentQuestion.type === "textarea" ? (
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder || "Type your answer..."}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl border border-[#E2E4EB] text-sm text-[#0F1117] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]/20 focus:border-[#D4764E] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder || "Type your answer..."}
                    className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl border border-[#E2E4EB] text-sm text-[#0F1117] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]/20 focus:border-[#D4764E]"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? "bg-[#D4764E] text-white shadow-lg shadow-[#D4764E]/30 animate-pulse"
                      : "bg-[#F5F5F7] text-[#999] hover:text-[#0F1117] border border-[#E2E4EB]"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-3 bg-[#0F1117] text-white rounded-xl hover:bg-[#2a2a2a] transition-all disabled:opacity-30 disabled:hover:bg-[#0F1117]"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Complete state */}
          {currentQuestion?.type === "complete" && !isTyping && (
            <div className="flex justify-center">
              <button className="px-8 py-3.5 bg-[#D4764E] text-white font-bold rounded-xl hover:bg-[#BF6840] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4764E]/20 flex items-center gap-2">
                <Send size={16} />
                Send to Agents in My Area
              </button>
            </div>
          )}

          {/* Voice indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-3 text-[0.75rem] text-[#D4764E] font-semibold">
              <div className="flex gap-0.5 items-end h-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#D4764E] rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 12}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "0.6s",
                    }}
                  />
                ))}
              </div>
              Listening... speak naturally
            </div>
          )}
        </div>
      </div>

      {/* ─── Right: Brief Panel ──────────────────────────────── */}
      <div className="w-[44%] bg-white border-l border-[#E2E4EB] flex flex-col">
        {/* Panel Header */}
        <div className="h-16 border-b border-[#E2E4EB] flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-[#0F1117]">Owner Brief</p>
            <p className="text-[0.6875rem] text-[#999]">Building in real time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4764E] to-[#BF6840] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-[0.6875rem] font-bold text-[#D4764E]">{completion}%</span>
          </div>
        </div>

        {/* Brief Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filledFields === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF5EE] flex items-center justify-center mb-4">
                <FileText size={28} className="text-[#D4764E]" />
              </div>
              <p className="text-sm font-semibold text-[#0F1117] mb-1">Your brief will appear here</p>
              <p className="text-[0.8125rem] text-[#999] leading-relaxed">
                As you answer questions, your Owner Brief builds itself in real time. You can click the pencil icon on any field to edit.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {briefFields.map(({ field, label, icon }) =>
                briefData[field] ? (
                  <BriefField
                    key={field}
                    icon={icon}
                    label={label}
                    value={briefData[field]}
                    onEdit={(val) => handleBriefEdit(field, val)}
                    highlight={highlightField === field}
                  />
                ) : null
              )}

              {/* Agent matching preview */}
              {briefData.address && filledFields >= 3 && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#FFF5EE] to-[#FFEEE4] border border-[#D4764E]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#D4764E]" />
                    <p className="text-[0.75rem] font-bold text-[#D4764E]">Agent Preview</p>
                  </div>
                  <p className="text-[0.8125rem] text-[#8B4513] leading-relaxed">
                    Based on your postcode, we've found <strong>7 verified agents</strong> covering your area. Once your brief is complete, they'll compete with proposals.
                  </p>
                </div>
              )}

              {/* Learning indicator */}
              {filledFields >= 5 && (
                <div className="mt-4 p-3 rounded-xl bg-[#F5F5F7] border border-[#E2E4EB]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-[#999]" />
                    <p className="text-[0.6875rem] text-[#999]">
                      <span className="font-semibold">Yalla learns:</span> Next time you list, we'll pre-fill what we already know about you.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Footer */}
        {filledFields > 0 && (
          <div className="p-4 border-t border-[#E2E4EB] bg-[#FAFAFA]">
            <div className="flex items-center justify-between text-[0.75rem] text-[#999]">
              <span>{filledFields} of {totalFields} fields completed</span>
              <span className="flex items-center gap-1">
                <Pencil size={10} />
                Click any field to edit
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
