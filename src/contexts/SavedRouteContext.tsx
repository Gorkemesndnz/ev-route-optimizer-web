import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { apiClient } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { RouteResultDto } from './RouteContext';

export interface SavedRouteSummary {
  id: string;
  startLabel: string;
  endLabel: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  consumptionKwh: number;
  totalChargingCost: number;
  rating: number | null;
  ratingComment: string | null;
  createdAt: string;
}

export interface SavedRouteDetail extends SavedRouteSummary {
  routeResultJson: string;
  routeRequestJson: string;
}

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
      const res = await apiClient(ENDPOINTS.SAVED_ROUTES);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setSavedRoutes(data.data);
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
      const res = await apiClient(ENDPOINTS.SAVED_ROUTES, {
        method: 'POST',
        body: {
          startLabel,
          endLabel,
          totalDistanceKm: result.total_distance_km,
          totalDurationMin: result.total_duration_min,
          consumptionKwh: result.consumption_kwh,
          totalChargingCost: result.total_charging_cost,
          routeResultJson: JSON.stringify(result),
          routeRequestJson: JSON.stringify(request),
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success) {
        await loadSavedRoutes();
        return data.data.id as string;
      }
      return null;
    } catch (e) {
      console.error('saveRoute error:', e);
      return null;
    }
  }, [loadSavedRoutes]);

  const getSavedRoute = useCallback(async (id: string): Promise<SavedRouteDetail | null> => {
    try {
      const res = await apiClient(ENDPOINTS.savedRoute(id));
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? (data.data as SavedRouteDetail) : null;
    } catch (e) {
      console.error('getSavedRoute error:', e);
      return null;
    }
  }, []);

  const deleteSavedRoute = useCallback(async (id: string) => {
    try {
      await apiClient(ENDPOINTS.savedRoute(id), { method: 'DELETE' });
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('deleteSavedRoute error:', e);
    }
  }, []);

  const rateSavedRoute = useCallback(async (id: string, rating: number, comment?: string) => {
    try {
      await apiClient(ENDPOINTS.savedRouteRate(id), {
        method: 'POST',
        body: { rating, comment },
      });
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
