import { ApiError } from '../../lib/apiClient';
import type { ChargingStationDto } from '../../types/api/station';

export function createLiquidGlassPinSvg(types: string[], title?: string, isGoogle: boolean = true): { svg: string, width: number } {
  const contentSizeHeight = 120;

  if (types.length === 0 && (!isGoogle)) {
    const contentSize = 120;
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}"><defs><filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/></filter></defs><circle cx="60" cy="90" r="5" fill="#334155" stroke="#ffffff" stroke-width="1.5" filter="url(#drop-shadow)"/></svg>`,
      width: contentSize
    };
  }

  let typesWidth = 10;
  if (types.length === 1) typesWidth = 24;
  if (types.length === 2) typesWidth = 52;
  if (types.length === 3) typesWidth = 80;

  const displayTitle = title ? (title.length > 25 ? title.substring(0, 23) + '...' : title) : '';
  const titleWidth = displayTitle ? displayTitle.length * 6.5 : 0;

  const hasBoth = types.length > 0 && displayTitle.length > 0;
  const gap = hasBoth ? 12 : 0;

  let w = typesWidth + titleWidth + gap + 16;
  if (w < 40) w = 40;

  const contentSizeWidth = w + 60;
  const cx = contentSizeWidth / 2;
  const cy = 90;

  const r = 8;
  const h = 26;
  const th = 8;
  const tw = 6;
  const boxBottom = cy - th;
  const boxTop = boxBottom - h;

  const tooltipPath = `
    M ${cx}, ${cy}
    L ${cx + tw}, ${boxBottom}
    L ${cx + w/2 - r}, ${boxBottom}
    Q ${cx + w/2}, ${boxBottom} ${cx + w/2}, ${boxBottom - r}
    L ${cx + w/2}, ${boxTop + r}
    Q ${cx + w/2}, ${boxTop} ${cx + w/2 - r}, ${boxTop}
    L ${cx - w/2 + r}, ${boxTop}
    Q ${cx - w/2}, ${boxTop} ${cx - w/2}, ${boxTop + r}
    L ${cx - w/2}, ${boxBottom - r}
    Q ${cx - w/2}, ${boxBottom} ${cx - w/2 + r}, ${boxBottom}
    L ${cx - tw}, ${boxBottom}
    Z
  `;

  let innerHtml = '';
  const boxLeft = cx - w/2 + 8;
  let currentX = boxLeft;

  if (!displayTitle && types.length > 0) {
    let typeTextSvg = '';
    types.forEach((type, index) => {
      let color = '#ffffff';
      if (type === 'AC') color = '#22c55e';
      if (type === 'DC') color = '#f59e0b';
      if (type === 'HPC') color = '#ec4899';
      if (type === 'EV') color = '#3b82f6';

      typeTextSvg += `<tspan fill="${color}">${type}</tspan>`;
      if (index < types.length - 1) {
        typeTextSvg += '<tspan fill="#64748b"> | </tspan>';
      }
    });
    innerHtml += `<text x="${cx}" y="${boxTop + h/2 + 4.5}" font-family="system-ui, sans-serif" font-weight="900" font-size="11px" text-anchor="middle">${typeTextSvg}</text>`;
  } else {
    if (displayTitle) {
      innerHtml += `<text x="${currentX}" y="${boxTop + h/2 + 4.5}" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="11px">${displayTitle}</text>`;
      currentX += titleWidth + gap;

      if (types.length > 0) {
        innerHtml += `<line x1="${currentX - Math.max(gap/2, 4)}" y1="${boxTop + 6}" x2="${currentX - Math.max(gap/2, 4)}" y2="${boxBottom - 6}" stroke="#334155" stroke-width="1.5" />`;
      }
    }

    if (types.length > 0) {
      let typeTextSvg = '';
      types.forEach((type, index) => {
        let color = '#ffffff';
        if (type === 'AC') color = '#22c55e';
        if (type === 'DC') color = '#f59e0b';
        if (type === 'HPC') color = '#ec4899';
        if (type === 'EV') color = '#3b82f6';

        typeTextSvg += `<tspan fill="${color}">${type}</tspan>`;
        if (index < types.length - 1) {
          typeTextSvg += '<tspan fill="#64748b"> | </tspan>';
        }
      });
      innerHtml += `<text x="${currentX}" y="${boxTop + h/2 + 4.5}" font-family="system-ui, sans-serif" font-weight="900" font-size="11px">${typeTextSvg}</text>`;
    }
  }

  let strokeColor = '#ffffff';
  if (types.length === 1) {
    if (types[0] === 'AC') strokeColor = '#22c55e';
    else if (types[0] === 'DC') strokeColor = '#f59e0b';
    else if (types[0] === 'HPC') strokeColor = '#ec4899';
    else if (types[0] === 'EV') strokeColor = '#3b82f6';
  } else if (types.length > 1) {
    strokeColor = '#e2e8f0';
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSizeWidth} ${contentSizeHeight}" width="${contentSizeWidth}" height="${contentSizeHeight}">`,
    '<defs>',
    '<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>',
    '</filter>',
    '</defs>',
    `<path d="${tooltipPath}" fill="#0f172a" stroke="${strokeColor}" stroke-width="2" filter="url(#drop-shadow)" />`,
    innerHtml,
    '</svg>'
  ].join('');

  return { svg, width: contentSizeWidth };
}

const COMBO_KEYS = [
  [],
  ['AC'],
  ['DC'],
  ['HPC'],
  ['AC', 'DC'],
  ['AC', 'HPC'],
  ['DC', 'HPC'],
  ['AC', 'DC', 'HPC'],
  ['EV']
];

export const PIN_SVGS: Record<string, { url: string, width: number }> = {};
COMBO_KEYS.forEach(combo => {
  const result = createLiquidGlassPinSvg(combo);
  PIN_SVGS[combo.join('_')] = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(result.svg),
    width: result.width
  };
});

export function extractTypes(connections?: ChargingStationDto['connections']): string[] {
  const types = new Set<string>();
  if (!connections || !Array.isArray(connections)) return [];

  connections.forEach((c) => {
    if (c.currentType === 'HPC' || c.currentType === 'DC' || c.currentType === 'AC') {
      types.add(c.currentType);
    } else {
      const t = (c.currentType || c.connectionType || '').toUpperCase();
      const pwr = typeof c.powerKw === 'number' ? c.powerKw : 0;
      if (t.includes('HPC') || t.includes('CHADEMO') || t.includes('TESLA')) types.add('HPC');
      else if (t.includes('DC') || t.includes('CCS') || pwr > 22) types.add('DC');
      else if (t.includes('AC') || t.includes('TYPE') || t.includes('J1772') || t.includes('WALL') || (pwr > 0 && pwr <= 22)) types.add('AC');
    }
  });

  return Array.from(types).sort();
}

export function getProviderErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return 'Istasyon servisi kota sinirina takildi';
    }

    if (err.status === 502 || err.status === 503) {
      return 'Istasyon servisi gecici olarak kullanilamiyor';
    }
  }

  return 'Istasyonlar yuklenemedi';
}
