import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import RouteSettingsView from '../RouteSettingsView';
import type { RouteSettings } from '../../../contexts/RouteContext';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  pendingSettings: null as unknown as RouteSettings,
  commitSettings: vi.fn(),
  onBack: vi.fn(),
}));

vi.mock('../../../contexts/RouteContext', () => ({
  useRouteContext: () => ({
    pendingSettings: mocks.pendingSettings,
    commitSettings: mocks.commitSettings,
  }),
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({ language: 'tr' }),
}));

function baseSettings(overrides: Partial<RouteSettings> = {}): RouteSettings {
  return {
    smartPlanner: true,
    optimizationMode: 'balanced',
    chargingFrequency: 'optimal',
    arrivalSoc: null,
    stationArrivalSoc: null,
    stationDepartureSoc: null,
    chargerSpeedPref: 'any',
    stationBrands: [],
    locationPrefs: [],
    departureDate: '2026-05-17',
    departureTime: '10:00',
    toggleFeribot: true,
    toggleUcretliOtoyollar: true,
    toggleOtoyollar: true,
    toggleKopruler: true,
    toggleOzelOtoyollar: true,
    ...overrides,
  };
}

function renderView() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(RouteSettingsView, { onBack: mocks.onBack }));
  });

  return {
    container,
    rerender: () => {
      act(() => {
        root.render(React.createElement(RouteSettingsView, { onBack: mocks.onBack }));
      });
    },
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function findButton(container: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((el) =>
    el.textContent?.includes(text),
  );
  if (!button) {
    throw new Error(`Button not found: ${text}`);
  }
  return button as HTMLButtonElement;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function findSwitch(container: HTMLElement, label: string): HTMLElement {
  const selector = `[role="switch"][aria-label="${label}"]`;
  const switchEl = container.querySelector(selector);
  if (!switchEl) {
    throw new Error(`Switch not found: ${label}`);
  }
  return switchEl as HTMLElement;
}

function expectSwitchState(switchEl: HTMLElement, checked: boolean, disabled = false) {
  expect(switchEl.getAttribute('aria-checked')).toBe(String(checked));
  if (disabled) {
    expect(switchEl.getAttribute('aria-disabled')).toBe('true');
  } else {
    expect(switchEl.hasAttribute('aria-disabled')).toBe(false);
  }
}

function setRangeValue(input: HTMLInputElement, value: number) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    valueSetter?.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('RouteSettingsView apply mapping', () => {
  beforeEach(() => {
    mocks.pendingSettings = baseSettings();
    mocks.commitSettings.mockClear();
    mocks.onBack.mockClear();
  });

  it('defaults road preference switches to allowed', () => {
    mocks.pendingSettings = baseSettings();

    const rendered = renderView();
    try {
      for (const label of ['Ücretli Yollar', 'Devlet Otoyolları', 'Özel Otoyollar', 'Feribot', 'Köprü']) {
        expectSwitchState(findSwitch(rendered.container, label), true);
      }
    } finally {
      rendered.cleanup();
    }
  });

  it('turning toll roads off also disables state and private highways', () => {
    mocks.pendingSettings = baseSettings();

    const rendered = renderView();
    try {
      click(findSwitch(rendered.container, 'Ücretli Yollar'));

      expectSwitchState(findSwitch(rendered.container, 'Ücretli Yollar'), false);
      expectSwitchState(findSwitch(rendered.container, 'Devlet Otoyolları'), false, true);
      expectSwitchState(findSwitch(rendered.container, 'Özel Otoyollar'), false, true);

      click(findSwitch(rendered.container, 'Devlet Otoyolları'));
      click(findSwitch(rendered.container, 'Özel Otoyollar'));
      expectSwitchState(findSwitch(rendered.container, 'Devlet Otoyolları'), false, true);
      expectSwitchState(findSwitch(rendered.container, 'Özel Otoyollar'), false, true);

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        toggleUcretliOtoyollar: false,
        toggleOtoyollar: false,
        toggleOzelOtoyollar: false,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('turning toll roads back on restores state and private highway toggles', () => {
    mocks.pendingSettings = baseSettings({
      toggleUcretliOtoyollar: false,
      toggleOtoyollar: false,
      toggleOzelOtoyollar: false,
    });

    const rendered = renderView();
    try {
      click(findSwitch(rendered.container, 'Ücretli Yollar'));

      expectSwitchState(findSwitch(rendered.container, 'Ücretli Yollar'), true);
      expectSwitchState(findSwitch(rendered.container, 'Devlet Otoyolları'), true);
      expectSwitchState(findSwitch(rendered.container, 'Özel Otoyollar'), true);

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        toggleUcretliOtoyollar: true,
        toggleOtoyollar: true,
        toggleOzelOtoyollar: true,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('allows state and private highways to be configured independently when toll roads are enabled', () => {
    mocks.pendingSettings = baseSettings();

    const rendered = renderView();
    try {
      click(findSwitch(rendered.container, 'Devlet Otoyolları'));
      click(findSwitch(rendered.container, 'Özel Otoyollar'));

      expectSwitchState(findSwitch(rendered.container, 'Ücretli Yollar'), true);
      expectSwitchState(findSwitch(rendered.container, 'Devlet Otoyolları'), false);
      expectSwitchState(findSwitch(rendered.container, 'Özel Otoyollar'), false);

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        toggleUcretliOtoyollar: true,
        toggleOtoyollar: false,
        toggleOzelOtoyollar: false,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('commits manual UI draft as one RouteSettings object', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: false,
      toggleFeribot: false,
      toggleUcretliOtoyollar: false,
      toggleOtoyollar: false,
      toggleKopruler: false,
      toggleOzelOtoyollar: false,
    });

    const rendered = renderView();
    try {
      click(findButton(rendered.container, 'ZES'));
      click(findButton(rendered.container, 'HPC'));
      click(findButton(rendered.container, 'AVM'));

      const sliders = Array.from(rendered.container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
      expect(sliders).toHaveLength(3);
      expect(sliders[0].min).toBe('5');
      expect(sliders[0].max).toBe('50');
      expect(sliders[1].min).toBe('5');
      expect(sliders[1].max).toBe('40');
      expect(sliders[2].min).toBe('50');
      expect(sliders[2].max).toBe('100');
      setRangeValue(sliders[0], 35);
      setRangeValue(sliders[1], 18);
      setRangeValue(sliders[2], 72);

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: false,
        arrivalSoc: 35,
        stationArrivalSoc: 18,
        stationDepartureSoc: 72,
        chargerSpeedPref: 'HPC',
        stationBrands: ['ZES'],
        locationPrefs: ['AVM'],
        toggleFeribot: false,
        toggleUcretliOtoyollar: false,
        toggleOtoyollar: false,
        toggleKopruler: false,
        toggleOzelOtoyollar: false,
      }));
      expect(mocks.onBack).toHaveBeenCalledOnce();
    } finally {
      rendered.cleanup();
    }
  });

  it('commits manual SOC fields as null when Smart Planner is on', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: true,
      arrivalSoc: 35,
      stationArrivalSoc: 18,
      stationDepartureSoc: 72,
    });

    const rendered = renderView();
    try {
      const sliders = Array.from(rendered.container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
      expect(sliders).toHaveLength(1);
      expect(sliders[0].disabled).toBe(true);
      expect(sliders[0].min).toBe('5');
      expect(sliders[0].max).toBe('50');

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: true,
        arrivalSoc: null,
        stationArrivalSoc: null,
        stationDepartureSoc: null,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('enables destination SOC in the Smart Planner card when planner is turned off', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: true,
      arrivalSoc: null,
    });

    const rendered = renderView();
    try {
      const switches = Array.from(rendered.container.querySelectorAll('.w-12.h-7')) as HTMLElement[];
      click(switches[5]);

      const sliders = Array.from(rendered.container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
      expect(sliders).toHaveLength(3);
      expect(sliders[0].disabled).toBe(false);
      expect(sliders[0].min).toBe('5');
      expect(sliders[0].max).toBe('50');
      setRangeValue(sliders[0], 40);

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: false,
        arrivalSoc: 40,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('keeps untouched manual SOC fields null when planner is turned off', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: true,
      arrivalSoc: null,
      stationArrivalSoc: null,
      stationDepartureSoc: null,
    });

    const rendered = renderView();
    try {
      const switches = Array.from(rendered.container.querySelectorAll('.w-12.h-7')) as HTMLElement[];
      click(switches[5]);

      click(findButton(rendered.container, 'Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: false,
        arrivalSoc: null,
        stationArrivalSoc: null,
        stationDepartureSoc: null,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('normalizes station SOC spread before commit', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: false,
    });

    const rendered = renderView();
    try {
      const sliders = Array.from(rendered.container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
      setRangeValue(sliders[1], 35);
      setRangeValue(sliders[2], 50);

      click(findButton(rendered.container, 'Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: false,
        stationArrivalSoc: 30,
        stationDepartureSoc: 50,
      }));
    } finally {
      rendered.cleanup();
    }
  });

  it('refreshes draft from pendingSettings while the view stays mounted', () => {
    mocks.pendingSettings = baseSettings({
      smartPlanner: false,
      arrivalSoc: 15,
    });

    const rendered = renderView();
    try {
      mocks.pendingSettings = baseSettings({
        smartPlanner: false,
        arrivalSoc: 45,
        stationBrands: ['Trugo'],
        locationPrefs: ['Otel'],
      });
      rendered.rerender();

      click(findButton(rendered.container, 'Ayarları Uygula'));

      expect(mocks.commitSettings).toHaveBeenCalledWith(expect.objectContaining({
        smartPlanner: false,
        arrivalSoc: 45,
        stationBrands: ['Trugo'],
        locationPrefs: ['Otel'],
      }));
    } finally {
      rendered.cleanup();
    }
  });
});
