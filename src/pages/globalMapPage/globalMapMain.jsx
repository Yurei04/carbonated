"use client";

import { useState, useEffect } from "react";
import { MapProvider, World } from "@yanikemmenegger/react-world-map";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample country data
const countryData = {
  "United States": {
    emissions: "5,007 Mt CO₂",
    powerUsage: "3,989 TWh",
    population: "331 million",
    renewablePercent: "21%",
    perCapitaEmissions: "15.1 tonnes"
  },
  "China": {
    emissions: "11,472 Mt CO₂",
    powerUsage: "8,312 TWh",
    population: "1.4 billion",
    renewablePercent: "28%",
    perCapitaEmissions: "8.0 tonnes"
  },
  "India": {
    emissions: "2,709 Mt CO₂",
    powerUsage: "1,591 TWh",
    population: "1.4 billion",
    renewablePercent: "40%",
    perCapitaEmissions: "1.9 tonnes"
  },
  "Germany": {
    emissions: "674 Mt CO₂",
    powerUsage: "509 TWh",
    population: "83 million",
    renewablePercent: "46%",
    perCapitaEmissions: "8.1 tonnes"
  },
  "United Kingdom": {
    emissions: "330 Mt CO₂",
    powerUsage: "301 TWh",
    population: "67 million",
    renewablePercent: "43%",
    perCapitaEmissions: "4.9 tonnes"
  },
  "Japan": {
    emissions: "1,064 Mt CO₂",
    powerUsage: "943 TWh",
    population: "125 million",
    renewablePercent: "22%",
    perCapitaEmissions: "8.5 tonnes"
  },
  "Brazil": {
    emissions: "462 Mt CO₂",
    powerUsage: "625 TWh",
    population: "214 million",
    renewablePercent: "85%",
    perCapitaEmissions: "2.2 tonnes"
  },
  "Canada": {
    emissions: "557 Mt CO₂",
    powerUsage: "571 TWh",
    population: "38 million",
    renewablePercent: "68%",
    perCapitaEmissions: "14.6 tonnes"
  },
  "Australia": {
    emissions: "415 Mt CO₂",
    powerUsage: "256 TWh",
    population: "26 million",
    renewablePercent: "32%",
    perCapitaEmissions: "16.0 tonnes"
  },
  "France": {
    emissions: "301 Mt CO₂",
    powerUsage: "451 TWh",
    population: "67 million",
    renewablePercent: "24%",
    perCapitaEmissions: "4.5 tonnes"
  },
  "Russia": {
    emissions: "1,661 Mt CO₂",
    powerUsage: "1,092 TWh",
    population: "144 million",
    renewablePercent: "19%",
    perCapitaEmissions: "11.5 tonnes"
  },
  "South Korea": {
    emissions: "611 Mt CO₂",
    powerUsage: "571 TWh",
    population: "52 million",
    renewablePercent: "7%",
    perCapitaEmissions: "11.7 tonnes"
  },
  "Mexico": {
    emissions: "441 Mt CO₂",
    powerUsage: "323 TWh",
    population: "128 million",
    renewablePercent: "26%",
    perCapitaEmissions: "3.4 tonnes"
  },
  "Indonesia": {
    emissions: "619 Mt CO₂",
    powerUsage: "283 TWh",
    population: "274 million",
    renewablePercent: "12%",
    perCapitaEmissions: "2.3 tonnes"
  },
  "Saudi Arabia": {
    emissions: "582 Mt CO₂",
    powerUsage: "377 TWh",
    population: "35 million",
    renewablePercent: "0.4%",
    perCapitaEmissions: "16.6 tonnes"
  },
  "Spain": {
    emissions: "258 Mt CO₂",
    powerUsage: "259 TWh",
    population: "47 million",
    renewablePercent: "47%",
    perCapitaEmissions: "5.5 tonnes"
  },
  "Italy": {
    emissions: "323 Mt CO₂",
    powerUsage: "302 TWh",
    population: "59 million",
    renewablePercent: "41%",
    perCapitaEmissions: "5.5 tonnes"
  },
  "Netherlands": {
    emissions: "153 Mt CO₂",
    powerUsage: "112 TWh",
    population: "17 million",
    renewablePercent: "15%",
    perCapitaEmissions: "9.0 tonnes"
  },
  "Poland": {
    emissions: "319 Mt CO₂",
    powerUsage: "170 TWh",
    population: "38 million",
    renewablePercent: "16%",
    perCapitaEmissions: "8.4 tonnes"
  },
  "Turkey": {
    emissions: "391 Mt CO₂",
    powerUsage: "323 TWh",
    population: "85 million",
    renewablePercent: "44%",
    perCapitaEmissions: "4.6 tonnes"
  }
};

// Inner component that uses the map context
function MapContent({ onCountryClick }) {
  useEffect(() => {
    // Add click listener to all country paths
    const handleClick = (e) => {
      const target = e.target;
      if (target.tagName === 'path') {
        const countryName = target.getAttribute('name') || 
                           target.getAttribute('data-name') ||
                           target.getAttribute('aria-label');
        if (countryName) {
          onCountryClick(countryName);
        }
      }
    };

    // Find the SVG element and add listener
    const svgElement = document.querySelector('.world-map-svg');
    if (svgElement) {
      svgElement.addEventListener('click', handleClick);
      return () => svgElement.removeEventListener('click', handleClick);
    }
  }, [onCountryClick]);

  return <World className="world-map-svg" />;
}

export default function GlobalMapPage() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [open, setOpen] = useState(false);

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    setOpen(true);
  };

  const currentData = selectedCountry ? countryData[selectedCountry] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2b1d0e] via-[#3d2817] to-[#1a0f08] p-4 sm:p-8">
      {/* Vending Machine Frame */}
      <div className="max-w-7xl mx-auto">
        {/* Top Panel - Branding */}
        <div className="relative">
          {/* Chrome top trim */}
          <div className="h-4 bg-gradient-to-b from-[#e8e8e8] via-[#c0c0c0] to-[#a8a8a8] rounded-t-xl border-t-2 border-l-2 border-r-2 border-[#707070]"></div>
          
          {/* Main branding bar */}
          <div className="bg-gradient-to-r from-[#8b6914] via-[#d4a259] to-[#8b6914] p-6 border-x-8 border-[#4a3418] relative overflow-hidden">
            {/* Brushed metal texture overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }}></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-[0.2em] text-[#1a0f08] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.3)]" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(212,162,89,0.5)'
              }}>
                GLOBAL ENERGY
              </h1>
              <div className="text-center text-xs sm:text-sm tracking-[0.3em] text-[#2b1d0e] font-bold mt-1">
                EMISSIONS MONITOR
              </div>
            </div>

            {/* LED Indicator Lights */}
            <div className="absolute top-4 right-6 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#00ff00] to-[#00aa00] shadow-[0_0_10px_#00ff00] animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600] shadow-[0_0_10px_#ffaa00]"></div>
            </div>
          </div>
        </div>

        {/* Main Vending Machine Body */}
        <div className="bg-gradient-to-br from-[#8b7355] via-[#6d5a47] to-[#5c4a38] border-x-8 border-[#4a3418] p-8 relative">
          {/* Rivets on sides */}
          <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-around">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-[#a8a8a8] to-[#606060] shadow-inner"></div>
            ))}
          </div>
          <div className="absolute right-2 top-8 bottom-8 flex flex-col justify-around">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-[#a8a8a8] to-[#606060] shadow-inner"></div>
            ))}
          </div>

          {/* Display Screen Frame */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6 rounded-2xl border-8 border-[#2c1810] shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]">
            {/* Screen bezel effect */}
            <div className="bg-gradient-to-br from-[#1a3a52] via-[#0d2333] to-[#081420] p-1 rounded-xl">
              {/* Inner glow */}
              <div className="bg-gradient-to-br from-[#1a4a6a] to-[#0a2535] p-6 rounded-lg relative overflow-hidden">
                {/* CRT scanlines effect */}
                <div className="absolute inset-0 pointer-events-none z-20 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                }}></div>

                {/* Screen reflection */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10 rounded-t-lg"></div>

                {/* Map Container */}
                <div className="relative bg-[#0f2333] rounded-lg p-8 min-h-[400px] sm:min-h-[500px] flex items-center justify-center border-2 border-[#1a4a6a] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  <MapProvider>
                    <MapContent onCountryClick={handleCountryClick} />
                  </MapProvider>
                </div>

                {/* Status Bar */}
                <div className="mt-4 bg-black/40 rounded-lg p-3 border border-[#2a5a7a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_8px_#00ff00] animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_8px_#00ff00]" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.5s infinite'}}></div>
                      <div className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_8px_#00ff00]" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1s infinite'}}></div>
                    </div>
                    <span className="text-[#5fc9f8] text-xs font-mono tracking-wider">SYSTEM READY</span>
                  </div>
                  <div className="text-[#d4a259] text-xs font-mono tracking-wider">
                    {Object.keys(countryData).length} COUNTRIES
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instruction Panel */}
          <div className="mt-6 bg-gradient-to-r from-[#2c1810] via-[#3d2415] to-[#2c1810] rounded-xl p-4 border-4 border-[#1a0f08] shadow-lg">
            <div className="bg-gradient-to-r from-[#c99547] to-[#d4a259] rounded-lg p-3 text-center border-2 border-[#8b6914]">
              <p className="text-[#1a0f08] font-bold text-sm tracking-wide">
                ▶ SELECT A COUNTRY TO VIEW EMISSIONS DATA ◀
              </p>
            </div>
          </div>
        </div>

        {/* Bottom trim */}
        <div className="h-6 bg-gradient-to-b from-[#a8a8a8] via-[#c0c0c0] to-[#888888] rounded-b-xl border-x-8 border-b-8 border-[#4a3418]"></div>
      </div>

      {/* Data Display Dialog - styled like a vending machine selection window */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-[#2c1810] to-[#1a0f08] border-8 border-[#8b6914] rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Chrome frame */}
          <div className="h-3 bg-gradient-to-r from-[#888888] via-[#c0c0c0] to-[#888888]"></div>
          
          <div className="p-6">
            <DialogHeader>
              {/* Country display panel */}
              <div className="bg-gradient-to-r from-[#1a3a52] to-[#0d2333] rounded-xl p-1 border-4 border-[#d4a259] shadow-[0_0_20px_rgba(212,162,89,0.3)]">
                <div className="bg-black/60 rounded-lg p-4 border-2 border-[#2a5a7a]">
                  <DialogTitle className="text-3xl sm:text-4xl font-bold text-center text-[#d4a259] tracking-widest drop-shadow-[0_0_10px_rgba(212,162,89,0.8)] font-mono">
                    {selectedCountry?.toUpperCase() || "SELECT COUNTRY"}
                  </DialogTitle>
                  <div className="text-center text-[#5fc9f8] text-xs mt-2 tracking-[0.2em] font-mono">
                    DATA RETRIEVAL COMPLETE
                  </div>
                </div>
              </div>
            </DialogHeader>

            {currentData ? (
              <div className="mt-6 space-y-4">
                {/* Main data displays */}
                <div className="grid gap-4">
                  {/* Emissions Display */}
                  <div className="bg-gradient-to-br from-[#4a3418] to-[#2c1810] rounded-xl p-4 border-4 border-[#d4a259] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="bg-black/50 rounded-lg p-4 border-2 border-[#8b6914]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[#d4a259] text-xs font-bold tracking-wider mb-1">CO₂ EMISSIONS</div>
                          <div className="text-[#f4e4bc] text-3xl font-bold font-mono tracking-tight">{currentData.emissions}</div>
                        </div>
                        <div className="bg-[#8b6914] rounded-full px-3 py-1 text-xs font-bold text-[#1a0f08]">
                          TOTAL
                        </div>
                      </div>
                      <div className="h-3 bg-[#1a0f08] rounded-full overflow-hidden border-2 border-[#4a3418]">
                        <div className="h-full bg-gradient-to-r from-[#ff6b35] via-[#f7931e] to-[#d4a259] shadow-[0_0_10px_rgba(247,147,30,0.5)]" style={{width: '78%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Power Usage Display */}
                  <div className="bg-gradient-to-br from-[#0d2333] to-[#081420] rounded-xl p-4 border-4 border-[#5fc9f8] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="bg-black/50 rounded-lg p-4 border-2 border-[#2a5a7a]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[#5fc9f8] text-xs font-bold tracking-wider mb-1">POWER USAGE</div>
                          <div className="text-[#f4e4bc] text-3xl font-bold font-mono tracking-tight">{currentData.powerUsage}</div>
                        </div>
                        <div className="bg-[#2a5a7a] rounded-full px-3 py-1 text-xs font-bold text-[#5fc9f8]">
                          ANNUAL
                        </div>
                      </div>
                      <div className="h-3 bg-[#081420] rounded-full overflow-hidden border-2 border-[#1a3a52]">
                        <div className="h-full bg-gradient-to-r from-[#1e90ff] via-[#5fc9f8] to-[#00d4ff] shadow-[0_0_10px_rgba(95,201,248,0.5)]" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-[#3d2817] to-[#2c1810] rounded-lg p-3 border-3 border-[#8b7355] text-center">
                    <div className="text-[#d4a259] text-[10px] font-bold tracking-wider mb-1">POPULATION</div>
                    <div className="text-[#f4e4bc] font-bold text-sm font-mono">{currentData.population}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#3d2817] to-[#2c1810] rounded-lg p-3 border-3 border-[#8b7355] text-center">
                    <div className="text-[#5fc9f8] text-[10px] font-bold tracking-wider mb-1">RENEWABLE</div>
                    <div className="text-[#f4e4bc] font-bold text-sm font-mono">{currentData.renewablePercent}</div>
                  </div>
                </div>

                {/* Per Capita Display */}
                <div className="bg-gradient-to-r from-[#1a0f08] via-[#2c1810] to-[#1a0f08] rounded-xl p-4 border-4 border-[#c99547]">
                  <div className="text-center">
                    <div className="text-[#c99547] text-xs font-bold tracking-[0.2em] mb-2">PER CAPITA EMISSIONS</div>
                    <div className="text-[#f4e4bc] text-4xl font-bold font-mono tracking-tight drop-shadow-[0_0_10px_rgba(244,228,188,0.3)]">
                      {currentData.perCapitaEmissions}
                    </div>
                  </div>
                </div>

                {/* Return Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-4 bg-gradient-to-r from-[#8b6914] via-[#d4a259] to-[#8b6914] text-[#1a0f08] font-bold py-4 rounded-xl border-4 border-[#4a3418] hover:from-[#d4a259] hover:via-[#e5b569] hover:to-[#d4a259] transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(212,162,89,0.5)] active:scale-[0.98] text-lg tracking-wider"
                >
                  ◀ RETURN TO MAP
                </button>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-br from-[#1a3a52] to-[#0d2333] rounded-xl p-8 border-4 border-[#8b7355]">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-[#d4a259] text-lg font-bold mb-2">NO DATA AVAILABLE</p>
                  <p className="text-[#8b7355] text-sm">This country's data is not in our system</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-6 bg-gradient-to-r from-[#8b6914] via-[#d4a259] to-[#8b6914] text-[#1a0f08] font-bold py-4 rounded-xl border-4 border-[#4a3418] hover:from-[#d4a259] hover:via-[#e5b569] hover:to-[#d4a259] transition-all duration-200 text-lg tracking-wider"
                >
                  ◀ RETURN TO MAP
                </button>
              </div>
            )}
          </div>

          {/* Bottom chrome trim */}
          <div className="h-3 bg-gradient-to-r from-[#888888] via-[#c0c0c0] to-[#888888]"></div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .world-map-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
        }
        
        .world-map-svg path {
          fill: #6d5a47;
          stroke: #2c1810;
          stroke-width: 0.5;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .world-map-svg path:hover {
          fill: #d4a259;
          stroke: #f4e4bc;
          stroke-width: 1.5;
          filter: drop-shadow(0 0 8px rgba(212, 162, 89, 0.8));
          transform: scale(1.02);
          transform-origin: center;
        }

        /* Highlight countries with data */
        ${Object.keys(countryData).map(country => `
          .world-map-svg path[name="${country}"],
          .world-map-svg path[data-name="${country}"],
          .world-map-svg path[aria-label="${country}"] {
            fill: #8b6914;
            stroke: #d4a259;
            stroke-width: 0.8;
          }
          
          .world-map-svg path[name="${country}"]:hover,
          .world-map-svg path[data-name="${country}"]:hover,
          .world-map-svg path[aria-label="${country}"]:hover {
            fill: #d4a259;
            stroke: #f4e4bc;
            stroke-width: 2;
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}