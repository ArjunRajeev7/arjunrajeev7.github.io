/* ============================================================
   app.js — shared UI chrome
   ============================================================ */

const Fmt = {
  money(n, currency) {
    if (n == null || isNaN(n)) return '—';
    currency = currency || '₹';
    return (n < 0 ? '-' : '') + currency + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  },
  moneyPrecise(n, currency) {
    if (n == null || isNaN(n)) return '—';
    currency = currency || '₹';
    return (n < 0 ? '-' : '') + currency + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  gainMoney(n, currency) {
    if (n == null || isNaN(n)) return '—';
    currency = currency || '₹';
    const sign = n >= 0 ? '+' : '-';
    return sign + currency + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  },
  // compact Indian units for tight spaces (axis labels etc): ₹12.4L, ₹1.21Cr
  moneyCompact(n, currency) {
    if (n == null || isNaN(n)) return '—';
    currency = currency || '₹';
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    if (abs >= 1e7) return sign + currency + (abs / 1e7).toFixed(2) + 'Cr';
    if (abs >= 1e5) return sign + currency + (abs / 1e5).toFixed(2) + 'L';
    if (abs >= 1e3) return sign + currency + (abs / 1e3).toFixed(1) + 'k';
    return sign + currency + Math.round(abs);
  },
  pct(n) {
    if (n == null || isNaN(n)) return '—';
    const glyph = n >= 0 ? '▲' : '▼';
    return glyph + ' ' + Math.abs(n).toFixed(2) + '%';
  },
  num(n, dp) {
    if (n == null || isNaN(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: dp != null ? dp : 2 });
  },
  date(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  gainClass(n) {
    if (n == null) return '';
    return n >= 0 ? 'up' : 'down';
  }
};
window.Fmt = Fmt;

const NAV_ITEMS = [
  { href: 'index.html', label: 'dashboard' },
  { href: 'stocks-ind.html', label: 'stocks [ind]' },
  { href: 'stocks-us.html', label: 'stocks [us]' },
  { href: 'mutual-funds.html', label: 'mutual funds' },
  { href: 'fixed-deposits.html', label: 'fds' },
  { href: 'epf.html', label: 'epf' }
];

function renderTopbar(activeHref) {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <div class="brand"><span class="prompt">~/finance $</span> ${activeHref.replace('.html', '')}<span class="cursor"></span></div>
    <div class="nav-tabs">
      ${NAV_ITEMS.map(t => `<a href="${t.href}" class="${t.href === activeHref ? 'active' : ''}">${t.label}</a>`).join('')}
      <a href="#" id="settingsLink">settings</a>
    </div>
    <div class="topbar-right">
      <span class="status-chip" id="fxChip">fx —</span>
      <span class="status-chip" id="sourceChip">—</span>
      <button id="saveFileBtn" class="ghost">⇩ save to file</button>
      <button id="refreshBtn" class="ghost">↻ refresh prices</button>
    </div>
  `;
  document.getElementById('settingsLink').onclick = (e) => { e.preventDefault(); openSettingsModal(); };
  document.getElementById('refreshBtn').onclick = () => refreshPrices();
  document.getElementById('saveFileBtn').onclick = () => {
    Store.saveToFile();
    toast('data.json downloaded — replace it in your repo and commit to sync across devices', 'ok');
    updateSourceChip();
  };
  updateFxChip();
  updateSourceChip();
}
window.renderTopbar = renderTopbar;

function updateSourceChip() {
  const chip = document.getElementById('sourceChip');
  if (!chip) return;
  const src = Store.dataSource();
  const dirty = Store.isDirty();
  const label = { file: 'loaded: data.json', cache: 'loaded: browser cache', default: 'no data.json found' }[src] || src;
  chip.textContent = label + (dirty ? ' · unsaved edits' : '');
  chip.classList.toggle('err', dirty || src === 'default');
  chip.classList.toggle('ok', !dirty && src !== 'default');
}
window.updateSourceChip = updateSourceChip;

async function updateFxChip() {
  const chip = document.getElementById('fxChip');
  if (!chip) return;
  try {
    const rate = await Market.fetchUsdInr();
    chip.textContent = `USD/INR ${rate.toFixed(2)}`;
    chip.classList.add('ok'); chip.classList.remove('err');
  } catch (e) {
    chip.textContent = 'fx unavailable';
    chip.classList.add('err');
  }
}

async function refreshPrices() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.textContent = '↻ refreshing…';
  try {
    const { updated, failed } = await Market.refreshAll();
    if (updated.length) toast(`Updated ${updated.length} price(s)`, 'ok');
    if (failed.length) toast(`${failed.length} failed: ${failed.map(f => f.holding).join(', ')} — check symbol or set manually`, 'err');
    updateFxChip();
    updateSourceChip();
    window.dispatchEvent(new CustomEvent('ft-prices-updated'));
  } catch (e) {
    toast('Refresh failed: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = '↻ refresh prices';
  }
}
window.refreshPrices = refreshPrices;

function toast(msg, kind) {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    document.body.appendChild(region);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ' ' + kind : '');
  t.textContent = msg;
  region.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}
window.toast = toast;

function openModal(titleHtml, bodyHtml, onMount) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="frame-head"><span class="title">${titleHtml}</span><button class="ghost" id="modalClose">✕</button></div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  if (onMount) onMount(overlay);
  return overlay;
}
function closeModal() {
  const m = document.getElementById('activeModal');
  if (m) m.remove();
}
window.openModal = openModal;
window.closeModal = closeModal;

function openSettingsModal() {
  const s = Store.getSettings();
  openModal('settings', `
    <div class="form-field" style="margin-bottom:12px;">
      <label>Alpha Vantage API key (US stocks)</label>
      <input id="setAlphaKey" value="${s.apiKeys.alphaVantage || ''}" placeholder="paste key…" />
    </div>
    <div class="form-field" style="margin-bottom:12px;">
      <label>CORS proxy base URL (used for NSE + AMFI)</label>
      <input id="setProxy" value="${s.corsProxy || 'https://corsproxy.io/?url='}" />
    </div>
    <div class="form-field" style="margin-bottom:12px;">
      <label>Manual USD/INR override (blank = auto)</label>
      <input id="setFx" value="${s.fxOverride || ''}" placeholder="e.g. 87.5" />
    </div>
    <div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
      <button id="saveSettings">save</button>
      <button class="ghost" id="saveFileBtn2">⇩ save to file</button>
      <button class="ghost" id="reloadFileBtn">⇧ reload from file</button>
      <button class="ghost" id="importBtn">import json</button>
      <button class="danger" id="resetBtn">reset all data</button>
    </div>
    <input type="file" id="importFile" accept="application/json" style="display:none;" />
    <p style="color:var(--text-faint); font-size:11px; margin-top:14px; line-height:1.5;">
      <b>How data persists:</b> data/data.json in the site is the source of truth.
      Edits in this browser are cached locally so you don't lose work on refresh —
      but to make them show up on another device, click <b>save to file</b>, then
      replace data/data.json in your repo with the downloaded file and commit.
      <b>Reload from file</b> discards local edits and re-reads data/data.json
      (use this after you or someone else has committed a newer file).
    </p>
  `, (overlay) => {
    overlay.querySelector('#saveSettings').onclick = () => {
      Store.updateSettings({
        apiKeys: { alphaVantage: overlay.querySelector('#setAlphaKey').value.trim() },
        corsProxy: overlay.querySelector('#setProxy').value.trim(),
        fxOverride: parseFloat(overlay.querySelector('#setFx').value) || null
      });
      toast('Settings saved', 'ok');
      closeModal();
    };
    overlay.querySelector('#saveFileBtn2').onclick = () => {
      Store.saveToFile();
      toast('data.json downloaded', 'ok');
      updateSourceChip();
    };
    overlay.querySelector('#reloadFileBtn').onclick = async () => {
      if (Store.isDirty() && !confirm('This discards unsaved local edits and re-reads data/data.json. Continue?')) return;
      try {
        await Store.reloadFromFile();
        toast('Reloaded from data/data.json', 'ok');
        closeModal();
        setTimeout(() => location.reload(), 400);
      } catch (e) { toast('Reload failed: ' + e.message, 'err'); }
    };
    overlay.querySelector('#importBtn').onclick = () => overlay.querySelector('#importFile').click();
    overlay.querySelector('#importFile').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importJSON(reader.result);
          toast('Import successful', 'ok');
          closeModal();
          setTimeout(() => location.reload(), 400);
        } catch (err) { toast('Import failed: ' + err.message, 'err'); }
      };
      reader.readAsText(file);
    };
    overlay.querySelector('#resetBtn').onclick = () => {
      if (confirm('This clears the working copy in this browser (data/data.json on disk is untouched). Continue?')) {
        Store.resetAll();
        toast('Local working copy cleared', 'ok');
        closeModal();
        setTimeout(() => location.reload(), 400);
      }
    };
  });
}
window.openSettingsModal = openSettingsModal;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW registration failed', e));
  });
}
