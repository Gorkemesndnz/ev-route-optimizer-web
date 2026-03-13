import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Button } from "./ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { LocationItem } from "./LocationItem";
import { LocationSearchModal } from "./LocationSearchModal";

export default function Sidebar({ onOpenRouteSettings }: { onOpenRouteSettings: () => void }) {
  const [locations, setLocations] = useState([
    { id: "start", type: "start", label: "Başlangıç Noktası", value: "" },
    { id: "end", type: "end", label: "Varış Noktası", value: "" },
  ]);

  const [activeSearchItem, setActiveSearchItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Ensure start is always correctly typed or handle types dynamically based on index if strictly enforced,
        // For now, we just let them drag visually.
        return newItems;
      });
    }
  };

  const handleSwap = () => {
    setLocations((prev) => {
      if (prev.length < 2) return prev;
      const newArr = [...prev];
      const temp = newArr[0];
      newArr[0] = newArr[newArr.length - 1];
      newArr[newArr.length - 1] = temp;
      return newArr;
    });
  };

  const addWaypoint = () => {
    setLocations((prev) => {
      const newArr = [...prev];
      // Insert before the last item (destination)
      const waypoint = { 
        id: `waypoint-${Date.now()}`, 
        type: "waypoint", 
        label: `Durak ${prev.length - 1}`, 
        value: "" 
      };
      newArr.splice(newArr.length - 1, 0, waypoint);
      return newArr;
    });
  };

  const onSelectLocation = (id, address, coords) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, value: address, coords } : loc
    ));
    setActiveSearchItem(null); // Close modal
  };

  return (
    <div className="glass-panel w-full sm:w-[380px] p-5 pointer-events-auto flex flex-col gap-5 relative">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold tracking-tight text-white">Rota Planlama</h2>
      </div>

      <div className="relative flex flex-col gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations}
            strategy={verticalListSortingStrategy}
          >
            {locations.map((loc, index) => {
              const dynPlaceholder = index === 0 
                ? "Başlangıç Noktası" 
                : index === locations.length - 1 
                  ? "Varış Noktası" 
                  : `Durak ${index}`;

              return (
                <LocationItem 
                  key={loc.id} 
                  id={loc.id} 
                  item={loc}
                  placeholder={dynPlaceholder}
                  isFirst={index === 0}
                  isLast={index === locations.length - 1}
                  onClickInput={() => setActiveSearchItem(loc)}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        <button 
          onClick={handleSwap}
          className="absolute right-6 top-[28px] bg-zinc-800 text-white hover:text-white border border-white/20 p-2 rounded-full transition-all duration-200 active:scale-90 hover:bg-zinc-700 shadow-xl z-10"
        >
          <ArrowDownUp size={14} />
        </button>
      </div>

      <div className="flex flex-row gap-3 mt-2">
        <Button 
          variant="outline" 
          onClick={addWaypoint}
          className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 rounded-xl h-11"
        >
          + Durak Ekle
        </Button>
        <Button 
          onClick={onOpenRouteSettings}
          className="flex-[1.2] bg-white text-black hover:bg-zinc-200 transition-all duration-200 active:scale-95 border-0 shadow-lg rounded-xl h-11 font-semibold"
        >
          Rota Ayarları
        </Button>
      </div>

      {activeSearchItem && (
        <LocationSearchModal 
          isOpen={true} 
          onClose={() => setActiveSearchItem(null)}
          item={activeSearchItem}
          onSelectLocation={onSelectLocation}
        />
      )}
    </div>
  );
}
