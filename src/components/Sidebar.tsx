import { useState } from "react";
import { ArrowDownUp, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "./ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { cn } from "@/lib/utils";

import { LocationItem, LocationItemUI } from "./LocationItem";
import { LocationSearchModal } from "./LocationSearchModal";

export default function Sidebar({ onOpenRouteSettings }: { onOpenRouteSettings: () => void }) {
  const [locations, setLocations] = useState([
    { id: "start", type: "start", value: "" },
    { id: "dest", type: "destination", value: "" },
  ]);

  const [activeSearchItem, setActiveSearchItem] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        return newItems.map((item, index) => {
          if (index === 0) return { ...item, type: "start" };
          if (index === newItems.length - 1) return { ...item, type: "destination" };
          return { ...item, type: "waypoint" };
        });
      });
    }
  };

  const handleSwap = () => {
    setLocations((prev) => {
      if (prev.length < 2) return prev;
      const newItems = [...prev];
      const start = { ...newItems[0] };
      const end = { ...newItems[newItems.length - 1] };
      
      newItems[0] = end;
      newItems[newItems.length - 1] = start;
      
      return newItems.map((item, index) => {
        if (index === 0) return { ...item, type: "start" };
        if (index === newItems.length - 1) return { ...item, type: "destination" };
        return { ...item, type: "waypoint" };
      });
    });
  };

  const addWaypoint = () => {
    setLocations((prev) => {
      const newItems = [...prev];
      const newWaypoint = {
        id: `waypoint-${Date.now()}`,
        type: "waypoint",
        value: "",
      };
      
      newItems.splice(newItems.length - 1, 0, newWaypoint);
      
      return newItems.map((item, index) => {
        if (index === 0) return { ...item, type: "start" };
        if (index === newItems.length - 1) return { ...item, type: "destination" };
        return { ...item, type: "waypoint" };
      });
    });
  };

  const removeWaypoint = (id) => {
    setLocations(prev => {
      const filtered = prev.filter(loc => loc.id !== id);
      return filtered.map((item, index) => {
        if (index === 0) return { ...item, type: "start" };
        if (index === filtered.length - 1) return { ...item, type: "destination" };
        return { ...item, type: "waypoint" };
      });
    });
  };

  const onSelectLocation = (id, address, coords) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, value: address, coords } : loc
    ));
    setActiveSearchItem(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  return (
    <div className="glass-panel w-full sm:w-[400px] p-6 pointer-events-auto flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white/90">Rota Planlama</h2>
      </div>

      <div className="relative flex flex-col gap-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={locations.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <LayoutGroup id="route-planning">
              <div className="relative flex flex-col gap-3">
                <AnimatePresence initial={false}>
                {locations.map((loc, index) => {
                  const isFirst = index === 0;
                  const isLast = index === locations.length - 1;
                  const label = isFirst ? "Başlangıç Noktası" : isLast ? "Varış Noktası" : `Durak ${index}`;

                  return (
                    <LocationItem 
                      key={loc.id} 
                      id={loc.id} 
                      item={loc}
                      placeholder={label}
                      isFirst={isFirst}
                      isLast={isLast}
                      onClickInput={() => setActiveSearchItem(loc)}
                      rightAction={
                        index === 0 && locations.length > 2 ? (
                          <motion.div
                            layoutId="global-swap-btn"
                            layout
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex items-center justify-center"
                          >
                            <button
                              type="button"
                              onClick={handleSwap}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            >
                              <ArrowDownUp size={14} />
                            </button>
                          </motion.div>
                        ) : !isFirst && !isLast ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeWaypoint(loc.id);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-red-400 p-1.5 transition-colors"
                            >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="w-8" />
                        )
                      }
                    />
                  );
                })}
                {locations.length === 2 && (
                  <motion.div
                    layoutId="global-swap-btn"
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute right-0 inset-y-0 flex items-center z-10"
                  >
                    <button 
                      type="button"
                      onClick={handleSwap}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 active:scale-90"
                    >
                      <ArrowDownUp size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </LayoutGroup>
          </SortableContext>
          
        </DndContext>

      </div>

      <div className="flex flex-col gap-3">
        <Button 
          variant="outline" 
          onClick={addWaypoint}
          className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-[0.98] rounded-2xl h-12 text-white/80 group"
        >
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Durak Ekle
        </Button>
        
        <Button 
          onClick={onOpenRouteSettings}
          className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] border-0 shadow-lg rounded-2xl h-12 font-bold text-base"
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
