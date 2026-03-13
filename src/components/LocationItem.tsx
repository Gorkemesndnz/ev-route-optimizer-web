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
  onRemove,
  rightAction,
  isOverlay 
}) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isOverlay ? 100 : (isDragging ? 50 : 1),
  };

  const Icon = isFirst ? (
    <MapPin size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
  ) : isLast ? (
    <MapPin size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
  ) : (
    <div className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-all border border-white/10" />
  );

  if (isOverlay) {
    return (
      <div 
        style={style}
        className="flex flex-row items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 pr-5 shadow-2xl cursor-grabbing scale-105"
      >
        <div className="text-white/40 p-2.5">
          <GripVertical size={20} />
        </div>
        <div className="relative flex-1 py-3.5 flex items-center gap-3">
          {Icon}
          <span className="text-sm font-semibold text-white/90 truncate max-w-[200px]">
            {item.value || placeholder}
          </span>
        </div>
        <div className="w-8 shrink-0" />
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group flex flex-row items-center gap-2 transition-all duration-300",
        isDragging ? "opacity-20 translate-x-2" : "opacity-100"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="text-white/10 hover:text-white/40 cursor-grab active:cursor-grabbing p-2.5 rounded-xl transition-all hover:bg-white/5 shrink-0"
      >
        <GripVertical size={20} />
      </button>

      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
          {Icon}
        </div>
        <input
          type="text"
          readOnly
          value={item.value}
          onClick={(e) => {
            e.stopPropagation();
            onClickInput(item);
          }}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[15px] text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-medium cursor-pointer hover:bg-white/[0.08] hover:border-white/20"
        />
      </div>

      <div className="w-8 shrink-0 flex items-center justify-center">
        {rightAction}
      </div>
    </motion.div>
  );
}
