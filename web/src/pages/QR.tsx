import { useEffect } from 'react'

const QR_STYLING_SRC = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js'
const QRGEN_SRC = '/qrgen/qrgen.js'
const QRGEN_CSS = '/qrgen/qrgen.css'

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`failed to load ${src}`))
    document.body.appendChild(s)
  })
}

function ensureStylesheet(href: string, id: string) {
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export default function QR() {
  useEffect(() => {
    ensureStylesheet(QRGEN_CSS, 'qrgen-css')
    let cancelled = false
    ;(async () => {
      try {
        await loadScript(QR_STYLING_SRC, 'qr-code-styling-lib')
        if (cancelled) return
        // Force a re-run of qrgen.js by removing any prior instance, then loading fresh.
        document.getElementById('qrgen-user-script')?.remove()
        await loadScript(QRGEN_SRC, 'qrgen-user-script')
      } catch (err) {
        console.error(err)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="article">
      <h1>vCard QR Generator</h1>

      <noscript>This page needs JavaScript to generate the QR code.</noscript>

      <div className="qrgen">
        <div className="qrgen-grid">
          <form id="qrgen-form" className="qrgen-form" autoComplete="off">
            <fieldset>
              <legend>Contact</legend>
              <label>Full name <input type="text" name="fn" placeholder="Jane Doe" required /></label>
              <label>Title <input type="text" name="title" placeholder="Account Manager" /></label>
              <label>Organization <input type="text" name="org" placeholder="Example Corp" /></label>
              <label>Email <input type="email" name="email" placeholder="jane.doe@example.com" /></label>
              <label>Phone <input type="tel" name="phone" placeholder="+1 555-555-0100" /></label>
              <label>Website <input type="url" name="url" placeholder="https://" /></label>
            </fieldset>

            <fieldset>
              <legend>Style</legend>
              <label>Initials (center plaque) <input type="text" name="initials" maxLength={3} placeholder="JD" /></label>
              <label>Foreground <input type="color" name="fg" defaultValue="#111111" /></label>
              <label>Background <input type="color" name="bg" defaultValue="#ffffff" /></label>
              <label>Plaque color <input type="color" name="plaque" defaultValue="#111111" /></label>
              <label>Initials color <input type="color" name="initialsColor" defaultValue="#ffffff" /></label>
              <label className="qrgen-check"><input type="checkbox" name="useAdiLogo" /> ADI logo band below QR</label>
            </fieldset>

            <div className="qrgen-actions">
              <button type="button" id="qrgen-preset-adi">Apply ADI preset</button>
              <button type="button" id="qrgen-preset-reset">Reset</button>
              <button type="button" id="qrgen-download">Download PNG</button>
            </div>
          </form>

          <div className="qrgen-preview">
            <div id="qrgen-canvas-wrap"></div>
            <details className="qrgen-debug">
              <summary>vCard text</summary>
              <pre id="qrgen-vcard"></pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
