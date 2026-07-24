---
layout: page
title: vCard QR Generator
permalink: /qr/
sitemap: false
---

<noscript>This page needs JavaScript to generate the QR code.</noscript>

<div class="qrgen">
  <div class="qrgen-grid">
    <form id="qrgen-form" class="qrgen-form" autocomplete="off">
      <fieldset>
        <legend>Contact</legend>
        <label>Full name <input type="text" name="fn" placeholder="Don Hotchkiss" required></label>
        <label>Title <input type="text" name="title" placeholder="Principal Account Manager"></label>
        <label>Organization <input type="text" name="org" placeholder="Analog Devices"></label>
        <label>Email <input type="email" name="email" placeholder="don.hotchkiss@analog.com"></label>
        <label>Phone <input type="tel" name="phone" placeholder="+1 972-742-0453"></label>
        <label>Website <input type="url" name="url" placeholder="https://"></label>
      </fieldset>

      <fieldset>
        <legend>Style</legend>
        <label>Initials (center plaque) <input type="text" name="initials" maxlength="3" placeholder="DH"></label>
        <label>Foreground <input type="color" name="fg" value="#111111"></label>
        <label>Background <input type="color" name="bg" value="#ffffff"></label>
        <label>Plaque color <input type="color" name="plaque" value="#111111"></label>
        <label>Initials color <input type="color" name="initialsColor" value="#ffffff"></label>
        <label class="qrgen-check"><input type="checkbox" name="useAdiLogo"> ADI logo band below QR</label>
      </fieldset>

      <div class="qrgen-actions">
        <button type="button" id="qrgen-preset-adi">Apply ADI preset</button>
        <button type="button" id="qrgen-preset-reset">Reset</button>
        <button type="button" id="qrgen-download">Download PNG</button>
      </div>
    </form>

    <div class="qrgen-preview">
      <div id="qrgen-canvas-wrap"></div>
      <details class="qrgen-debug">
        <summary>vCard text</summary>
        <pre id="qrgen-vcard"></pre>
      </details>
    </div>
  </div>
</div>

<link rel="stylesheet" href="{{ '/assets/qrgen/qrgen.css' | relative_url }}">
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
<script src="{{ '/assets/qrgen/qrgen.js' | relative_url }}" defer></script>
