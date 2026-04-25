import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { savedRouteApi } from '../api/savedRouteApi';
import type { RouteResultDto } from './RouteContext';
import type { SavedRouteSummaryDto, SavedRouteDetailDto } from '../types/api/savedRoute';

// Re-export as existing aliases so consumers don't break
export type SavedRouteSummary = SavedRouteSummaryDto;
export type SavedRouteDetail = SavedRouteDetailDto;

interface SavedRouteContextValue {
  savedRoutes: SavedRouteSummary[];
  isLoading: boolean;
  error: string | null;
  loadSavedRoutes: () => Promise<void>;
  saveRoute: (params: {
    result: RouteResultDto;
    request: object;
    startLabel: string;
    endLabel: string;
  }) => Promise<string | null>;
  getSavedRoute: (id: string) => Promise<SavedRouteDetail | null>;
  deleteSavedRoute: (id: string) => Promise<void>;
  rateSavedRoute: (id: string, rating: number, comment?: string) => Promise<void>;
}

const SavedRouteContext = createContext<SavedRouteContextValue | undefined>(undefined);

export const SavedRouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await savedRouteApi.list();
      setSavedRoutes(data);
    } catch (e) {
      console.error('loadSavedRoutes error:', e);
      setError(e instanceof Error ? e.message : 'Kaydedilmiş rotalar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRoute = useCallback(async ({ result, request, startLabel, endLabel }: {
    result: RouteResultDto;
    request: object;
    startLabel: string;
    endLabel: string;
  }): Promise<string | null> => {
    try {
      const saved = await savedRouteApi.create({
        startLabel,
        endLabel,
        totalDistanceKm: result.total_distance_km,
        totalDurationMin: result.total_duration_min,
        consumptionKwh: result.consumption_kwh,
        totalChargingCost: result.total_charging_cost,
        routeResultJson: JSON.stringify(result),
        routeRequestJson: JSON.stringify(request),
      });
      await loadSavedRoutes();
      return saved.id;
    } catch (e) {
      console.error('saveRoute error:', e);
      return null;
    }
  }, [loadSavedRoutes]);

  const getSavedRoute = useCallback(async (id: string): Promise<SavedRouteDetail | null> => {
    try {
      return await savedRouteApi.getById(id);
    } catch (e) {
      console.error('getSavedRoute error:', e);
      return null;
    }
  }, []);

  const deleteSavedRoute = useCallback(async (id: string) => {
    try {
      await savedRouteApi.remove(id);
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('deleteSavedRoute error:', e);
    }
  }, []);

  const rateSavedRoute = useCallback(async (id: string, rating: number, comment?: string) => {
    try {
      await savedRouteApi.rate(id, { rating, comment });
      setSavedRoutes(prev => prev.map(r =>
        r.id === id ? { ...r, rating, ratingComment: comment ?? null } : r
      ));
    } catch (e) {
      console.error('rateSavedRoute error:', e);
    }
  }, []);

  return (
    <SavedRouteContext.Provider value={{
      savedRoutes, isLoading, error,
      loadSavedRoutes, saveRoute, getSavedRoute, deleteSavedRoute, rateSavedRoute,
    }}>
      {children}
    </SavedRouteContext.Provider>
  );
};

export function useSavedRoute() {
  const ctx = useContext(SavedRouteContext);
  if (!ctx) throw new Error('useSavedRoute must be used within SavedRouteProvider');
  return ctx;
}
