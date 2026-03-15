import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  dark?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
  error,
  className,
  dark = true
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 outline-none",
          dark 
            ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
            : "bg-white border-slate-200 text-slate-800 hover:border-cyan-300",
          isOpen && (dark ? "border-cyan-400/50 ring-1 ring-cyan-400/20" : "border-cyan-500 ring-1 ring-cyan-500/20"),
          error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
        )}
      >
        <span className={cn(
          "font-medium transition-colors",
          !selectedOption && (dark ? "text-white/30" : "text-slate-400")
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className={dark ? "text-white/40" : "text-slate-400"} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[100] w-full mt-2 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-3xl",
              dark 
                ? "bg-zinc-900/95 border-white/10 shadow-black/50" 
                : "bg-white/95 border-slate-200 shadow-slate-200/50"
            )}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    value === option.value
                      ? (dark ? "bg-cyan-400 text-zinc-950" : "bg-cyan-500 text-white")
                      : (dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600")
                  )}
                >
                  {option.label}
                  {value === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
