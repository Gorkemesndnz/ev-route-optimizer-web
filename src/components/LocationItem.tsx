import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: transition || undefined,
    zIndex: isDragging ? 999999 : 1,
    position: 'relative' as const,
  };

  const Icon = isFirst ? (
    <MapPin size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
  ) : isLast ? (
    <MapPin size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
  ) : (
    <div className="w-2.5 h-2.5 rounded-full bg-white/70 group-hover:bg-white/90 transition-all border border-white/20 shadow-sm" />
  );

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "w-full group flex flex-row items-center gap-0 p-0.5 border rounded-3xl transition-colors duration-200",
        isDragging 
          ? "border-white/40 bg-black/60 backdrop-blur-xl shadow-2xl scale-[1.02] cursor-grabbing"
          : "border-transparent bg-transparent"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className={cn(
          "text-white/70 hover:text-white px-2 py-3 -ml-1 rounded-xl transition-all shrink-0 flex items-center justify-center select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing touch-none"
        )}
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
            if (isDragging) return;
            e.stopPropagation();
            onClickInput?.(item);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl py-2 pl-9 pr-4 text-[15px] text-white transition-all font-medium",
            isDragging 
              ? "bg-white/10 border border-white/20 cursor-grabbing" 
              : "bg-white/5 border border-white/10 placeholder-white/70 focus:outline-none focus:bg-white/10 focus:border-white/30 cursor-pointer hover:bg-white/[0.08] hover:border-white/20"
          )}
        />
      </div>

      <div className="w-10 shrink-0 flex items-center justify-center">
        {!isDragging && rightAction}
      </div>
    </div>
  );
}
