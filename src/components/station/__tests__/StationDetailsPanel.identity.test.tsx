import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import StationDetailsPanel from '../StationDetailsPanel';
import { stationApi } from '../../../api/stationApi';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  selectedStation: null as any,
}));

vi.mock('framer-motion', () => {
  const make = (tag: keyof React.JSX.IntrinsicElements) =>
    ({ children, ...props }: React.ComponentProps<any>) => React.createElement(tag, props, children);
  return {
    motion: {
      div: make('div'),
      button: make('button'),
      img: make('img'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

vi.mock('../TouristAttractionsPanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'tourist-panel' }),
}));

vi.mock('../ReviewStationPanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'review-panel' }),
}));

vi.mock('../ReportIssuePanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'report-panel' }),
}));

vi.mock('../../../contexts/StationContext', () => ({
  useStation: () => ({
    selectedStation: mocks.selectedStation,
  }),
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({
    language: 'en',
  }),
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    requireAuth: vi.fn(),
  }),
}));

vi.mock('../../../api/stationApi', () => ({
  stationApi: {
    getGoogle: vi.fn(),
    getDetail: vi.fn(),
    getAmenities: vi.fn(),
  },
}));

vi.mock('../../../api/reviewApi', () => ({
  reviewApi: {
    getByStation: vi.fn().mockResolvedValue({ averageRating: 0, totalReviews: 0, reviews: [] }),
    remove: vi.fn(),
  },
}));

vi.mock('../../../api/weatherApi', () => ({
  weatherApi: {
    get: vi.fn().mockResolvedValue(null),
  },
}));

function baseStation(overrides: Record<string, unknown> = {}) {
  return {
    id: '123',
    title: 'Test Station',
    latitude: 41,
    longitude: 29,
    usageType: 'Google Place API',
    statusType: 'Unknown',
    formattedAddress: 'Istanbul',
    connections: [],
    amenities: [],
    contactTelephone: '',
    ...overrides,
  };
}

function renderPanel() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(StationDetailsPanel, { onBack: vi.fn() }));
  });

  return {
    container,
    rerender: () => {
      act(() => {
        root.render(React.createElement(StationDetailsPanel, { onBack: vi.fn() }));
      });
    },
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('StationDetailsPanel station identity enrichment', () => {
  beforeEach(() => {
    vi.mocked(stationApi.getGoogle).mockReset();
    vi.mocked(stationApi.getDetail).mockReset();
    vi.mocked(stationApi.getAmenities).mockReset();
    vi.mocked(stationApi.getAmenities).mockResolvedValue([]);
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success, error) => error?.()),
      },
    });
  });

  it('uses Google provider identity before numeric legacy detail lookup', async () => {
    mocks.selectedStation = baseStation({
      id: '987',
      placeId: 'places/google-station-1',
      sourceProvider: 'google',
      sourceId: 'places/google-station-1',
    });
    vi.mocked(stationApi.getGoogle).mockResolvedValue([
      baseStation({
        id: 987,
        placeId: 'places/google-station-1',
        sourceProvider: 'google',
        sourceId: 'places/google-station-1',
        connections: [{ connectionType: 'CCS', currentType: 'DC', powerKw: 120, count: 1, availableCount: 1, outOfServiceCount: 0 }],
      }) as any,
    ]);

    const rendered = renderPanel();
    try {
      await vi.waitFor(() => expect(stationApi.getGoogle).toHaveBeenCalled());
      expect(stationApi.getDetail).not.toHaveBeenCalled();
    } finally {
      rendered.cleanup();
    }
  });

  it('uses numeric legacy detail lookup before Google fallback for legacy OCM ids', async () => {
    mocks.selectedStation = baseStation({ id: '123' });
    vi.mocked(stationApi.getDetail).mockResolvedValue(
      baseStation({
        id: 123,
        connections: [{ connectionType: 'TYPE_2', currentType: 'AC', powerKw: 22, count: 1, availableCount: 1, outOfServiceCount: 0 }],
      }) as any,
    );

    const rendered = renderPanel();
    try {
      await vi.waitFor(() => expect(stationApi.getDetail).toHaveBeenCalledWith(123));
      expect(stationApi.getGoogle).not.toHaveBeenCalled();
    } finally {
      rendered.cleanup();
    }
  });

  it('falls back to Google nearby lookup when legacy detail lookup fails', async () => {
    mocks.selectedStation = baseStation({ id: '123', sourceProvider: 'ocm' });
    vi.mocked(stationApi.getDetail).mockRejectedValue(new Error('legacy detail failed'));
    vi.mocked(stationApi.getGoogle).mockResolvedValue([
      baseStation({
        id: 987,
        placeId: 'places/fallback',
        sourceProvider: 'google',
        sourceId: 'places/fallback',
        connections: [{ connectionType: 'CCS', currentType: 'DC', powerKw: 120, count: 1, availableCount: 1, outOfServiceCount: 0 }],
      }) as any,
    ]);

    const rendered = renderPanel();
    try {
      await vi.waitFor(() => expect(stationApi.getGoogle).toHaveBeenCalled());
      expect(vi.mocked(stationApi.getDetail).mock.invocationCallOrder[0])
        .toBeLessThan(vi.mocked(stationApi.getGoogle).mock.invocationCallOrder[0]);
    } finally {
      rendered.cleanup();
    }
  });

  it('uses existing selected station connections without provider enrichment', async () => {
    mocks.selectedStation = baseStation({
      connections: [{ connectionType: 'CCS', currentType: 'DC', powerKw: 120, count: 1, availableCount: 1, outOfServiceCount: 0 }],
    });

    const rendered = renderPanel();
    try {
      expect(rendered.container.textContent).toContain('CCS');
      expect(stationApi.getDetail).not.toHaveBeenCalled();
      expect(stationApi.getGoogle).not.toHaveBeenCalled();
    } finally {
      rendered.cleanup();
    }
  });

  it('ignores stale enrichment results after the selected station changes', async () => {
    let resolveOldDetail!: (value: unknown) => void;
    const oldDetail = new Promise((resolve) => {
      resolveOldDetail = resolve;
    });

    mocks.selectedStation = baseStation({ id: '123' });
    vi.mocked(stationApi.getDetail).mockReturnValue(oldDetail as any);

    const rendered = renderPanel();
    try {
      await vi.waitFor(() => expect(stationApi.getDetail).toHaveBeenCalledWith(123));

      mocks.selectedStation = baseStation({
        id: '456',
        title: 'Fresh Station',
        connections: [{ connectionType: 'TYPE_2', currentType: 'AC', powerKw: 22, count: 1, availableCount: 1, outOfServiceCount: 0 }],
      });
      rendered.rerender();

      await vi.waitFor(() => expect(rendered.container.textContent).toContain('Type 2'));

      await act(async () => {
        resolveOldDetail(baseStation({
          id: 123,
          connections: [{ connectionType: 'CCS', currentType: 'DC', powerKw: 120, count: 1, availableCount: 1, outOfServiceCount: 0 }],
        }));
        await oldDetail;
      });

      expect(rendered.container.textContent).toContain('Type 2');
      expect(rendered.container.textContent).not.toContain('CCS');
    } finally {
      rendered.cleanup();
    }
  });
});
