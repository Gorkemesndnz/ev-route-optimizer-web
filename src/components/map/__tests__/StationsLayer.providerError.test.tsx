import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import StationsLayer from '../StationsLayer';
import { stationApi } from '../../../api/stationApi';
import { ApiError } from '../../../lib/apiClient';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const fakeListener = {};
const fakeBounds = {
  getSouthWest: () => ({ lat: () => 40, lng: () => 28 }),
  getNorthEast: () => ({ lat: () => 42, lng: () => 30 }),
};
const fakeMap = {
  getBounds: () => fakeBounds,
  getZoom: () => 11,
  addListener: vi.fn(() => fakeListener),
  setOptions: vi.fn(),
};

(globalThis as any).google = {
  maps: {
    event: {
      removeListener: vi.fn(),
    },
    Marker: class {
      setMap = vi.fn();
      addListener = vi.fn();
      set = vi.fn();
      get = vi.fn();
      setIcon = vi.fn();
      setZIndex = vi.fn();
      static MAX_ZINDEX = 1000;
    },
    Size: class {
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
    },
    Point: class {
      x: number;
      y: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
    },
    LatLng: class {
      lat: number;
      lng: number;

      constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
      }
    },
    OverlayView: class {
      setMap = vi.fn();
      getPanes = () => ({ overlayLayer: document.createElement('div') });
      getProjection = () => null;
      getMap = () => fakeMap;
    },
  },
};

vi.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => fakeMap,
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({
    stationFilters: [],
  }),
}));

vi.mock('../../../contexts/StationContext', () => ({
  useStation: () => ({
    setSelectedStation: vi.fn(),
  }),
}));

vi.mock('../../../api/stationApi', () => ({
  stationApi: {
    getBase: vi.fn(),
    getGoogle: vi.fn(),
  },
}));

function renderLayer(onProviderError = vi.fn()) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(StationsLayer, { onProviderError }));
  });

  return {
    onProviderError,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('StationsLayer provider error signal', () => {
  beforeEach(() => {
    vi.mocked(stationApi.getBase).mockReset();
    vi.mocked(stationApi.getGoogle).mockReset();
    fakeMap.addListener.mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports non-abort station fetch errors to the parent map', async () => {
    vi.mocked(stationApi.getGoogle).mockRejectedValue(new Error('provider unavailable'));
    const rendered = renderLayer();

    try {
      await vi.waitFor(() => {
        expect(rendered.onProviderError).toHaveBeenCalledWith('Istasyonlar yuklenemedi');
      });
    } finally {
      rendered.cleanup();
    }
  });

  it('passes the active abort signal to the station API request', async () => {
    vi.mocked(stationApi.getGoogle).mockResolvedValue([]);
    const rendered = renderLayer();

    try {
      await vi.waitFor(() => {
        expect(stationApi.getGoogle).toHaveBeenCalled();
      });

      const options = vi.mocked(stationApi.getGoogle).mock.calls[0][1];
      expect(options?.signal).toBeInstanceOf(AbortSignal);
    } finally {
      rendered.cleanup();
    }
  });

  it('reports rate-limit errors with a provider-specific message', async () => {
    vi.mocked(stationApi.getGoogle).mockRejectedValue(new ApiError('rate limit', 429));
    const rendered = renderLayer();

    try {
      await vi.waitFor(() => {
        expect(rendered.onProviderError).toHaveBeenCalledWith('Istasyon servisi kota sinirina takildi');
      });
    } finally {
      rendered.cleanup();
    }
  });

  it('clears provider error after a successful station fetch, including empty results', async () => {
    vi.mocked(stationApi.getGoogle).mockResolvedValue([]);
    const rendered = renderLayer();

    try {
      await vi.waitFor(() => {
        expect(rendered.onProviderError).toHaveBeenCalledWith(null);
      });
    } finally {
      rendered.cleanup();
    }
  });
});
