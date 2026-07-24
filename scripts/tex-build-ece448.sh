#!/usr/bin/env bash
# Build a lesson PDF from a Beamer .tex fragment authored for ECE 448.
#
# Usage: scripts/tex-build-ece448.sh <fragment.tex> <output-name>
#
# Wraps the fragment in a minimal master.tex, points fontspec at the
# comma-free /tmp/tex-build/fonts/Barlow/ symlink, sets \graphicspath to
# the shared figures tree (+ ECE447 + ECE448 subfolders), stubs out
# Schedule_Final.tex, strips the \ifnum\lessonNum=... include/exclude
# gates so every lesson block in the fragment compiles, and runs
# lualatex twice.
#
# On success the PDF lands at:
#   assets/ece448/legacy-slides/<output-name>.pdf

set -euo pipefail

FRAG_SRC="${1:?fragment tex path required}"
OUT_NAME="${2:?output basename required}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEX_TREE="/mnt/c/Users/NRogers/OneDrive - Analog Devices, Inc/Tools/LaTeX/latex-tools"
TEX_INC="${TEX_TREE}/tex/latex"
FIG_DIR="${TEX_TREE}/figures"
FONT_SRC="${TEX_TREE}/fonts/Barlow"

# fontspec's Path= key treats commas as key separators, so we need a
# comma-free path. Symlink Barlow into /tmp once.
FONT_LINK="/tmp/tex-build/fonts/Barlow"
mkdir -p "$(dirname "$FONT_LINK")"
[[ -e "$FONT_LINK" ]] || ln -sfn "$FONT_SRC" "$FONT_LINK"

BUILD_DIR="/tmp/tex-build/${OUT_NAME}"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy fragment locally; strip the \ifnum...\fi lesson-partition blocks so
# every \begin{lessonN}...\end{lessonN} compiles.
cp "$FRAG_SRC" "$BUILD_DIR/fragment.tex"
perl -i -0pe 's/\\ifnum\\lessonNum=\d+\s*.*?\\fi(\s*\\ifnum\\lessonNum=\d+\s*.*?\\fi)*/% ifnum lesson-partition blocks stripped by tex-build-ece448.sh/gs' \
  "$BUILD_DIR/fragment.tex"

# Drop the schedule frame(s) — we don't care about the notional schedule
# in these decks, and the referenced Schedule_*.tex file isn't in the tree.
perl -i -0pe 's/(\\section\{Schedule\}\s*)?\\begin\{frame\}\{Schedule\}.*?\\end\{frame\}//gs' \
  "$BUILD_DIR/fragment.tex"

# The fragment references .\/figures\/... — point that at ECE447 (where
# the shared comms figures live for the FM deck). If the fragment lives
# in an ECE448-specific folder, we'd override this on a per-fragment
# basis, but for now ECE447 is the common case.
ln -sfn "${FIG_DIR}/ECE447" "$BUILD_DIR/figures"

# Any images that ship in the fragment's own folder go into the build
# so \includegraphics{Foo.jpg} works with the . entry in graphicspath.
FRAG_DIR="$(dirname "$FRAG_SRC")"
find "$FRAG_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.pdf" \) \
  -exec cp {} "$BUILD_DIR/" \; 2>/dev/null || true

# Stub every schedule variant the fragments pull in. Earlier fragments
# use Schedule_Prog.tex, later ones Schedule_Final.tex.
for stub in Schedule_Prog Schedule_Final Schedule; do
  cat > "$BUILD_DIR/${stub}.tex" <<'EOF'
\centering
\emph{Course schedule — see the ECE 448 syllabus.}
EOF
done

# Minimal master.
cat > "$BUILD_DIR/master.tex" <<EOF
\\documentclass[xcolor=x11names,compress]{beamer}
\\PassOptionsToPackage{hidelinks}{hyperref}
\\newif\\ifslidenums
\\slidenumstrue
\\input{myPackages_slides}
\\input{myShortcuts}
\\input{beamer_config}
\\usepackage{lscape}

\\def\\mygraphicspath{${FIG_DIR}}
\\graphicspath{{\\mygraphicspath/}{\\mygraphicspath/ECE448/}{\\mygraphicspath/ECE447/}{./}{./figures/}}

\\setsansfont[
  Path=${FONT_LINK}/,
  Extension=.ttf,
  UprightFont=*-Regular,
  BoldFont=*-Bold,
  ItalicFont=*-Italic,
  BoldItalicFont=*-BoldItalic
]{Barlow}

\\def\\thiscourse{ECE448}
\\def\\thisterm{Spring 2026}

\\title[ECE 448 (\\thisterm)]{${OUT_NAME}}
\\author[Dr. Rogers]{Dr. Neil Rogers}
\\institute[USAFA]{United States Air Force Academy \\\\ Department of Electrical and \\\\ Computer Engineering}
\\date[\\thisterm]{\\thisterm}

\\begin{document}
{\\setbeamertemplate{logo}{}\\begin{frame}[plain]\\titlepage\\end{frame}}
\\input{fragment}
\\end{document}
EOF

export TEXINPUTS=".:${TEX_INC}//:${FIG_DIR}//:"

cd "$BUILD_DIR"
echo "==> lualatex pass 1 for ${OUT_NAME}"
lualatex -interaction=nonstopmode master.tex > pass1.log 2>&1 || {
  # First pass may error on cross-refs; only bail if it produced no PDF at all.
  if [[ ! -f master.pdf ]]; then
    echo "FATAL: no PDF after pass 1. See $BUILD_DIR/pass1.log"
    tail -30 pass1.log
    exit 1
  fi
}
echo "==> lualatex pass 2 for ${OUT_NAME}"
lualatex -interaction=nonstopmode master.tex > pass2.log 2>&1 || true

if [[ ! -f master.pdf ]]; then
  echo "FATAL: no PDF after pass 2. See $BUILD_DIR/pass2.log"
  tail -30 pass2.log
  exit 1
fi

DEST="${REPO_ROOT}/assets/ece448/legacy-slides/${OUT_NAME}.pdf"
cp master.pdf "$DEST"
echo "==> wrote ${DEST}"
echo "    $(pdfinfo master.pdf 2>/dev/null | awk '/^Pages:/ {print $2 " pages"}') · $(du -h master.pdf | awk '{print $1}')"
