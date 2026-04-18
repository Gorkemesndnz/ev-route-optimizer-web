import {
  Settings,
  Trash2,
  Leaf,
  ArrowDownUp,
  Plus,
  Bookmark,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
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

interface Location {
  id: string;
  type: string;
  value: string;
  coords?: any;
}

import { LocationItem } from "../route/LocationItem";
import { LocationSearchModal } from "../route/LocationSearchModal";
import { translations } from "../../lib/translations";

import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useRouteContext } from "../../contexts/RouteContext";

const Sidebar = memo(({
  onOpenRouteSettings,
}: {
  onOpenRouteSettings: () => void;
}) => {
  const { language } = useSettings();
  const { currentUser, requireAuth } = useAuth();
  const t = translations[language];
  const { planRoute, cancelRoute, isPlanning, error } = useRouteContext();
  const [locations, setLocations] = useState([
    { id: "start", type: "start", value: "" } as Location,
    { id: "dest", type: "destination", value: "" } as Location,
  ]);

  const [activeSearchItem, setActiveSearchItem] = useState(null);

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

  const handleDragStart = () => {
    // Logic for drag start if needed, but activeId was removed
  };

  const finalizeLocations = (items: Location[]) => {
    return items.map((item, index) => {
      if (index === 0) return { ...item, type: "start" };
      if (index === items.length - 1) return { ...item, type: "destination" };
      return { ...item, type: "waypoint" };
    });
  };

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        return finalizeLocations(newItems);
      });
    }
  }, []);

  const handleSwap = useCallback(() => {
    setLocations((prev) => {
      if (prev.length < 2) return prev;
      const newItems = [...prev];
      const start = { ...newItems[0] };
      const end = { ...newItems[newItems.length - 1] };

      newItems[0] = end;
      newItems[newItems.length - 1] = start;

      return finalizeLocations(newItems);
    });
  }, []);

  const addWaypoint = useCallback(() => {
    setLocations((prev) => {
      const newItems = [...prev];
      const newWaypoint: Location = {
        id: `waypoint-${crypto.randomUUID()}`,
        type: "waypoint",
        value: "",
      };

      newItems.splice(newItems.length - 1, 0, newWaypoint);
      return finalizeLocations(newItems);
    });
  }, []);

  const removeWaypoint = useCallback((id: string) => {
    setLocations(prev => {
      const filtered = prev.filter(loc => loc.id !== id);
      return finalizeLocations(filtered);
    });
  }, []);

  const onSelectLocation = useCallback((id: string, address: string, coords: any) => {
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, value: address, coords } : loc
    ));
    setActiveSearchItem(null);
  }, []);


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
              requireAuth(t.savedRoutesPrompt);
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
      {error && (
        <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-3 rounded-xl text-sm leading-relaxed mb-1 shadow-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onOpenRouteSettings}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all flex items-center justify-center"
        >
          <Settings size={20} />
        </button>
        
        {isPlanning ? (
          <button
            onClick={cancelRoute}
            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-400 transition-all flex justify-center items-center overflow-hidden relative shadow-lg"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <span className="relative z-10 flex items-center gap-2">
              İptal Et
            </span>
          </button>
        ) : (
          <button
            onClick={() => planRoute(locations)}
            disabled={locations.length < 2 || locations.some(l => !l.coords)}
            className="flex-1 py-3 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 disabled:opacity-50 disabled:bg-gray-400/50 disabled:text-white/50 transition-all flex justify-center items-center shadow-md active:scale-[0.98]"
          >
            {t.planRoute}
          </button>
        )}
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
});

export default Sidebar;
