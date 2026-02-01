"use client";

import { useEffect, useState, useMemo } from "react";
import { MapProvider, World } from "@yanikemmenegger/react-world-map";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* -------------------------------
   Color scale based on emissions
-------------------------------- */
function getEmissionColor(value, max) {
  if (!value) return "#1e3a5f"; // no data = ocean blue

  const ratio = value / max;

  if (ratio < 0.15) return "#1e40af"; // deep blue
  if (ratio < 0.3) return "#0d9488";  // teal
  if (ratio < 0.5) return "#f2c94c";  // muted yellow
  if (ratio < 0.75) return "#8b6f47"; // warm brown
  return "#9b2c2c";                   // muted red
}

export default function GlobalMapPage() {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState({});

  /* Load dataset */
  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then(setCountryData)
      .catch(console.error);
  }, []);

  const normalize = (name) => name?.trim().toLowerCase();

  /* Find selected country data */
  const currentData =
    selectedCountry &&
    countryData[
      Object.keys(countryData).find(
        (key) => normalize(key) === normalize(selectedCountry)
      )
    ];

  /* Max emissions for normalization */
  const maxEmissions = useMemo(() => {
    return Math.max(
      ...Object.values(countryData)
        .map((c) => Number(c.emissions))
        .filter(Boolean)
    );
  }, [countryData]);

  /* Color resolver for each country */
  const getCountryStyle = (countryName) => {
    const entry =
      countryData[
        Object.keys(countryData).find(
          (key) => normalize(key) === normalize(countryName)
        )
      ];

    return getEmissionColor(Number(entry?.emissions), maxEmissions);
  };

  return (
    <div className="w-full h-full bg-transparent flex items-center justify-center">
      <MapProvider>
        <World
          className="w-full h-full"
          backgroundColor="#0b1d26"
          stroke="#e5e7eb"
          strokeWidth={0.3}

          /* Dynamic country coloring */
          fill={(country) => getCountryStyle(country)}

          hoverFill="#fde68a"
          hoverStroke="#ffffff"

          onClick={(country) => {
            setSelectedCountry(country);
            setOpen(true);
          }}
        />
      </MapProvider>

      {/* ---------------- Dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black text-white border border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-wide">
              {selectedCountry}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Carbon footprint & energy profile
            </DialogDescription>
          </DialogHeader>

          {currentData ? (
            <div className="grid gap-3 text-sm">
              <p>🌍 <strong>Emissions:</strong> {currentData.emissions} Mt CO₂</p>
              <p>⚡ <strong>Power Usage:</strong> {currentData.powerUsage}</p>
              <p>👥 <strong>Population:</strong> {currentData.population}</p>
              <p>🌱 <strong>Renewables:</strong> {currentData.renewablePercent}</p>
              <p>📊 <strong>Per Capita:</strong> {currentData.perCapitaEmissions}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No emissions data available.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
