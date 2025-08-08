// Implement all tools logic
(function () {
  const { qs, qsa, copyText, toast } = window.$utils;

  // 1) Code Prettifier
  function initPrettifier() {
    const input = qs('#prettierInput');
    const langSel = qs('#prettierLanguage');
    const btn = qs('#btnPrettify');
    const errorEl = qs('#prettierError');

    const langToParser = {
      babel: 'babel',
      typescript: 'typescript',
      html: 'html',
      postcss: 'css',
      json: 'json',
      markdown: 'markdown'
    };

    async function handlePrettify() {
      errorEl.classList.add('hidden');
      const code = input.value;
      if (!code.trim()) return;
      try {
        const parser = langToParser[langSel.value] || 'babel';
        const plugins = window.prettierPlugins ? Object.values(window.prettierPlugins) : [];
        const formatted = await window.prettier.format(code, {
          parser,
          plugins,
          tabWidth: 2,
          semi: true,
          singleQuote: true
        });
        input.value = formatted;
        toast('Formatted');
      } catch (e) {
        console.error(e);
        errorEl.textContent = 'Formatting error: ' + (e.message || e.toString());
        errorEl.classList.remove('hidden');
      }
    }

    btn?.addEventListener('click', handlePrettify);
  }

  // 2) Color Palette Generator
  function initPalette() {
    const baseInput = qs('#paletteBaseColor');
    const grid = qs('#paletteGrid');
    const btnRandom = qs('#btnPaletteRandom');
    const btnCompl = qs('#btnPaletteComplementary');
    const btnExport = qs('#btnPaletteExport');

    function randHex() {
      return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    }

    function hexToRgb(hex) {
      const v = hex.replace('#', '');
      const r = parseInt(v.slice(0, 2), 16);
      const g = parseInt(v.slice(2, 4), 16);
      const b = parseInt(v.slice(4, 6), 16);
      return { r, g, b };
    }

    function rgbToHex(r, g, b) {
      return (
        '#' +
        [r, g, b]
          .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
          .join('')
      );
    }

    function clamp01(n) { return Math.max(0, Math.min(1, n)); }

    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h, s, l };
    }

    function hslToRgb(h, s, l) {
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    function complementary(hex) {
      const { r, g, b } = hexToRgb(hex);
      const hsl = rgbToHsl(r, g, b);
      let h2 = hsl.h + 0.5; if (h2 > 1) h2 -= 1;
      const { r: r2, g: g2, b: b2 } = hslToRgb(h2, hsl.s, hsl.l);
      return rgbToHex(r2, g2, b2);
    }

    function genPalette(base) {
      const { r, g, b } = hexToRgb(base);
      const hsl = rgbToHsl(r, g, b);
      const steps = [-0.2, -0.1, 0, 0.1, 0.2];
      return steps.map((dl) => {
        const l = clamp01(hsl.l + dl);
        const { r: rr, g: gg, b: bb } = hslToRgb(hsl.h, hsl.s, l);
        const hx = rgbToHex(rr, gg, bb);
        const rgb = `rgb(${rr}, ${gg}, ${bb})`;
        return { hex: hx, rgb };
      });
    }

    function renderPalette(colors) {
      grid.innerHTML = '';
      colors.forEach(({ hex, rgb }) => {
        const item = document.createElement('div');
        item.className = 'color-swatch';
        item.innerHTML = `
          <div class="h-24" style="background:${hex}"></div>
          <div class="meta">
            <div>
              <div class="font-medium">${hex.toUpperCase()}</div>
              <div class="text-slate-500 text-xs">${rgb}</div>
            </div>
            <button class="btn-secondary text-xs" data-copy="${hex}">Copy</button>
          </div>
        `;
        item.querySelector('[data-copy]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          copyText(hex);
        });
        item.addEventListener('click', () => copyText(hex));
        grid.appendChild(item);
      });
    }

    function ensureBase() {
      let val = baseInput.value.trim();
      if (!/^#?[0-9a-fA-F]{6}$/.test(val)) val = randHex();
      if (!val.startsWith('#')) val = '#' + val;
      baseInput.value = val;
      return val;
    }

    function refresh() {
      const base = ensureBase();
      renderPalette(genPalette(base));
    }

    baseInput?.addEventListener('change', refresh);
    btnRandom?.addEventListener('click', () => {
      baseInput.value = randHex();
      refresh();
    });
    btnCompl?.addEventListener('click', () => {
      baseInput.value = complementary(ensureBase());
      refresh();
    });
    btnExport?.addEventListener('click', () => {
      // Export current grid colors to JSON
      const data = Array.from(grid.querySelectorAll('.meta .font-medium')).map((el) => el.textContent.trim());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'palette.json'; a.click();
      URL.revokeObjectURL(url);
    });

    // initial
    refresh();
  }

  // 3) SQL ID Formatter
  function initSqlIn() {
    const input = qs('#sqlInput');
    const output = qs('#sqlOutput');
    const btn = qs('#btnSqlFormat');
    const quote = qs('#sqlQuote');
    function format() {
      const raw = input.value.split(/\r?\n|\s|,/).map((x) => x.trim()).filter(Boolean);
      const wrap = quote.checked;
      const items = raw.map((id) => (wrap ? `'${id.replace(/'/g, "''")}'` : id));
      output.value = `IN (${items.join(', ')})`;
    }
    btn?.addEventListener('click', format);
  }

  // 4) Markdown WYSIWYG
  function initMarkdown() {
    const input = qs('#mdInput');
    const preview = qs('#mdPreview');
    const btnCopy = qs('#btnCopyMarkdown');
    const btnExport = qs('#btnExportHtml');
    const toolbar = qs('#mdToolbar');

    function render() {
      try {
        const raw = input.value || '';
        const html = marked.parse(raw);
        preview.innerHTML = DOMPurify.sanitize(html);
      } catch (e) {
        preview.textContent = 'Render error: ' + (e.message || e.toString());
      }
    }

    input?.addEventListener('input', render);
    btnCopy?.addEventListener('click', () => copyText(input.value || ''));
    btnExport?.addEventListener('click', () => {
      const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Export</title></head><body>${preview.innerHTML}</body></html>`;
      const blob = new Blob([doc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'markdown-export.html'; a.click();
      URL.revokeObjectURL(url);
    });
    // Toolbar actions
    function surroundSelection(prefix, suffix = prefix, placeholder = '') {
      const el = input;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const value = el.value;
      const selected = value.slice(start, end) || placeholder;
      const before = value.slice(0, start);
      const after = value.slice(end);
      el.value = before + prefix + selected + suffix + after;
      const cursor = (before + prefix + selected + suffix).length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
      render();
    }
    function insertAtLineStart(marker) {
      const el = input;
      const pos = el.selectionStart ?? 0;
      const value = el.value;
      const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
      el.value = value.slice(0, lineStart) + marker + value.slice(lineStart);
      const cursor = pos + marker.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
      render();
    }
    function toggleList(ordered = false) {
      const el = input;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const value = el.value;
      const before = value.slice(0, start);
      const sel = value.slice(start, end);
      const after = value.slice(end);
      const lines = (sel || '').split('\n');
      const bullet = ordered ? (i) => `${i + 1}. ` : () => `- `;
      const transformed = lines
        .map((line, i) => {
          const trimmed = line.replace(/^\s*/, '');
          const already = ordered ? /^(\s*)\d+\.\s*/ : /^(\s*)(-|\*)\s*/;
          if (already.test(line)) return line;
          return bullet(i) + trimmed;
        })
        .join('\n');
      el.value = before + transformed + after;
      const cursor = (before + transformed).length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
      render();
    }
    function insertLink() {
      const el = input;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const value = el.value;
      const selected = value.slice(start, end) || 'link-text';
      const url = prompt('Enter URL', 'https://');
      if (!url) return;
      const before = value.slice(0, start);
      const after = value.slice(end);
      el.value = `${before}[${selected}](${url})${after}`;
      const cursor = (before + `[${selected}](${url})`).length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
      render();
    }
    function insertImage() {
      const alt = prompt('Image alt text', 'image');
      if (alt === null) return;
      const url = prompt('Image URL', 'https://');
      if (!url) return;
      surroundSelection(`![${alt}](${url})`, '', '');
    }
    toolbar?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-md-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-md-action');
      switch (action) {
        case 'bold': return surroundSelection('**', '**', 'bold');
        case 'italic': return surroundSelection('*', '*', 'italic');
        case 'strike': return surroundSelection('~~', '~~', 'strike');
        case 'code': return surroundSelection('`', '`', 'code');
        case 'codeblock': return surroundSelection('\n```\n', '\n```\n', 'code');
        case 'h1': return insertAtLineStart('# ');
        case 'h2': return insertAtLineStart('## ');
        case 'h3': return insertAtLineStart('### ');
        case 'ul': return toggleList(false);
        case 'ol': return toggleList(true);
        case 'quote': return insertAtLineStart('> ');
        case 'hr': return insertAtLineStart('\n\n---\n\n');
        case 'link': return insertLink();
        case 'image': return insertImage();
      }
    });
    render();
  }

  // 5) UUID Generator (v4)
  function initUuid() {
    const countEl = qs('#uuidCount');
    const out = qs('#uuidOutput');
    const btnGen = qs('#btnGenerateUuid');
    const btnCopy = qs('#btnCopyUuid');

    function uuidv4() {
      const c = crypto.getRandomValues(new Uint8Array(16));
      c[6] = (c[6] & 0x0f) | 0x40; // version 4
      c[8] = (c[8] & 0x3f) | 0x80; // variant
      const b2h = (b) => b.toString(16).padStart(2, '0');
      const parts = [
        Array.from(c.slice(0, 4)).map(b2h).join(''),
        Array.from(c.slice(4, 6)).map(b2h).join(''),
        Array.from(c.slice(6, 8)).map(b2h).join(''),
        Array.from(c.slice(8, 10)).map(b2h).join(''),
        Array.from(c.slice(10, 16)).map(b2h).join('')
      ];
      return parts.join('-');
    }

    function generate() {
      let n = parseInt(countEl.value, 10);
      if (!Number.isFinite(n) || n < 1) n = 1;
      if (n > 10000) n = 10000;
      const arr = Array.from({ length: n }).map(() => uuidv4());
      out.value = arr.join('\n');
    }

    btnGen?.addEventListener('click', generate);
    btnCopy?.addEventListener('click', () => copyText(out.value || ''));
    // initial
    generate();
  }

  // 6) String Case Converter
  function initCase() {
    const input = qs('#caseInput');
    const outputs = qs('#caseOutputs');

    const cases = [
      ['camelCase', toCamel],
      ['PascalCase', toPascal],
      ['snake_case', toSnake],
      ['kebab-case', toKebab],
      ['UPPERCASE', (s) => s.toUpperCase()],
      ['lowercase', (s) => s.toLowerCase()]
    ];

    function splitWords(s) {
      return (s || '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_\-]+/g, ' ')
        .trim()
        .split(/\s+/);
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
    function toCamel(s) {
      const w = splitWords(s).map((x) => x.toLowerCase());
      return w.map((x, i) => (i === 0 ? x : cap(x))).join('');
    }
    function toPascal(s) { return splitWords(s).map(cap).join(''); }
    function toSnake(s) { return splitWords(s).map((x) => x.toLowerCase()).join('_'); }
    function toKebab(s) { return splitWords(s).map((x) => x.toLowerCase()).join('-'); }

    function escapeAttr(val) {
      return String(val)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
    }
    function render() {
      const val = input.value || '';
      outputs.innerHTML = '';
      cases.forEach(([label, fn]) => {
        const v = fn(val);
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <label class="text-sm font-medium">${label}</label>
          <div class="mt-1 flex gap-2">
            <input class="input" value="${escapeAttr(v)}" readonly />
            <button class="btn-secondary shrink-0" data-copy="${escapeAttr(v)}">Copy</button>
          </div>
        `;
        wrap.querySelector('[data-copy]')?.addEventListener('click', () => copyText(v));
        outputs.appendChild(wrap);
      });
    }
    input?.addEventListener('input', render);
    render();
  }

  // 7) Unix Timestamp ↔ Date Converter
  function initTimestamp() {
    const tsInput = qs('#tsInput');
    const dateInput = qs('#dateInput');
    const btnTsToDate = qs('#btnTsToDate');
    const btnDateToTs = qs('#btnDateToTs');
    const btnCopyTs = qs('#btnCopyTs');
    const readable = qs('#tsReadable');
    const tsOutput = qs('#tsOutput');

    function tsToDate() {
      const raw = (tsInput.value || '').trim();
      if (!raw) return;
      let num = Number(raw);
      if (!Number.isFinite(num)) return;
      if (raw.length <= 10) num = num * 1000; // seconds to ms
      const d = new Date(num);
      if (isNaN(d.getTime())) return;
      dateInput.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
      readable.value = d.toString();
      tsOutput.value = `${Math.floor(d.getTime()/1000)} | ${d.getTime()}`;
    }

    function dateToTs() {
      const v = dateInput.value; // yyyy-MM-ddTHH:mm
      if (!v) return;
      const d = new Date(v);
      if (isNaN(d.getTime())) return;
      readable.value = d.toString();
      tsOutput.value = `${Math.floor(d.getTime()/1000)} | ${d.getTime()}`;
    }

    btnTsToDate?.addEventListener('click', tsToDate);
    btnDateToTs?.addEventListener('click', dateToTs);
    btnCopyTs?.addEventListener('click', () => copyText(tsOutput.value || ''));
  }

  // 8) JSON Prettifier / Minifier
  function initJson() {
    const input = qs('#jsonInput');
    const btnPretty = qs('#btnJsonPretty');
    const btnMin = qs('#btnJsonMinify');
    const errorEl = qs('#jsonError');

    function pretty() {
      errorEl.classList.add('hidden');
      try {
        const obj = JSON.parse(input.value);
        input.value = JSON.stringify(obj, null, 2);
      } catch (e) {
        errorEl.textContent = 'Invalid JSON: ' + (e.message || e.toString());
        errorEl.classList.remove('hidden');
      }
    }
    function minify() {
      errorEl.classList.add('hidden');
      try {
        const obj = JSON.parse(input.value);
        input.value = JSON.stringify(obj);
      } catch (e) {
        errorEl.textContent = 'Invalid JSON: ' + (e.message || e.toString());
        errorEl.classList.remove('hidden');
      }
    }

    btnPretty?.addEventListener('click', pretty);
    btnMin?.addEventListener('click', minify);
  }

  // Init all tools on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPrettifier();
      initPalette();
      initSqlIn();
      initMarkdown();
      initUuid();
      initCase();
      initTimestamp();
      initJson();
    });
  } else {
    initPrettifier();
    initPalette();
    initSqlIn();
    initMarkdown();
    initUuid();
    initCase();
    initTimestamp();
    initJson();
  }
})();

