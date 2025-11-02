import sys
from pathlib import Path

def replace_figures(input_file, output_file=None):
    # Read the markdown file
    text = Path(input_file).read_text(encoding="utf-8")

    # Replace each "FigureX" with "Figure 1", "Figure 2", ...
    counter = 1
    while "FigureX" in text:
        text = text.replace("FigureX", f"Figure {counter}", 1)
        counter += 1

    # Write to new file or overwrite
    if output_file is None:
        output_file = input_file  # overwrite by default
    Path(output_file).write_text(text, encoding="utf-8")

    print(f"Replacements complete. Wrote output to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python replace_figures.py input.md [output.md]")
    else:
        infile = sys.argv[1]
        outfile = sys.argv[2] if len(sys.argv) > 2 else None
        replace_figures(infile, outfile)
