import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MapPin, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LocationItem({
  id,
  item,
  placeholder,
  isFirst,
  isLast,
  onClickInput,
  rightAction,
  isOverlay = false
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: isOverlay });

  const style = !isOverlay ? {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 9999 : 1,
    position: 'relative' as const,
  } : {
    zIndex: 99999,
    position: 'relative' as const,
  };

  const Icon = isFirst ? (
    <MapPin size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
  ) : isLast ? (
    <MapPin size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
  ) : (
    <div className="w-2.5 h-2.5 rounded-full bg-white/70 group-hover:bg-white/90 transition-all border border-white/20 shadow-sm" />
  );

  const containerClasses = cn(
    "w-full group flex flex-row items-center gap-0 transition-colors duration-200 p-0.5 border rounded-3xl",
    isOverlay
      ? "shadow-2xl border-white/40 cursor-grabbing bg-black/40 backdrop-blur-xl"
      : isDragging 
        ? "opacity-0 invisible pointer-events-none" 
        : "border-transparent bg-transparent"
  );

  if (isOverlay) {
    return (
      <div
        className={cn(
          "w-full flex flex-row items-center gap-0 p-0.5 border border-white/40 rounded-3xl bg-black/60 backdrop-blur-xl shadow-2xl cursor-grabbing scale-[1.02] transition-transform",
        )}
        style={{ zIndex: 999999 }}
      >
        <div className="text-white/70 p-0 pl-1 shrink-0">
          <GripVertical size={18} />
        </div>
        <div className="relative flex-1">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
            {Icon}
          </div>
          <input
            type="text"
            readOnly
            value={item.value}
            placeholder={placeholder}
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-2 pl-9 pr-4 text-[15px] text-white transition-all font-medium cursor-grabbing"
          />
        </div>
        <div className="w-10 shrink-0" />
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "w-full group flex flex-row items-center gap-0 p-0.5 border rounded-3xl transition-colors duration-200",
        isDragging ? "opacity-0 pointer-events-none" : "border-transparent bg-transparent"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="text-white/70 hover:text-white px-2 py-3 -ml-1 rounded-xl transition-all shrink-0 cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center"
      >
        <GripVertical size={18} />
      </button>

      <div className="relative flex-1">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
          {Icon}
        </div>
        <input
          type="text"
          readOnly
          value={item.value}
          onClick={(e) => {
            e.stopPropagation();
            onClickInput?.(item);
          }}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-9 pr-4 text-[15px] text-white placeholder-white/70 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-medium cursor-pointer hover:bg-white/[0.08] hover:border-white/20"
        />
      </div>

      <div className="w-10 shrink-0 flex items-center justify-center">
        {rightAction}
      </div>
    </div>
  );
}
