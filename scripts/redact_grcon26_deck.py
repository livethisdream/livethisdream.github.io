"""Copy the GRCon26 solutions deck with every flag value redacted.

Usage: python3 scripts/redact_grcon26_deck.py <grcon26-ctf checkout> web/public/slides/grcon26-ctf
Then check the output by eye: flags the deck splits, encodes or draws need a
line in `fixes`.
"""
import json, pathlib, re, shutil, sys, html
ctf = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
toml = (ctf/'ctfd/challenges.toml').read_text()
vals = set()
for s in re.findall(r'"((?:[^"\\]|\\.)*)"', toml):
    m = re.fullmatch(r'flag\d*\{(.+)\}', s)
    if m: vals.add(m.group(1))
for s in re.findall(r'flag_source_match = "([^"]+)"', toml): vals.add(s)
def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if not k.startswith('_'): walk(v)
    elif isinstance(o, list):
        for x in o: walk(x)
    elif isinstance(o, str):
        m = re.fullmatch(r'flag\d*\{(.+)\}', o)
        if m: vals.add(m.group(1))
        elif k_ok(o): vals.add(o)
def k_ok(s): return 4 <= len(s) <= 60 and re.fullmatch(r'[A-Z0-9_*#\-]+', s)
for f in ctf.glob('**/flags.json'):
    if 'teque5_grcon26' in f.parts or 'nrsc5-audio-pipeline' in f.parts: continue
    walk(json.loads(f.read_text()))
vals |= {'7193960605', '719-396-0605', '(719) 396-0605', '719 396 0605', '5552600', '555-2600'}
vals = {v for v in vals if len(v) >= 4} | {v.strip('*#') for v in vals if len(v.strip('*#')) >= 4}
# Generic words that flags.json carries as non-flag fields (modulations, labels).
vals -= {'PASS', 'BPSK', 'QPSK', '8PSK', '16QAM', '2FSK', '4FSK', 'NIGHTJAR-A', 'NIGHTJAR-B'}
# Answers the prose names outright, in any case.
answers = ['Blaise Pascal', 'Pascal', 'USS Constitution', 'Uranus', 'ITU-T Q.23', 'JOHN OXENHAM']
shutil.rmtree(out, ignore_errors=True)
src = ctf/'solutions_deck'
shutil.copytree(src/'assets', out/'assets'); shutil.copytree(src/'img', out/'img')
t = (src/'index.html').read_text()
t = re.sub(r'(flag\d*)\{[^}<]+\}', r'\1{&hellip;}', t)
for v in sorted(vals, key=len, reverse=True):
    for form in {v, v.upper(), html.escape(v, quote=False)}:
        t = re.sub(r'(?<![A-Za-z0-9])' + re.escape(form) + r'(?![A-Za-z0-9])', '&hellip;', t)
for a in answers:
    t = re.sub(r'(?<![A-Za-z0-9])' + re.escape(a) + r'(?![A-Za-z0-9])', '&hellip;', t, flags=re.I)
# Author notes in comments are not part of the deck.
t = re.sub(r'<!--.*?-->\n?', '', t, flags=re.S)
# Flags the deck shows split, truncated, encoded or drawn.
fixes = [
    (r'<code>flag4\{S</code>, <code>LEEP_T</code> and <code>OKEN\}</code>',
     '<code>flag4{&hellip;</code>, <code>&hellip;</code> and <code>&hellip;}</code>'),
    (r'<code>LEEP_TOKEN\}</code>', '<code>&hellip;}</code>'),
    (r'<code>\{lost_in_the_noise_flo</code>', '<code>{&hellip;</code>'),
    (r'sayh1ba3k', '&hellip;'),
    (r'FLAGFOURIS[A-Z]+', 'FLAGFOURIS&hellip;'),
    (r'<pre><code>102108971031237384854584821019981465051125</code></pre>', '<pre><code>&hellip;</code></pre>'),
    (r'<pre><code>102 108 97 103 123 [^<]*\n[^<]*</code></pre>', '<pre><code>102 108 97 103 123 &hellip; 125\n f   l   a   g   {  &hellip;  }</code></pre>'),
    (r'(<pre><code>)\.###\.\.#[.#\n]*(</code></pre>)', r'\1&hellip;\2'),
]
for pat, rep in fixes:
    t, n = re.subn(pat, rep, t)
    assert n, pat
(out/'index.html').write_text(t)
print(len(vals), 'values;', 'left:', [v for v in vals if re.search(re.escape(v), t)])
