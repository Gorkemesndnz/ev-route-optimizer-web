import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import BackgroundMap from '../BackgroundMap';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).google = {
  maps: {
    TrafficLayer: class {
      setMap = vi.fn();
    },
  },
};

const mocks = vi.hoisted(() => ({
  routeResult: null as unknown,
  showAllStationsInRouteMode: false,
  stationProviderError: undefined as string | null | undefined,
}));

vi.mock('@vis.gl/react-google-maps', () => ({
  Map: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'map' }, children),
  Marker: () => React.createElement('div', { 'data-testid': 'marker' }),
  useMap: () => ({ setOptions: vi.fn(), setMapTypeId: vi.fn() }),
}));

vi.mock('../StationsLayer', () => ({
  default: ({ onProviderError }: { onProviderError?: (message: string | null) => void }) => {
    React.useEffect(() => {
      if (mocks.stationProviderError !== undefined) {
        onProviderError?.(mocks.stationProviderError);
      }
    }, [onProviderError]);
    return React.createElement('div', { 'data-testid': 'stations-layer' });
  },
}));

vi.mock('../RouteLayer', () => ({
  default: () => React.createElement('div', { 'data-testid': 'route-layer' }),
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({
    mapStyleKey: 'dark',
    showAllStationsInRouteMode: mocks.showAllStationsInRouteMode,
  }),
}));

vi.mock('../../../contexts/RouteContext', () => ({
  useRouteContext: () => ({
    routeResult: mocks.routeResult,
  }),
}));

function renderMap() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(BackgroundMap, { userLocation: null }));
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('BackgroundMap station layer visibility', () => {
  it('shows station layer when there is no route result', () => {
    mocks.routeResult = null;
    mocks.showAllStationsInRouteMode = false;
    mocks.stationProviderError = undefined;

    const rendered = renderMap();
    try {
      expect(rendered.container.querySelector('[data-testid="stations-layer"]')).not.toBeNull();
    } finally {
      rendered.cleanup();
    }
  });

  it('hides station layer during route mode until the all-stations toggle is enabled', () => {
    mocks.routeResult = { status: 'success' };
    mocks.showAllStationsInRouteMode = false;
    mocks.stationProviderError = undefined;

    const rendered = renderMap();
    try {
      expect(rendered.container.querySelector('[data-testid="stations-layer"]')).toBeNull();
    } finally {
      rendered.cleanup();
    }

    mocks.showAllStationsInRouteMode = true;
    const toggled = renderMap();
    try {
      expect(toggled.container.querySelector('[data-testid="stations-layer"]')).not.toBeNull();
    } finally {
      toggled.cleanup();
    }
  });

  it('shows a map status when the station provider fails', async () => {
    mocks.routeResult = null;
    mocks.showAllStationsInRouteMode = false;
    mocks.stationProviderError = 'Istasyonlar yuklenemedi';

    const rendered = renderMap();
    try {
      await vi.waitFor(() => {
        expect(rendered.container.querySelector('[role="status"]')?.textContent).toContain('Istasyonlar yuklenemedi');
      });
    } finally {
      rendered.cleanup();
    }
  });
});
