"""L2 (Basic Properties and Terminology) graphics generator.

Run via ./scripts/plots.sh — a throwaway python:3.12-slim container installs
matplotlib and numpy, then executes this script. Outputs land under
assets/ece444/img/02-antenna-properties/.

Every figure uses the course palette (USAFA blue + a warm off-white
background matching the reveal.js slide theme) so the plots read as one
system with the rest of the deck.
"""

from __future__ import annotations

import os

import matplotlib.pyplot as plt
import numpy as np

# --- Palette ----------------------------------------------------------------

USAFA_BLUE = "#0067b9"
USAFA_BLUE_DARK = "#004a85"
USAFA_RED = "#b01e24"
SLIDE_BG = "#fafaf7"
INK = "#1a1a1a"
MUTED = "#5a5a5a"

# All figures share these matplotlib defaults.
plt.rcParams.update(
    {
        "figure.facecolor": SLIDE_BG,
        "axes.facecolor": SLIDE_BG,
        "savefig.facecolor": SLIDE_BG,
        "axes.edgecolor": MUTED,
        "axes.labelcolor": INK,
        "xtick.color": MUTED,
        "ytick.color": MUTED,
        "font.family": "sans-serif",
        "font.sans-serif": ["DejaVu Sans", "Arial", "sans-serif"],
        "font.size": 11,
        "axes.titlesize": 13,
        "axes.titleweight": "bold",
        "axes.titlecolor": USAFA_BLUE_DARK,
    }
)

OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "assets",
    "ece444",
    "img",
    "02-antenna-properties",
)
os.makedirs(OUT, exist_ok=True)


# --- Helpers ----------------------------------------------------------------


def uniform_af_db(theta, n=8, d_over_lambda=0.5):
    """Uniform-amplitude array-factor power pattern (dB), broadside."""
    psi = 2 * np.pi * d_over_lambda * np.sin(theta)
    with np.errstate(invalid="ignore", divide="ignore"):
        af = np.where(
            np.abs(np.sin(psi / 2)) < 1e-9,
            n,
            np.sin(n * psi / 2) / np.sin(psi / 2),
        )
    af_norm = np.abs(af) / n
    return 20 * np.log10(np.maximum(af_norm, 1e-3))


def cosine_tapered_af_db(theta, n=8, d_over_lambda=0.5):
    """Cosine-taper array-factor power pattern (dB), broadside."""
    k = np.arange(n) - (n - 1) / 2.0
    weights = np.cos(np.pi * k / n)
    weights /= weights.sum()
    theta = np.atleast_1d(theta)
    psi = 2 * np.pi * d_over_lambda * np.sin(theta)
    phase = np.exp(1j * psi[:, None] * k[None, :])
    af = phase @ weights
    af_mag = np.abs(af) / np.abs(af).max()
    return 20 * np.log10(np.maximum(af_mag, 1e-3))


def style_polar(ax, dyn_range_db=40):
    """Polar axis with a consistent look for pattern plots."""
    ax.set_theta_zero_location("N")
    ax.set_theta_direction(-1)
    ax.set_rlim(-dyn_range_db, 0)
    ax.set_rticks([-30, -20, -10, 0])
    ax.set_rlabel_position(135)
    ax.tick_params(colors=MUTED, labelsize=9)
    ax.grid(True, color="#cfd8e3", linewidth=0.7)
    ax.spines["polar"].set_color("#cfd8e3")


# --- Figure 1: annotated radiation-pattern reference -----------------------


def fig_pattern_reference():
    theta = np.linspace(-np.pi, np.pi, 2001)
    n = 8
    pattern_db = uniform_af_db(theta, n=n, d_over_lambda=0.5)

    fig = plt.figure(figsize=(7.5, 6.2))
    ax = fig.add_subplot(111, projection="polar")

    ax.plot(theta, pattern_db, color=USAFA_BLUE, linewidth=2.2)
    ax.fill(theta, pattern_db, color=USAFA_BLUE, alpha=0.08)
    style_polar(ax, dyn_range_db=40)

    # HPBW markers (roughly +/- 6.35 deg for an 8-element, d = lambda/2 array)
    hpbw_half = np.deg2rad(6.35)
    ax.plot([-hpbw_half, -hpbw_half], [-40, -3], color=USAFA_RED, linewidth=1.2, linestyle="--")
    ax.plot([hpbw_half, hpbw_half], [-40, -3], color=USAFA_RED, linewidth=1.2, linestyle="--")

    # FNBW markers (first nulls at asin(1/N) for a uniform array, ~7.18 deg for N=8)
    fnbw_half = np.arcsin(1.0 / n)

    # Callouts.
    ann = dict(
        color=INK,
        fontsize=10,
        arrowprops=dict(arrowstyle="->", color=MUTED, lw=1.0),
        ha="left",
        va="center",
        bbox=dict(boxstyle="round,pad=0.25", fc="white", ec="#cfd8e3", lw=0.7),
    )

    ax.annotate("Boresight", xy=(0, 0), xytext=(np.deg2rad(35), -8), **ann)
    ax.annotate(
        f"Main lobe\nHPBW $\\approx {np.rad2deg(2 * hpbw_half):.1f}^\\circ$\nFNBW $\\approx {np.rad2deg(2 * fnbw_half):.1f}^\\circ$",
        xy=(hpbw_half, -3),
        xytext=(np.deg2rad(55), -22),
        **ann,
    )
    ax.annotate(
        "First sidelobe\nSLL $\\approx -13$ dB",
        xy=(np.deg2rad(22), -13.3),
        xytext=(np.deg2rad(75), -18),
        **ann,
    )
    ax.annotate(
        "Back lobe\n(F/B ratio $\\approx 13$ dB)",
        xy=(np.pi - np.deg2rad(22), -13.3),
        xytext=(np.deg2rad(-140), -22),
        **ann,
    )

    ax.set_title("Reading a radiation pattern", pad=18)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "pattern-reference.png"), dpi=160)
    plt.close(fig)


# --- Figure 2: isotropic vs directional -----------------------------------


def fig_isotropic_vs_directional():
    theta = np.linspace(-np.pi, np.pi, 2001)

    fig, axes = plt.subplots(
        1, 2, figsize=(10.5, 5.0), subplot_kw={"projection": "polar"}
    )

    # Isotropic — flat 0 dB.
    iso = np.zeros_like(theta)
    axes[0].plot(theta, iso, color=USAFA_BLUE, linewidth=2.2)
    axes[0].fill(theta, iso, color=USAFA_BLUE, alpha=0.10)
    style_polar(axes[0], dyn_range_db=40)
    axes[0].set_title("Isotropic\n$D = 1$ (0 dBi)", pad=14)

    # Directional — 8-element uniform array.
    directional = uniform_af_db(theta, n=8, d_over_lambda=0.5)
    axes[1].plot(theta, directional, color=USAFA_BLUE, linewidth=2.2)
    axes[1].fill(theta, directional, color=USAFA_BLUE, alpha=0.10)
    style_polar(axes[1], dyn_range_db=40)
    axes[1].set_title("Directional\n$D \\approx 9$ dBi at boresight", pad=14)

    fig.suptitle(
        "Same total radiated power, concentrated differently",
        color=USAFA_BLUE_DARK,
        fontsize=13,
        fontweight="bold",
        y=0.98,
    )
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    fig.savefig(os.path.join(OUT, "isotropic-vs-directional.png"), dpi=160)
    plt.close(fig)


# --- Figure 3: uniform vs tapered -----------------------------------------


def fig_uniform_vs_tapered():
    theta = np.linspace(-np.pi / 2, np.pi / 2, 4001)
    uniform_db = uniform_af_db(theta, n=8, d_over_lambda=0.5)
    tapered_db = cosine_tapered_af_db(theta, n=8, d_over_lambda=0.5)

    fig, ax = plt.subplots(figsize=(9.0, 5.2))
    ax.plot(
        np.rad2deg(theta),
        uniform_db,
        color=USAFA_BLUE,
        linewidth=2.0,
        label="Uniform: narrow lobe, high sidelobes",
    )
    ax.plot(
        np.rad2deg(theta),
        tapered_db,
        color=USAFA_RED,
        linewidth=2.0,
        label="Cosine taper: wider lobe, deep sidelobes",
    )
    ax.set_xlim(-90, 90)
    ax.set_ylim(-40, 3)
    ax.set_xlabel("Angle off boresight (deg)")
    ax.set_ylabel("Normalized pattern (dB)")
    ax.set_xticks(np.arange(-90, 91, 30))
    ax.grid(True, color="#cfd8e3", linewidth=0.7)
    ax.axhline(-3, color=MUTED, linewidth=0.7, linestyle=":")
    ax.text(
        88, -3, "  −3 dB", color=MUTED, fontsize=9, ha="right", va="bottom",
    )
    ax.legend(loc="lower center", frameon=False, fontsize=10)
    ax.set_title("The narrow-beam / low-sidelobe trade")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "uniform-vs-tapered.png"), dpi=160)
    plt.close(fig)


if __name__ == "__main__":
    fig_pattern_reference()
    fig_isotropic_vs_directional()
    fig_uniform_vs_tapered()
    print(f"wrote 3 PNGs to {OUT}")
