import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MapPin, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// 1. Saf UI Bileşeni (Hiçbir DND hook'u içermez)
export function LocationItemUI({
  item,
  placeholder,
  isFirst,
  isLast,
  onClickInput,
  rightAction,
  isDragging = false,
  dragHandleProps = {}
}) {
  const Icon = isFirst ? (
    <MapPin size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
  ) : isLast ? (
    <MapPin size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
  ) : (
    <div className="w-2.5 h-2.5 rounded-full bg-white/70 group-hover:bg-white/90 transition-all border border-white/20 shadow-sm" />
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
      className={cn(
        "group flex flex-row items-center gap-0 transition-all duration-200 p-1 border rounded-3xl",
        isDragging 
          ? "scale-105 shadow-2xl border-white/40 cursor-grabbing" 
          : "border-transparent opacity-100"
      )}
    >
      <button
        {...dragHandleProps}
        type="button"
        className="text-white/70 hover:text-white cursor-grab active:cursor-grabbing p-0 pl-1 rounded-xl transition-all hover:bg-white/10 shrink-0"
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
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-9 pr-4 text-[15px] text-white placeholder-white/70 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-medium cursor-pointer hover:bg-white/[0.08] hover:border-white/20"
        />
      </div>

      <div className="w-10 shrink-0 flex items-center justify-center">
        {rightAction}
      </div>
    </motion.div>
  );
}

// 2. Sortable Sarmalayıcı Bileşen
export function LocationItem({
  id,
  item,
  placeholder,
  isFirst,
  isLast,
  onClickInput,
  rightAction
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
    transition: transition || undefined,
    zIndex: isDragging ? 9999 : 1,
    position: 'relative' as const,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full transition-opacity duration-200"
    >
      <LocationItemUI
        item={item}
        placeholder={placeholder}
        isFirst={isFirst}
        isLast={isLast}
        onClickInput={onClickInput}
        rightAction={rightAction}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
