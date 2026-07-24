(function () {
  'use strict';

  const ADI_BLUE = '#0067B9';
  const ADI_TINT = '#E6F0FA';
  const ADI_LOGO_URL = '/assets/qrgen/adi-logo.png';

  const form = document.getElementById('qrgen-form');
  const wrap = document.getElementById('qrgen-canvas-wrap');
  const vcardPre = document.getElementById('qrgen-vcard');
  const downloadBtn = document.getElementById('qrgen-download');
  const adiPresetBtn = document.getElementById('qrgen-preset-adi');
  const resetBtn = document.getElementById('qrgen-preset-reset');

  const DEFAULTS = {
    fn: '', title: '', org: '', email: '', phone: '', url: '',
    initials: '', fg: '#111111', bg: '#ffffff',
    plaque: '#111111', initialsColor: '#ffffff', useAdiLogo: false,
  };

  function readForm() {
    const fd = new FormData(form);
    return {
      fn: fd.get('fn') || '',
      title: fd.get('title') || '',
      org: fd.get('org') || '',
      email: fd.get('email') || '',
      phone: fd.get('phone') || '',
      url: fd.get('url') || '',
      initials: (fd.get('initials') || '').toUpperCase().slice(0, 3),
      fg: fd.get('fg') || DEFAULTS.fg,
      bg: fd.get('bg') || DEFAULTS.bg,
      plaque: fd.get('plaque') || DEFAULTS.plaque,
      initialsColor: fd.get('initialsColor') || DEFAULTS.initialsColor,
      useAdiLogo: fd.get('useAdiLogo') === 'on',
    };
  }

  function applyDefaults(values) {
    for (const [k, v] of Object.entries(values)) {
      const el = form.elements.namedItem(k);
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = v;
    }
    render();
  }

  function escapeVCard(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function splitName(fn) {
    const parts = (fn || '').trim().split(/\s+/);
    if (parts.length === 0) return ['', ''];
    if (parts.length === 1) return [parts[0], ''];
    return [parts[parts.length - 1], parts.slice(0, -1).join(' ')];
  }

  function buildVCard(v) {
    const [last, first] = splitName(v.fn);
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    if (v.fn)    lines.push('FN:' + escapeVCard(v.fn));
    if (v.fn)    lines.push(`N:${escapeVCard(last)};${escapeVCard(first)};;;`);
    if (v.org)   lines.push('ORG:' + escapeVCard(v.org));
    if (v.title) lines.push('TITLE:' + escapeVCard(v.title));
    if (v.email) lines.push('EMAIL;TYPE=INTERNET,WORK:' + v.email);
    if (v.phone) lines.push('TEL;TYPE=cell:' + v.phone);
    if (v.url)   lines.push('URL:' + v.url);
    lines.push('END:VCARD');
    return lines.join('\r\n') + '\r\n';
  }

  // qr-code-styling renders to an internal canvas. We grab it, then composite
  // our plaque + initials + optional ADI band on a second canvas.
  let qrLib = null;
  function buildQR(text, v) {
    qrLib = new QRCodeStyling({
      width: 800,
      height: 800,
      type: 'canvas',
      data: text,
      margin: 16,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: v.fg, type: 'rounded' },
      backgroundOptions: { color: v.bg },
      cornersSquareOptions: { color: v.fg, type: 'extra-rounded' },
      cornersDotOptions: { color: v.fg, type: 'dot' },
    });
    return qrLib;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function tightBbox(canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x; if (y < minY) minY = y;
          if (x > maxX) maxX = x; if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return { x: 0, y: 0, w: width, h: height };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  function drawRoundedRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function fitFont(ctx, text, maxW, maxH, family) {
    let size = Math.floor(maxH);
    while (size > 8) {
      ctx.font = `bold ${size}px ${family}`;
      const m = ctx.measureText(text);
      const w = m.width;
      const h = (m.actualBoundingBoxAscent || size * 0.8) + (m.actualBoundingBoxDescent || size * 0.2);
      if (w <= maxW && h <= maxH) return size;
      size -= 2;
    }
    return size;
  }

  async function compose(qrCanvas, v) {
    const qw = qrCanvas.width, qh = qrCanvas.height;

    // Optional ADI band: compute band height from logo aspect after tight crop.
    let adiImg = null, adiCrop = null;
    let bandH = 0, bandW = 0;
    const bandPadTop = -40, bandPadBot = 24;
    if (v.useAdiLogo) {
      try {
        adiImg = await loadImage(ADI_LOGO_URL);
        const tmp = document.createElement('canvas');
        tmp.width = adiImg.width; tmp.height = adiImg.height;
        tmp.getContext('2d').drawImage(adiImg, 0, 0);
        adiCrop = tightBbox(tmp);
        bandW = qw - 130;
        const ratio = bandW / adiCrop.w;
        bandH = Math.round(adiCrop.h * ratio) + bandPadTop + bandPadBot;
      } catch (e) {
        console.warn('ADI logo failed to load:', e);
      }
    }

    const out = document.createElement('canvas');
    out.width = qw;
    out.height = qh + bandH;
    const ctx = out.getContext('2d');

    // Fill canvas with the QR background color so the band blends.
    ctx.fillStyle = v.bg;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(qrCanvas, 0, 0);

    // Plaque + initials.
    if (v.initials) {
      const pw = Math.floor(qw / 4);
      const ph = Math.floor(pw * 0.82);
      const r = Math.floor(pw / 6);
      const px = Math.floor((qw - pw) / 2);
      const py = Math.floor((qh - ph) / 2);

      // Knockout under the plaque so modules don't bleed through.
      ctx.fillStyle = v.bg;
      ctx.fillRect(px, py, pw, ph);
      drawRoundedRect(ctx, px, py, pw, ph, r, v.plaque);

      const marginX = pw * 0.18, marginY = ph * 0.18;
      const size = fitFont(ctx, v.initials, pw - 2 * marginX, ph - 2 * marginY, '"Barlow", "Helvetica Neue", Arial, sans-serif');
      ctx.font = `bold ${size}px "Barlow", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = v.initialsColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v.initials, px + pw / 2, py + ph / 2 + size * 0.06);
    }

    // ADI logo band.
    if (adiImg && adiCrop && bandH > 0) {
      const ratio = bandW / adiCrop.w;
      const dh = Math.round(adiCrop.h * ratio);
      const dx = Math.floor((qw - bandW) / 2);
      const dy = qh + bandPadTop;
      ctx.drawImage(adiImg, adiCrop.x, adiCrop.y, adiCrop.w, adiCrop.h, dx, dy, bandW, dh);
    }

    return out;
  }

  let renderToken = 0;
  async function render() {
    const token = ++renderToken;
    const v = readForm();
    const text = buildVCard(v);
    vcardPre.textContent = text;

    // Build qr-code-styling canvas into a hidden host.
    const host = document.createElement('div');
    host.style.display = 'none';
    document.body.appendChild(host);
    const qr = buildQR(text, v);
    qr.append(host);

    // qr-code-styling renders async; poll briefly for the canvas.
    const qrCanvas = await new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        const c = host.querySelector('canvas');
        if (c) return resolve(c);
        if (Date.now() - start > 3000) return resolve(null);
        requestAnimationFrame(tick);
      };
      tick();
    });

    if (token !== renderToken) { host.remove(); return; }
    if (!qrCanvas) { host.remove(); return; }

    const composed = await compose(qrCanvas, v);
    if (token !== renderToken) { host.remove(); return; }

    wrap.replaceChildren(composed);
    host.remove();
    wrap.dataset.fn = v.fn;
  }

  function download() {
    const canvas = wrap.querySelector('canvas');
    if (!canvas) return;
    const v = readForm();
    const slug = (v.fn || 'vcard').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'vcard';
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${slug}_qr.png`;
    a.click();
  }

  // Wire events.
  form.addEventListener('input', () => render());

  adiPresetBtn.addEventListener('click', () => {
    applyDefaults({
      ...DEFAULTS,
      ...readForm(),  // keep contact fields
      org: readForm().org || 'Analog Devices',
      fg: ADI_BLUE,
      bg: ADI_TINT,
      plaque: ADI_BLUE,
      initialsColor: '#ffffff',
      useAdiLogo: true,
    });
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    applyDefaults(DEFAULTS);
  });

  downloadBtn.addEventListener('click', download);

  // Preload Barlow Bold so the first render uses it.
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Barlow:wght@700&display=swap';
  document.head.appendChild(fontLink);

  if (document.fonts && document.fonts.load) {
    document.fonts.load('bold 64px "Barlow"').then(render).catch(render);
  } else {
    render();
  }
})();
