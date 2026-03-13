import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MapPin, Search } from "lucide-react";

export function LocationItem({ id, item, placeholder, isFirst, isLast, onClickInput }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-row items-center gap-3 bg-transparent">
      <button
        {...attributes}
        {...listeners}
        className="text-white/40 hover:text-white cursor-grab active:cursor-grabbing p-1 rounded-md transition-colors"
      >
        <GripVertical size={18} />
      </button>
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
          {isFirst ? <MapPin size={16} className="text-blue-400" /> : isLast ? <MapPin size={16} className="text-red-400" /> : <Search size={16} />}
        </div>
        <input
          type="text"
          readOnly
          value={item.value}
          onClick={() => onClickInput(item)}
          placeholder={placeholder || item.label}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-medium cursor-pointer"
        />
      </div>
    </div>
  );
}
