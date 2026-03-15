import { useState } from "react";
import {
  Search,
  Settings,
  Navigation,
  Trash2,
  GripVertical,
  MapPin,
  ChevronRight,
  Leaf,
  ArrowDownUp,
  Plus,
  Bookmark,
  Play
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "./ui/button";
import {
  DndContext,
  closestCenter,
  closestCorners,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { cn } from "@/lib/utils";

import { LocationItem } from "./LocationItem";
import { LocationSearchModal } from "./LocationSearchModal";
import { translations } from "../lib/translations";

export default function Sidebar({
  onOpenRouteSettings,
  currentUser,
  onRequireAuth,
  language = 'tr'
}: {
  onOpenRouteSettings: () => void;
  currentUser: any;
  onRequireAuth: (msg: string) => void;
  language?: 'tr' | 'en';
}) {
  const t = translations[language];
  const [locations, setLocations] = useState([
    { id: "start", type: "start", value: "" },
    { id: "dest", type: "destination", value: "" },
  ]);

  const [activeSearchItem, setActiveSearchItem] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
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
    console.log("DragEnd Event:", { activeId: active?.id, overId: over?.id });

    if (over && active.id !== over.id) {
      console.log("Drag is valid. Commencing array move...");
      setLocations((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        console.log(`Moving item from index ${oldIndex} to ${newIndex}`);

        const newItems = arrayMove(items, oldIndex, newIndex);
        console.log("New items array after move:", newItems);

        const finalizedItems = newItems.map((item, index) => {
          if (index === 0) return { ...item, type: "start" };
          if (index === newItems.length - 1) return { ...item, type: "destination" };
          return { ...item, type: "waypoint" };
        });
        console.log("Finalized items to set in state:", finalizedItems);
        return finalizedItems;
      });
    } else {
      console.log("Drag invalid or dropped on same position.");
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


  return (
    <div className="glass-panel w-full sm:w-[420px] px-4 py-5 pointer-events-auto flex flex-col gap-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white/90">{t.routePlanning}</h2>
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-500" size={24} />
          <span className="text-lg font-black tracking-widest text-emerald-500 uppercase">{t.appTitle}</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative flex flex-col gap-2">
              {locations.map((loc, index) => {
                const isFirst = index === 0;
                const isLast = index === locations.length - 1;
                const label = isFirst ? t.startPoint : isLast ? t.destinationPoint : locations.length === 3 ? t.waypoint : `${index}. ${t.waypoint}`;

                return (
                  <LocationItem
                    key={loc.id}
                    id={loc.id}
                    item={loc}
                    placeholder={label}
                    isFirst={isFirst}
                    isLast={isLast}
                    onClickInput={() => setActiveSearchItem({ ...loc, currentIndex: index, totalCount: locations.length })}
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
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleSwap();
                            }}
                            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
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
                          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <div className="w-10" />
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
                  className="absolute right-0 inset-y-0 flex items-center z-50 pointer-events-none"
                >
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleSwap();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 active:scale-90 pointer-events-auto"
                  >
                    <ArrowDownUp size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          </SortableContext>
        </DndContext>

      </div>

      {/* Quick Actions Row */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={addWaypoint}
          className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> {t.addWaypoint}
        </button>
        <button
          onClick={() => {
            if (!currentUser) {
              onRequireAuth(t.savedRoutesPrompt);
            } else {
              // Gelecekte eklenecek "Kayıtlı Rotalar" ekranı
              alert(language === 'tr' ? "Kayıtlı Rotalar: Modül Yapım Aşamasında" : "Saved Routes: Module Under Construction");
            }
          }}
          className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          <Bookmark size={16} /> {t.savedRoutes}
        </button>
      </div>

      {/* Primary Action Row */}
      <div className="flex gap-3">
        <button
          onClick={onOpenRouteSettings}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
        >
          <Settings size={20} />
        </button>
        <button
          className="flex-1 py-3 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
        >
          {t.planRoute}
        </button>
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
