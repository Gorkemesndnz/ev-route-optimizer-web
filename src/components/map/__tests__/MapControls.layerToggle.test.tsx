import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import MapControls from '../MapControls';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  routeResult: null as unknown,
  showAllStationsInRouteMode: false,
  setShowAllStationsInRouteMode: vi.fn(),
}));

vi.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => ({
    getZoom: () => 10,
    setZoom: vi.fn(),
    panTo: vi.fn(),
    setMapTypeId: vi.fn(),
  }),
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({
    language: 'en',
    mapStyleKey: 'dark',
    setMapStyleKey: vi.fn(),
    showTraffic: false,
    setShowTraffic: vi.fn(),
    stationFilters: [],
    setStationFilters: vi.fn(),
    showAllStationsInRouteMode: mocks.showAllStationsInRouteMode,
    setShowAllStationsInRouteMode: mocks.setShowAllStationsInRouteMode,
  }),
}));

vi.mock('../../../contexts/RouteContext', () => ({
  useRouteContext: () => ({
    routeResult: mocks.routeResult,
  }),
}));

function renderControls() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(MapControls, { onLocateUser: vi.fn() }));
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('MapControls route-mode station layer toggle', () => {
  beforeEach(() => {
    mocks.routeResult = null;
    mocks.showAllStationsInRouteMode = false;
    mocks.setShowAllStationsInRouteMode.mockClear();
  });

  it('hides the all-stations toggle when there is no route result', () => {
    const rendered = renderControls();
    try {
      expect(rendered.container.querySelector('[title="Show all stations"]')).toBeNull();
    } finally {
      rendered.cleanup();
    }
  });

  it('shows the route-mode all-stations toggle and updates settings state', () => {
    mocks.routeResult = { status: 'success' };
    mocks.showAllStationsInRouteMode = false;

    const rendered = renderControls();
    try {
      const button = rendered.container.querySelector<HTMLButtonElement>('[title="Show all stations"]');
      expect(button).not.toBeNull();

      act(() => {
        button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(mocks.setShowAllStationsInRouteMode).toHaveBeenCalledWith(true);
    } finally {
      rendered.cleanup();
    }
  });
});
