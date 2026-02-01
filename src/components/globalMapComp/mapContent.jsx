"use client";

import { useEffect, useRef } from "react";
import { MapProvider, World } from "@yanikemmenegger/react-world-map";

/*
  MapContent: Renders the World SVG and:
  - waits for the SVG to mount
  - colors each <path> based on the numeric emissions from countryData
  - applies hover glow using per-path CSS variables
  - emits onCountryClick(canonicalKeyOrLabel) when clicked
*/

function parseEmissionValue(value) {
  if (!value && value !== 0) return NaN;
  // pick first numeric group like "11,472", "1.4", "557"
  const m = String(value).match(/[\d,.]+/);
  if (!m) return NaN;
  return Number(m[0].replace(/,/g, ""));
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const s = x.toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")
  );
}
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function lerpColor(aHex, bHex, t) {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

/* color stops: calm palette (non-irritating) */
const STOPS = [
  { t: 0.0, color: "#1e40af" }, // deep blue (very low)
  { t: 0.25, color: "#0d9488" }, // teal
  { t: 0.5, color: "#f2c94c" }, // muted yellow
  { t: 0.75, color: "#8b6f47" }, // warm brown
  { t: 1.0, color: "#9b2c2c" }, // muted red (very high)
];

function colorForRatio(r) {
  if (!Number.isFinite(r)) return "#374151";
  r = Math.min(Math.max(r, 0), 1);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i], b = STOPS[i + 1];
    if (r >= a.t && r <= b.t) {
      const localT = (r - a.t) / ((b.t - a.t) || 1);
      return lerpColor(a.color, b.color, localT);
    }
  }
  return STOPS[STOPS.length - 1].color;
}

/* robust key matching: tries direct match, normalized match, stripped punctuation */
function findKeyForLabel(label, countryData) {
  if (!label) return null;
  // direct
  if (countryData[label]) return label;
  const target = label.trim().toLowerCase();
  for (const k of Object.keys(countryData)) {
    if (k.trim().toLowerCase() === target) return k;
  }
  // strip punctuation and compare
  const simple = target.replace(/[^\w\s]/g, "");
  for (const k of Object.keys(countryData)) {
    if (k.trim().toLowerCase().replace(/[^\w\s]/g, "") === simple) return k;
  }
  return null;
}

export default function MapContent({ countryData = {}, emissionStats = { min: 0, max: 1 }, onCountryClick }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mounted = true;
    let observer = null;
    const cleanupFns = [];

    // main apply function: colors paths and adds listeners
    const applyToPaths = () => {
      const svg = root.querySelector("svg");
      if (!svg) return false;

      const paths = svg.querySelectorAll("path");
      if (!paths || !paths.length) return false;

      paths.forEach((p) => {
        // determine label
        const label =
          p.getAttribute("name") ||
          p.getAttribute("data-name") ||
          p.getAttribute("aria-label") ||
          p.getAttribute("title") ||
          p.getAttribute("id") ||
          (p.dataset && (p.dataset.name || p.dataset.country)) ||
          null;

        const key = findKeyForLabel(label, countryData);
        const emission = key ? parseEmissionValue(countryData[key]?.emissions) : NaN;

        let fill;
        if (Number.isFinite(emission) && Number.isFinite(emissionStats.max) && emissionStats.max > emissionStats.min) {
          const ratio = (emission - emissionStats.min) / Math.max(1, emissionStats.max - emissionStats.min);
          fill = colorForRatio(ratio);
          p.classList.add("has-data");
          p.classList.remove("no-data");
        } else {
          fill = "#374151"; // fallback land color
          p.classList.remove("has-data");
          p.classList.add("no-data");
        }

        // set per-path style & css vars used for consistent glow
        p.style.fill = fill;
        p.style.stroke = "#1f2937";
        p.style.strokeWidth = "0.5";
        p.style.transition = "fill 260ms ease, transform 200ms ease, filter 200ms ease";
        p.style.setProperty("--map-accent", fill);
        // glow color: semi-transparent version of fill
        const [r, g, b] = hexToRgb(fill);
        p.style.setProperty("--map-accent-glow", `rgba(${r}, ${g}, ${b}, 0.55)`);

        // mouse handlers: lightweight
        const onEnter = () => {
          // apply subtle glow using the path's map-accent-glow
          p.style.filter = `drop-shadow(0 0 10px ${p.style.getPropertyValue("--map-accent-glow") || "rgba(0,0,0,0)"})`;
          p.style.strokeWidth = "1.2";
          p.style.transform = "scale(1.02)";
        };
        const onLeave = () => {
          p.style.filter = "";
          p.style.strokeWidth = "0.5";
          p.style.transform = "";
        };
        const onClick = (e) => {
          e.stopPropagation();
          const matchedKey = findKeyForLabel(label, countryData);
          // emit canonical key if available, otherwise raw label
          onCountryClick(matchedKey || label || "");
        };

        // ensure we don't duplicate listeners: remove previous clones by cloning node if already had listeners
        // but simplest approach: remove listeners (works if they were attached earlier by same function)
        p.removeEventListener("mouseenter", onEnter);
        p.removeEventListener("mouseleave", onLeave);
        p.removeEventListener("click", onClick);

        p.addEventListener("mouseenter", onEnter);
        p.addEventListener("mouseleave", onLeave);
        p.addEventListener("click", onClick);

        cleanupFns.push(() => {
          try {
            p.removeEventListener("mouseenter", onEnter);
            p.removeEventListener("mouseleave", onLeave);
            p.removeEventListener("click", onClick);
          } catch (e) {}
        });
      });

      return true;
    };

    // try apply now; else observe for SVG injection
    let applied = applyToPaths();
    if (!applied) {
      observer = new MutationObserver(() => {
        if (!mounted) return;
        const ok = applyToPaths();
        if (ok && observer) {
          observer.disconnect();
        }
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    return () => {
      mounted = false;
      if (observer) observer.disconnect();
      cleanupFns.forEach((fn) => {
        try { fn(); } catch (e) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData, emissionStats.min, emissionStats.max, onCountryClick]);

  // Render MapProvider + World (World will mount the SVG)
  return (
    <div ref={rootRef} className="w-full h-full">
      <MapProvider>
        <World className="world-map-svg w-full h-full" backgroundColor="#0b1d26" />
      </MapProvider>
    </div>
  );
}
