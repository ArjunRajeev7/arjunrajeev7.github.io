/* ============================================================
   charts.js — monochrome SVG chart primitives (no color, ever)
   ============================================================ */

const Charts = {};

const PATTERN_IDS = ['pat-solid', 'pat-diag', 'pat-cross', 'pat-dot', 'pat-sparse', 'pat-brick'];

Charts.patternDefs = () => `
  <defs>
    <pattern id="pat-solid" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ffffff"/></pattern>
    <pattern id="pat-diag" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#000000"/><rect width="3" height="6" fill="#ffffff"/>
    </pattern>
    <pattern id="pat-cross" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#000000"/><path d="M0,0L6,6M6,0L0,6" stroke="#ffffff" stroke-width="1.4"/>
    </pattern>
    <pattern id="pat-dot" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#000000"/><circle cx="3" cy="3" r="1.6" fill="#ffffff"/>
    </pattern>
    <pattern id="pat-sparse" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#000000"/><rect width="2" height="10" fill="#ffffff"/>
    </pattern>
    <pattern id="pat-brick" width="10" height="6" patternUnits="userSpaceOnUse">
      <rect width="10" height="6" fill="#000000"/><rect width="10" height="1.4" fill="#ffffff"/><rect x="5" width="1.4" height="6" fill="#ffffff"/>
    </pattern>
  </defs>
`;

Charts.swatchCSS = (i) => [
  'repeating-linear-gradient(45deg, #fff 0 6px, #000 6px 6px)',
  'repeating-linear-gradient(45deg, #fff 0 2px, #000 2px 4px)',
  'repeating-linear-gradient(45deg, #fff 0 1px, #000 1px 3px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 3px)',
  'radial-gradient(#fff 1px, #000 1.5px)',
  'repeating-linear-gradient(90deg, #fff 0 1px, #000 1px 5px)',
  'repeating-linear-gradient(0deg, #fff 0 1.4px, #000 1.4px 6px), repeating-linear-gradient(90deg, #fff 0 1.4px, transparent 1.4px 5px)'
][i % 6];

// entries: [{label, value}]
Charts.renderDonut = function (holder, entries, opts) {
  opts = opts || {};
  entries = entries.filter(e => e.value > 0);
  const total = entries.reduce((s, e) => s + e.value, 0);
  if (!total) { holder.innerHTML = '<div class="empty-state">no data yet</div>'; return; }
  const r = opts.r || 70, cx = opts.cx || 90, cy = opts.cy || 90, strokeW = opts.strokeW || 26;
  const circumference = 2 * Math.PI * r;
  let offset = 0, arcs = '';
  entries.forEach((e, i) => {
    const len = (e.value / total) * circumference;
    arcs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${PATTERN_IDS[i % 6]})"
      stroke-width="${strokeW}" stroke-dasharray="${Math.max(len - 1.5, 0)} ${circumference - len + 1.5}"
      stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
    offset += len;
  });
  holder.innerHTML = `
    <svg width="${cx * 2}" height="${cy * 2}" viewBox="0 0 ${cx * 2} ${cy * 2}" role="img" aria-label="${opts.ariaLabel || 'donut chart'}">
      ${Charts.patternDefs()}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="${strokeW}" />
      ${arcs}
      ${opts.centerLine1 ? `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#ffffff" font-size="12" font-family="var(--mono)">${opts.centerLine1}</text>` : ''}
      ${opts.centerLine2 ? `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#9a9a9a" font-size="10" font-family="var(--mono)">${opts.centerLine2}</text>` : ''}
    </svg>
  `;
};

Charts.renderLegend = function (holder, entries) {
  holder.innerHTML = entries.map((e, i) => `
    <span style="display:inline-flex;align-items:center;gap:6px;margin-right:16px;font-size:11px;color:var(--text-dim);">
      <span style="display:inline-block;width:10px;height:10px;background:${Charts.swatchCSS(i)};border:1px solid #565656;"></span>${e.label}
    </span>
  `).join('');
};

// entries: [{label, a, b}] renders paired bars (e.g. invested vs current)
Charts.renderGroupedBar = function (holder, entries, opts) {
  opts = opts || {};
  if (!entries.length) { holder.innerHTML = '<div class="empty-state">no data yet</div>'; return; }
  const max = Math.max(...entries.map(e => Math.max(e.a, e.b)), 1);
  const barW = 90, gap = 50, chartH = 200, leftPad = 40;
  const w = leftPad + entries.length * (barW * 2 + gap);
  let bars = '';
  entries.forEach((e, i) => {
    const x = leftPad + i * (barW * 2 + gap);
    const aH = (e.a / max) * chartH, bH = (e.b / max) * chartH;
    bars += `
      <rect x="${x}" y="${chartH - aH}" width="${barW * 0.42}" height="${aH}" fill="#2b2b2b" stroke="#565656" stroke-width="1" />
      <rect x="${x + barW * 0.46}" y="${chartH - bH}" width="${barW * 0.42}" height="${bH}" fill="#ffffff" stroke="#ffffff" stroke-width="1" />
      <text x="${x + barW * 0.44}" y="${chartH + 18}" text-anchor="middle" fill="#9a9a9a" font-size="10" font-family="var(--mono)">${e.label}</text>
    `;
  });
  holder.innerHTML = `
    <svg width="100%" height="${chartH + 40}" viewBox="0 0 ${w} ${chartH + 40}" preserveAspectRatio="xMinYMid meet">
      <line x1="0" y1="${chartH}" x2="${w}" y2="${chartH}" stroke="#565656" />
      ${bars}
    </svg>
    <div style="display:flex; gap:16px; margin-top:8px; font-size:11px; color:var(--text-dim);">
      <span><span style="display:inline-block;width:9px;height:9px;background:#2b2b2b;border:1px solid #565656;margin-right:5px;"></span>${opts.labelA || 'a'}</span>
      <span><span style="display:inline-block;width:9px;height:9px;background:#fff;border:1px solid #565656;margin-right:5px;"></span>${opts.labelB || 'b'}</span>
    </div>
  `;
};

// points: [{x:number(year), y:number}], single series line/area chart
Charts.renderLineChart = function (holder, points, opts) {
  opts = opts || {};
  if (!points || points.length < 2) { holder.innerHTML = '<div class="empty-state">not enough data to project</div>'; return; }
  const w = opts.width || 720, h = opts.height || 260, padL = 74, padR = 20, padT = 20, padB = 34;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0, yMax = Math.max(...ys) * 1.08;
  const sx = (x) => padL + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const sy = (y) => padT + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const areaPath = path + ` L ${sx(xs[xs.length - 1]).toFixed(1)} ${sy(yMin).toFixed(1)} L ${sx(xMin).toFixed(1)} ${sy(yMin).toFixed(1)} Z`;

  // gridlines: 4 horizontal
  let grid = '';
  const gridN = 4;
  for (let i = 0; i <= gridN; i++) {
    const gy = padT + (plotH / gridN) * i;
    const val = yMax - (yMax / gridN) * i;
    grid += `<line x1="${padL}" y1="${gy}" x2="${w - padR}" y2="${gy}" stroke="#242424" />`;
    grid += `<text x="${padL - 10}" y="${gy + 4}" text-anchor="end" fill="#5c5c5c" font-size="10" font-family="var(--mono)">${Fmt.moneyCompact(val)}</text>`;
  }
  // x labels: every ~ N years depending on span
  const xLabelStep = Math.max(1, Math.round((xMax - xMin) / 8));
  let xLabels = '';
  for (let x = xMin; x <= xMax; x += xLabelStep) {
    xLabels += `<text x="${sx(x)}" y="${h - padB + 16}" text-anchor="middle" fill="#5c5c5c" font-size="10" font-family="var(--mono)">${opts.xLabel ? opts.xLabel(x) : x}</text>`;
  }

  const dots = points.filter((p, i) => i % Math.max(1, Math.round(points.length / 12)) === 0 || i === points.length - 1)
    .map(p => `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="2.6" fill="#ffffff" />`).join('');

  holder.innerHTML = `
    <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMinYMid meet" role="img" aria-label="${opts.ariaLabel || 'projection chart'}">
      ${grid}
      <path d="${areaPath}" fill="rgba(255,255,255,0.06)" />
      <path d="${path}" fill="none" stroke="#ffffff" stroke-width="2" />
      ${dots}
      ${xLabels}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="#565656" />
      <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="#565656" />
    </svg>
  `;
};

window.Charts = Charts;
