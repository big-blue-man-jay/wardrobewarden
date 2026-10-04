/**
 * Simple generated SVG garments for the demo closet. Each drawing is a flat-lay
 * silhouette on a 200×200 canvas with a transparent background (the "cutout").
 */

export type GarmentShape =
  | 'tshirt'
  | 'longsleeve'
  | 'shirt'
  | 'sweater'
  | 'hoodie'
  | 'cardigan'
  | 'trousers'
  | 'jeans'
  | 'skirt'
  | 'dress'
  | 'coat'
  | 'blazer'
  | 'sneakers'
  | 'boots'
  | 'loafers'
  | 'tote'
  | 'crossbody'
  | 'scarf'
  | 'beanie'
  | 'sunglasses'
  | 'belt'
  | 'watch';

export type Fill =
  | { kind: 'solid'; color: string }
  | { kind: 'stripes'; color: string; stripe: string }
  | { kind: 'floral'; color: string; dots: string[] };

export interface GarmentSpec {
  shape: GarmentShape;
  fill: Fill;
  /** Secondary color for soles, buckles, straps… */
  accent?: string;
}

/** Lighten (amt > 0) or darken (amt < 0) a hex color. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => {
    const c = (n >> shift) & 0xff;
    const v = amt < 0 ? c * (1 + amt) : c + (255 - c) * amt;
    return Math.round(Math.min(255, Math.max(0, v)));
  };
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 0xff) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
}

function lineColor(base: string): string {
  return luminance(base) > 0.8 ? '#cfcac1' : shade(base, -0.28);
}

function detailColor(base: string): string {
  return luminance(base) < 0.25 ? shade(base, 0.25) : shade(base, -0.2);
}

const LONG_SLEEVE_BODY =
  'M70 30 L52 36 Q40 50 35 70 L22 160 L42 164 L58 96 L58 174 L142 174 L142 96 L158 164 L178 160 L165 70 Q160 50 148 36 L130 30 Q100 50 70 30 Z';

function shapeSvg(shape: GarmentShape, base: string, accent: string, P: string): string {
  const L = lineColor(base);
  const D = detailColor(base);
  const stroke = `stroke="${L}" stroke-width="2" stroke-linejoin="round"`;
  const det = (w = 2) => `fill="none" stroke="${D}" stroke-width="${w}" stroke-linecap="round"`;
  switch (shape) {
    case 'tshirt':
      return `<path d="M70 30 L52 36 L22 62 L40 86 L58 74 L58 172 L142 172 L142 74 L160 86 L178 62 L148 36 L130 30 Q100 50 70 30 Z" fill="${P}" ${stroke}/>
        <path d="M74 32 Q100 48 126 32" ${det()}/>`;
    case 'longsleeve':
      return `<path d="${LONG_SLEEVE_BODY}" fill="${P}" ${stroke}/><path d="M74 32 Q100 48 126 32" ${det()}/>`;
    case 'shirt':
      return `<path d="${LONG_SLEEVE_BODY}" fill="${P}" ${stroke}/>
        <path d="M70 30 L100 50 L84 62 Z M130 30 L100 50 L116 62 Z" fill="${P}" ${stroke}/>
        <path d="M100 52 L100 172" ${det()}/>
        ${[70, 92, 114, 136, 158].map((y) => `<circle cx="106" cy="${y}" r="2.6" fill="${D}"/>`).join('')}
        <path d="M68 78 L88 78 L88 96 L68 96 Z" ${det()}/>`;
    case 'sweater':
      return `<path d="${LONG_SLEEVE_BODY}" fill="${P}" ${stroke}/>
        <path d="M74 32 Q100 50 126 32" fill="none" stroke="${D}" stroke-width="5"/>
        <path d="M58 160 L142 160 M24 150 L43 153 M176 150 L157 153" fill="none" stroke="${D}" stroke-width="3"/>
        ${[66, 76, 86, 96, 106, 116, 126, 136].map((x) => `<path d="M${x} 162 L${x} 172" ${det(1.2)}/>`).join('')}`;
    case 'hoodie':
      return `<path d="M76 30 Q72 6 100 6 Q128 6 124 30 Z" fill="${shade(base, -0.08)}" ${stroke}/>
        <path d="${LONG_SLEEVE_BODY}" fill="${P}" ${stroke}/>
        <path d="M76 30 Q100 56 124 30" ${det()}/>
        <path d="M92 44 L90 76 M108 44 L110 76" ${det()}/>
        <path d="M70 124 L130 124 L140 158 L60 158 Z" ${det()}/>`;
    case 'cardigan':
      return `<path d="${LONG_SLEEVE_BODY}" fill="${P}" ${stroke}/>
        <path d="M70 30 L100 100 L130 30" ${det()}/>
        <path d="M100 100 L100 174" ${det()}/>
        ${[112, 130, 148].map((y) => `<circle cx="106" cy="${y}" r="3" fill="${accent}"/>`).join('')}
        <path d="M58 162 L142 162" fill="none" stroke="${D}" stroke-width="3"/>`;
    case 'trousers':
    case 'jeans': {
      const seam = shape === 'jeans' ? accent : D;
      const dash = shape === 'jeans' ? 'stroke-dasharray="4 3"' : '';
      return `<path d="M60 18 L140 18 L148 184 L110 184 L100 72 L90 184 L52 184 Z" fill="${P}" ${stroke}/>
        <path d="M60 32 L140 32" fill="none" stroke="${seam}" stroke-width="2" ${dash}/>
        <path d="M100 32 L100 70" fill="none" stroke="${seam}" stroke-width="2" ${dash}/>
        <path d="M64 34 Q76 58 92 36 M136 34 Q124 58 108 36" fill="none" stroke="${seam}" stroke-width="2" ${dash}/>
        ${shape === 'trousers' ? `<path d="M76 70 L72 182 M124 70 L128 182" ${det(1.2)}/>` : ''}
        ${[66, 100, 134].map((x) => `<rect x="${x - 3}" y="16" width="6" height="18" rx="1" fill="none" stroke="${seam}" stroke-width="1.5"/>`).join('')}`;
    }
    case 'skirt':
      return `<path d="M68 34 L132 34 L156 166 L44 166 Z" fill="${P}" ${stroke}/>
        <path d="M68 34 L132 34 L132 48 L68 48 Z" fill="${shade(base, -0.08)}" ${stroke}/>
        <path d="M84 48 L74 166 M100 48 L100 166 M116 48 L126 166" ${det(1.3)}/>`;
    case 'dress':
      return `<path d="M78 16 L90 14 Q100 30 110 14 L122 16 L136 26 L148 50 L132 58 L124 46 L120 82 L156 186 L44 186 L80 82 L76 46 L68 58 L52 50 L64 26 Z" fill="${P}" ${stroke}/>
        <path d="M80 82 Q100 90 120 82" ${det()}/>`;
    case 'coat':
      return `<path d="M70 24 L50 32 Q38 48 34 70 L20 172 L42 176 L58 96 L56 190 L144 190 L142 96 L158 176 L180 172 L166 70 Q162 48 150 32 L130 24 L100 40 Z" fill="${P}" ${stroke}/>
        <path d="M70 24 L84 70 L100 40 M130 24 L116 70 L100 40" fill="${shade(base, -0.06)}" ${stroke}/>
        <path d="M100 40 L100 190" ${det()}/>
        ${[96, 126, 156].map((y) => `<circle cx="90" cy="${y}" r="3.2" fill="${accent}"/><circle cx="110" cy="${y}" r="3.2" fill="${accent}"/>`).join('')}
        <path d="M64 140 L84 140 M116 140 L136 140" ${det()}/>`;
    case 'blazer':
      return `<path d="M70 26 L50 34 Q38 50 34 72 L22 164 L42 168 L58 96 L58 170 L142 170 L142 96 L158 168 L178 164 L166 72 Q162 50 150 34 L130 26 L100 46 Z" fill="${P}" ${stroke}/>
        <path d="M70 26 L90 112 L100 46 M130 26 L110 112 L100 46" fill="${shade(base, -0.07)}" ${stroke}/>
        <path d="M100 112 L100 170" ${det()}/>
        <circle cx="104" cy="126" r="3.2" fill="${accent}"/>
        <path d="M64 136 L86 136 M114 136 L136 136 M116 84 L132 84" ${det()}/>`;
    case 'sneakers':
      return `<g transform="translate(0 -12)">
        <path d="M28 130 Q28 100 58 96 L92 92 Q104 70 128 72 L146 76 Q166 88 172 116 L174 132 Z" fill="${P}" ${stroke}/>
        <path d="M24 130 L176 130 Q178 144 170 146 L30 146 Q22 144 24 130 Z" fill="${accent}" stroke="${lineColor(accent)}" stroke-width="2"/>
        <path d="M96 94 L110 106 M104 86 L118 98 M112 80 L126 92" ${det()}/>
        <path d="M44 116 Q90 118 130 104" ${det(1.4)}/>
      </g>
      <g transform="translate(10 34) scale(0.9)" opacity="0.95">
        <path d="M28 130 Q28 100 58 96 L92 92 Q104 70 128 72 L146 76 Q166 88 172 116 L174 132 Z" fill="${P}" ${stroke}/>
        <path d="M24 130 L176 130 Q178 144 170 146 L30 146 Q22 144 24 130 Z" fill="${accent}" stroke="${lineColor(accent)}" stroke-width="2"/>
        <path d="M96 94 L110 106 M104 86 L118 98 M112 80 L126 92" ${det()}/>
      </g>`;
    case 'boots':
      return `<path d="M58 24 L112 24 L114 112 Q164 116 174 146 L174 166 L58 166 Z" fill="${P}" ${stroke}/>
        <path d="M54 166 L178 166 L178 180 L54 180 Z" fill="${accent}" stroke="${lineColor(accent)}" stroke-width="2"/>
        <path d="M58 38 L112 38" ${det()}/>
        <path d="M112 60 L130 60 L130 108" ${det(1.4)}/>`;
    case 'loafers':
      return `<g transform="translate(0 -18)">
        <path d="M28 132 Q32 106 76 104 L128 98 Q164 102 172 128 L172 138 L28 138 Z" fill="${P}" ${stroke}/>
        <path d="M24 138 L176 138 L176 146 L24 146 Z" fill="${accent}"/>
        <path d="M110 102 Q124 116 146 106" ${det()}/>
      </g>
      <g transform="translate(14 32) scale(0.88)">
        <path d="M28 132 Q32 106 76 104 L128 98 Q164 102 172 128 L172 138 L28 138 Z" fill="${P}" ${stroke}/>
        <path d="M24 138 L176 138 L176 146 L24 146 Z" fill="${accent}"/>
        <path d="M110 102 Q124 116 146 106" ${det()}/>
      </g>`;
    case 'tote':
      return `<path d="M72 82 Q72 26 100 26 Q128 26 128 82" fill="none" stroke="${shade(base, -0.2)}" stroke-width="7"/>
        <path d="M44 80 L156 80 L166 180 L34 180 Z" fill="${P}" ${stroke}/>
        <path d="M44 94 L156 94" ${det(1.4)}/>`;
    case 'crossbody':
      return `<path d="M58 100 Q40 20 100 16 Q160 20 142 100" fill="none" stroke="${shade(base, -0.2)}" stroke-width="4"/>
        <rect x="46" y="96" width="108" height="76" rx="14" fill="${P}" ${stroke}/>
        <path d="M46 112 Q100 146 154 112" fill="${shade(base, -0.06)}" ${stroke}/>
        <circle cx="100" cy="128" r="5" fill="${accent}"/>`;
    case 'scarf':
      return `<path d="M58 20 Q74 14 88 20 L96 170 Q82 176 66 170 Z" fill="${P}" ${stroke}/>
        <path d="M104 30 Q120 24 136 30 L142 160 Q126 166 110 160 Z" fill="${P}" ${stroke}/>
        <path d="M56 20 Q100 50 140 30" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round" opacity="0.5"/>
        ${[68, 74, 80, 86, 92].map((x) => `<path d="M${x} 172 L${x} 186" ${det(1.5)}/>`).join('')}
        ${[112, 118, 124, 130, 136].map((x) => `<path d="M${x} 162 L${x} 176" ${det(1.5)}/>`).join('')}`;
    case 'beanie':
      return `<path d="M44 130 Q44 44 100 44 Q156 44 156 130 Z" fill="${P}" ${stroke}/>
        <circle cx="100" cy="38" r="14" fill="${P}" ${stroke}/>
        <rect x="38" y="124" width="124" height="34" rx="6" fill="${shade(base, -0.08)}" ${stroke}/>
        ${[52, 64, 76, 88, 100, 112, 124, 136, 148].map((x) => `<path d="M${x} 128 L${x} 154" ${det(1.2)}/>`).join('')}`;
    case 'sunglasses':
      return `<path d="M30 92 Q30 80 44 80 L84 80 Q94 80 92 94 L88 118 Q86 132 70 132 L52 132 Q36 132 34 118 Z" fill="${P}" stroke="${accent}" stroke-width="5"/>
        <path d="M170 92 Q170 80 156 80 L116 80 Q106 80 108 94 L112 118 Q114 132 130 132 L148 132 Q164 132 166 118 Z" fill="${P}" stroke="${accent}" stroke-width="5"/>
        <path d="M92 90 Q100 82 108 90" fill="none" stroke="${accent}" stroke-width="5"/>
        <path d="M44 92 L60 92" stroke="#ffffff" stroke-width="3" opacity="0.35" stroke-linecap="round"/>`;
    case 'belt':
      return `<path d="M20 88 L160 88 Q180 88 180 100 Q180 112 160 112 L20 112 Z" fill="${P}" ${stroke}/>
        <rect x="128" y="80" width="30" height="40" rx="4" fill="none" stroke="${accent}" stroke-width="5"/>
        <path d="M128 100 L150 100" stroke="${accent}" stroke-width="4"/>
        ${[50, 66, 82].map((x) => `<circle cx="${x}" cy="100" r="2.6" fill="${D}"/>`).join('')}`;
    case 'watch':
      return `<rect x="80" y="16" width="40" height="168" rx="12" fill="${P}" ${stroke}/>
        <circle cx="100" cy="100" r="36" fill="${accent}" stroke="${lineColor(accent)}" stroke-width="3"/>
        <circle cx="100" cy="100" r="29" fill="#f7f5f0"/>
        <path d="M100 100 L100 80 M100 100 L114 106" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>`;
  }
}

function fillDefs(fill: Fill): { defs: string; paint: string } {
  if (fill.kind === 'solid') return { defs: '', paint: fill.color };
  if (fill.kind === 'stripes') {
    return {
      defs: `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="${fill.color}"/><rect width="12" height="5" fill="${fill.stripe}"/></pattern>`,
      paint: 'url(#p)',
    };
  }
  const [a, b, c] = fill.dots;
  return {
    defs: `<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="${fill.color}"/>
      <circle cx="6" cy="6" r="3.5" fill="${a}"/><circle cx="20" cy="18" r="4" fill="${b ?? a}"/>
      <circle cx="22" cy="5" r="1.8" fill="${c ?? a}"/><circle cx="8" cy="22" r="2" fill="${c ?? a}"/></pattern>`,
    paint: 'url(#p)',
  };
}

/** The transparent cutout. */
export function garmentSvg(spec: GarmentSpec): string {
  const { defs, paint } = fillDefs(spec.fill);
  const accent = spec.accent ?? shade(spec.fill.color, -0.35);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="600" height="600">
    <defs>${defs}</defs>${shapeSvg(spec.shape, spec.fill.color, accent, paint)}</svg>`;
}

/** A fake "original photo": the garment lying on a bedspread/floor backdrop. */
export function garmentPhotoSvg(spec: GarmentSpec, backdrop: string): string {
  const { defs, paint } = fillDefs(spec.fill);
  const accent = spec.accent ?? shade(spec.fill.color, -0.35);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="600" height="720">
    <defs>${defs}
      <radialGradient id="light" cx="35%" cy="25%" r="90%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
      </radialGradient>
      <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.3"/></filter>
    </defs>
    <rect width="200" height="240" fill="${backdrop}"/>
    ${[30, 80, 130, 180, 230].map((y) => `<path d="M0 ${y} Q100 ${y + 8} 200 ${y - 4}" stroke="${shade(backdrop, -0.08)}" stroke-width="10" fill="none" opacity="0.5"/>`).join('')}
    <g transform="translate(0 20)" filter="url(#sh)">${shapeSvg(spec.shape, spec.fill.color, accent, paint)}</g>
    <rect width="200" height="240" fill="url(#light)"/></svg>`;
}

export function svgBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml' });
}
