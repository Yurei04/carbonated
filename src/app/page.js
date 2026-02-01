"use client";

import { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// TopoJSON URL for world map
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* -------------------------------
   Browser Extension Drinks Data
-------------------------------- */
const extensionDrinks = [
  {
    id: "D1",
    name: "Carbonated Juice",
    category: "ENVIRONMENTAL IMPACT",
    icon: "🧃",
    color: "bg-gradient-to-br from-green-600 to-emerald-800",
    borderColor: "border-green-500",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%2316a34a' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🧃%3C/text%3E%3C/svg%3E",
    purpose: "Rate website environmental impact with real-time sustainability scoring",
    features: [
      "🌍 Real-time carbon footprint analysis",
      "📊 Environmental impact ratings per website",
      "♻️ Sustainability scoring system",
      "📈 Track your browsing eco-impact",
      "🌱 Green website recommendations"
    ],
    useCases: [
      "Monitor carbon cost of web browsing",
      "Choose eco-friendly websites",
      "Track environmental impact data",
      "Make sustainable browsing choices"
    ],
    downloadLink: "#carbonated-juice-extension",
    technicalSpecs: [
      "Real-time emissions calculation",
      "Per-page sustainability metrics",
      "Cumulative impact tracking",
      "Green hosting detection"
    ]
  },
  {
    id: "D2",
    name: "Carbonated Pop",
    category: "CARBON TRACKING",
    icon: "🥤",
    color: "bg-gradient-to-br from-blue-600 to-cyan-800",
    borderColor: "border-blue-500",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%232563eb' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🫧%3C/text%3E%3C/svg%3E",
    purpose: "Track website carbon footprint per second with live monitoring",
    features: [
      "⏱️ Per-second carbon tracking",
      "📡 Live monitoring dashboard",
      "💾 Historical data storage",
      "🔔 High-emission alerts",
      "📊 Detailed analytics graphs"
    ],
    useCases: [
      "Monitor real-time carbon output",
      "Track emissions per second",
      "Analyze browsing patterns",
      "Set carbon usage goals"
    ],
    downloadLink: "#carbonated-pop-extension",
    technicalSpecs: [
      "Second-by-second tracking",
      "WebNavigation API integration",
      "Persistent data storage",
      "Cross-tab monitoring"
    ]
  },
  {
    id: "D3",
    name: "Carbonated Coffee",
    category: "MINDFUL BROWSING",
    icon: "☕",
    color: "bg-gradient-to-br from-purple-600 to-indigo-800",
    borderColor: "border-purple-500",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%239333ea' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🎭%3C/text%3E%3C/svg%3E",
    purpose: "Covers websites with a privacy curtain to prevent overuse and protect privacy",
    features: [
      "☕ Instant privacy curtain overlay",
      "⏰ Time-based website blocking",
      "🔒 Prevent mindless browsing",
      "📱 Customizable blocked sites list",
      "💪 Build healthier browsing habits"
    ],
    useCases: [
      "Block distracting websites",
      "Reduce screen time naturally",
      "Protect privacy with curtain",
      "Create mindful browsing pauses"
    ],
    downloadLink: "#privacy-curtain-extension",
    technicalSpecs: [
      "Document-start injection",
      "Custom CSS curtain overlay",
      "Site-specific configurations",
      "Manual override options"
    ]
  }
];


/* -------------------------------
   Parse emissions value
-------------------------------- */
function parseEmissions(emissionsStr) {
  if (!emissionsStr) return 0;
  const match = emissionsStr.match(/([\d,]+)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ''));
}

/* -------------------------------
   Emission color scale
-------------------------------- */
function getEmissionColor(value, max) {
  if (!value || max === 0) return "#1a2332";
  const ratio = value / max;
  if (ratio < 0.15) return "#0ea5e9";
  if (ratio < 0.3) return "#22d3ee";
  if (ratio < 0.5) return "#fbbf24";
  if (ratio < 0.75) return "#f97316";
  return "#dc2626";
}

export default function HomePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensedItem, setDispensedItem] = useState(null);
  const [showDrinks, setShowDrinks] = useState(false);
  
  // World map states
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countryData, setCountryData] = useState({});
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Extension dialog state
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);

  // Live dashboard states
  const [liveStats, setLiveStats] = useState({
    totalEmissions: 0,
    activeCountries: 0,
    avgPerCapita: 0,
    renewablePercent: 0,
    totalPower: 0
  });

  /* Load country emissions dataset */
  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Loaded country data:", Object.keys(data).length, "countries");
        setCountryData(data);
      })
      .catch((error) => {
        console.error("❌ Error loading country data:", error);
      });
  }, []);

  /* Calculate live stats from country data */
  useEffect(() => {
    if (Object.keys(countryData).length === 0) return;

    const countries = Object.values(countryData);
    
    // Calculate total emissions
    const totalEmissions = countries.reduce((sum, country) => {
      return sum + parseEmissions(country.emissions);
    }, 0);

    // Calculate average per capita
    const validPerCapita = countries
      .map(c => parseFloat(c.perCapitaEmissions))
      .filter(val => !isNaN(val));
    const avgPerCapita = validPerCapita.length > 0
      ? validPerCapita.reduce((a, b) => a + b, 0) / validPerCapita.length
      : 0;

    // Calculate average renewable percentage
    const validRenewable = countries
      .map(c => parseFloat(c.renewablePercent))
      .filter(val => !isNaN(val));
    const avgRenewable = validRenewable.length > 0
      ? validRenewable.reduce((a, b) => a + b, 0) / validRenewable.length
      : 0;

    // Calculate total power
    const totalPower = countries.reduce((sum, country) => {
      const match = country.powerUsage?.match(/([\d,]+)/);
      if (!match) return sum;
      return sum + parseFloat(match[1].replace(/,/g, ''));
    }, 0);

    setLiveStats({
      totalEmissions: Math.round(totalEmissions),
      activeCountries: countries.length,
      avgPerCapita: avgPerCapita.toFixed(1),
      renewablePercent: avgRenewable.toFixed(1),
      totalPower: Math.round(totalPower)
    });
  }, [countryData]);

  /* Animated counter effect */
  const [displayStats, setDisplayStats] = useState(liveStats);
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayStats(prev => ({
        totalEmissions: prev.totalEmissions + Math.floor(Math.random() * 3 - 1),
        activeCountries: liveStats.activeCountries,
        avgPerCapita: (parseFloat(prev.avgPerCapita) + (Math.random() * 0.2 - 0.1)).toFixed(1),
        renewablePercent: liveStats.renewablePercent,
        totalPower: prev.totalPower + Math.floor(Math.random() * 10 - 5)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [liveStats]);

  const normalize = (name) => name?.trim().toLowerCase();

  const currentData = useMemo(() => {
    if (!selectedCountry || Object.keys(countryData).length === 0) return null;
    const key = Object.keys(countryData).find(
      (key) => normalize(key) === normalize(selectedCountry)
    );
    return key ? countryData[key] : null;
  }, [selectedCountry, countryData]);

  const maxEmissions = useMemo(() => {
    const emissions = Object.values(countryData)
      .map((c) => parseEmissions(c.emissions))
      .filter(Boolean);
    return emissions.length > 0 ? Math.max(...emissions) : 1;
  }, [countryData]);

  const getCountryFill = (geo) => {
    const countryName = geo.properties.name;
    const entry = countryData[
      Object.keys(countryData).find(
        (key) => normalize(key) === normalize(countryName)
      )
    ];
    const emissionValue = parseEmissions(entry?.emissions);
    return getEmissionColor(emissionValue, maxEmissions);
  };

  const items = [
    {
      id: "A1",
      title: "Home",
      icon: "🏠",
      color: "from-blue-500 to-blue-700",
      type: "page"
    },
    {
      id: "A2",
      title: "Extensions",
      icon: "🥤",
      color: "from-red-500 to-red-700",
      type: "drinks"
    },
    {
      id: "A3",
      title: "AI Chat",
      icon: "🤖",
      color: "from-blue-600 to-blue-800",
      type: "locked"
    },
    {
      id: "A4",
      title: "World Map",
      icon: "🌍",
      color: "from-red-600 to-red-800",
      type: "page"
    },
    {
      id: "A5",
      title: "Dashboard",
      icon: "📊",
      color: "from-blue-700 to-blue-900",
      type: "page"
    }
  ];

  const handleSelection = (item) => {
    if (item.type === "locked") return;
    
    if (item.type === "drinks") {
      setShowDrinks(true);
      setSelectedItem(item);
      setIsDispensing(true);
      
      setTimeout(() => {
        setDispensedItem(item);
        setIsDispensing(false);
      }, 1500);
      return;
    }

    setShowDrinks(false);
    setSelectedItem(item);
    setIsDispensing(true);
    
    setTimeout(() => {
      setDispensedItem(item);
      setIsDispensing(false);
    }, 1500);
  };

  const resetVending = () => {
    setDispensedItem(null);
    setSelectedItem(null);
    setShowDrinks(false);
    setHoveredCountry(null);
  };

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    console.log("🗺️ Country clicked:", countryName);
    setSelectedCountry(countryName);
    setCountryDialogOpen(true);
  };

  const handleExtensionClick = (extension) => {
    setSelectedExtension(extension);
    setExtensionDialogOpen(true);
  };

  const renderContent = () => {
    if (!dispensedItem) return null;

    if (showDrinks) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🥤</div>
            <h2 className="text-4xl font-black text-white mb-2">
              BROWSER EXTENSIONS
            </h2>
            <p className="text-gray-400">Select your productivity boost</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {extensionDrinks.map((drink) => (
              <button
                key={drink.id}
                onClick={() => handleExtensionClick(drink)}
                className="relative group cursor-pointer"
              >
                <div className={`
                  bg-gradient-to-br from-gray-800 to-gray-900
                  rounded-2xl p-6 border-2 transition-all
                  border-white/20 hover:border-white/60 hover:scale-105
                `}>
                  <div className="relative mb-4">
                    <div className={`
                      w-24 h-32 mx-auto rounded-lg ${drink.color}
                      flex items-center justify-center text-5xl
                      shadow-lg border-4 border-white/30
                      group-hover:scale-110 transition-transform
                    `}>
                      {drink.icon}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-500 mb-1">{drink.id}</div>
                    <h3 className="text-lg font-black text-white mb-1">{drink.name}</h3>
                    <div className="text-xs text-gray-400 font-mono">{drink.category}</div>
                    <div className="text-green-400 text-xs font-bold mt-2">CLICK FOR INFO</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    switch (dispensedItem.id) {
      case "A1":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-4xl font-black text-white mb-2">
                WELCOME HOME
              </h2>
              <p className="text-gray-400">Your digital hub</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "⚡", title: "FAST", desc: "Lightning speed" },
                { icon: "🛡️", title: "SECURE", desc: "Protected data" },
                { icon: "🚀", title: "POWERFUL", desc: "Advanced tools" }
              ].map((feature, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-blue-500/30">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-black text-blue-400 mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "A3":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-4xl font-black text-white mb-2">
                AI CHATBOT
              </h2>
              <p className="text-gray-400">24/7 Assistant</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border-2 border-blue-500/30">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-bold text-white text-sm">ONLINE</span>
              </div>
              <div className="p-6 space-y-4 bg-black/20">
                {[
                  { type: "bot", msg: "Hello! How can I help you?" },
                  { type: "user", msg: "Tell me more!" },
                  { type: "bot", msg: "I'm here to assist with any questions." }
                ].map((chat, i) => (
                  <div key={i} className={`flex gap-3 ${chat.type === 'user' ? 'justify-end' : ''}`}>
                    {chat.type === 'bot' && (
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                        AI
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-xl p-3 ${
                      chat.type === 'bot' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm">{chat.msg}</p>
                    </div>
                    {chat.type === 'user' && (
                      <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs">
                        U
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "A4":
        return (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-t-3xl pointer-events-none"></div>
              <div className="relative text-center py-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-t-3xl border-t-4 border-x-4 border-blue-500/30">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-6xl mb-3">🌍</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 mb-2 tracking-wider">
                  GLOBAL EMISSIONS
                </h2>
                <div className="text-red-500 text-xs font-mono tracking-widest">
                  ▶ INTERACTIVE MONITORING SYSTEM
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-b-3xl border-4 border-blue-500/30 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none z-10 scanlines"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-red-500/5 pointer-events-none z-10"></div>

              <div className="relative bg-black/60 backdrop-blur-sm p-6">
                <div className="bg-gradient-to-br from-blue-950/50 to-black rounded-2xl p-4 border-2 border-blue-500/20">
                  <div className="bg-black rounded-xl p-4 border-2 border-gray-800 shadow-inner">
                    <div className="relative w-full h-[450px] bg-[#0a1628] rounded-lg overflow-hidden border border-blue-900/30">
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 140 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <ZoomableGroup center={[0, 20]} zoom={1}>
                          <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                              geographies.map((geo) => (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={getCountryFill(geo)}
                                  stroke="#1e3a5f"
                                  strokeWidth={0.5}
                                  style={{
                                    default: { outline: "none", transition: "all 0.2s" },
                                    hover: {
                                      fill: "#fbbf24",
                                      stroke: "#ffffff",
                                      strokeWidth: 1.5,
                                      outline: "none",
                                      cursor: "pointer",
                                    },
                                    pressed: { fill: "#f97316", outline: "none" },
                                  }}
                                  onMouseEnter={() => setHoveredCountry(geo.properties.name)}
                                  onMouseLeave={() => setHoveredCountry(null)}
                                  onClick={() => handleCountryClick(geo)}
                                />
                              ))
                            }
                          </Geographies>
                        </ZoomableGroup>
                      </ComposableMap>

                      {hoveredCountry && (
                        <div className="absolute top-4 left-4 bg-black/90 border-2 border-yellow-400 rounded-lg px-4 py-2 pointer-events-none z-20">
                          <div className="text-yellow-400 text-sm font-black tracking-wider">
                            {hoveredCountry.toUpperCase()}
                          </div>
                          <div className="text-white text-xs font-mono">Click for details →</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-100"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-200"></div>
                        </div>
                        <span className="text-green-400 text-xs font-mono font-bold">ONLINE</span>
                      </div>
                      <div className="text-blue-400 text-xs font-mono">
                        <span className="text-red-400 font-bold">{Object.keys(countryData).length}</span> COUNTRIES LOADED
                      </div>
                    </div>

                    <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
                      <div className="text-red-400 text-xs font-bold mb-2 tracking-wider">EMISSION SCALE</div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { color: "#0ea5e9", label: "LOW" },
                          { color: "#22d3ee", label: "─" },
                          { color: "#fbbf24", label: "MED" },
                          { color: "#f97316", label: "─" },
                          { color: "#dc2626", label: "HIGH" },
                        ].map((item, i) => (
                          <div key={i} className="text-center">
                            <div 
                              className="w-full h-2 rounded-sm mb-1 border border-white/20" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <div className="text-[8px] text-white/60 font-mono font-bold">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-gradient-to-r from-blue-600/20 via-red-600/20 to-blue-600/20 rounded-lg p-2 border border-white/10">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="text-blue-400">
                        <span className="text-white/60">MODE:</span> <span className="font-bold">INTERACTIVE</span>
                      </div>
                      <div className="text-red-400">
                        <span className="text-white/60">STATUS:</span> <span className="font-bold">READY</span>
                      </div>
                      <div className="text-yellow-400">
                        <span className="text-white/60">ACTION:</span> <span className="font-bold">CLICK COUNTRY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "A5":
        return (
          <div className="space-y-6">
            {/* CRT Monitor Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent rounded-t-3xl pointer-events-none"></div>
              <div className="relative text-center py-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-t-3xl border-t-4 border-x-4 border-green-500/30">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-100"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-200"></div>
                </div>
                <div className="text-6xl mb-3">📊</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2 tracking-wider">
                  LIVE DASHBOARD
                </h2>
                <div className="text-green-500 text-xs font-mono tracking-widest animate-pulse">
                  ▶ REAL-TIME GLOBAL EMISSIONS MONITORING
                </div>
              </div>
            </div>

            {/* Live Stats Display */}
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-b-3xl border-4 border-green-500/30 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none z-10 scanlines"></div>
              
              <div className="relative p-6 space-y-4">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Total Emissions */}
                  <div className="col-span-2 md:col-span-1 relative bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-xl p-4 border-2 border-red-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="text-red-400 text-xs font-bold tracking-wider">TOTAL CO₂ EMISSIONS</div>
                      </div>
                      <div className="text-white text-3xl font-bold font-mono mb-1">
                        {displayStats.totalEmissions.toLocaleString()}
                      </div>
                      <div className="text-red-300 text-xs font-mono">Mt CO₂ Globally</div>
                      <div className="mt-2 h-1.5 bg-black rounded-full overflow-hidden border border-red-900">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-pulse" style={{width: '87%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Active Countries */}
                  <div className="relative bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-xl p-4 border-2 border-blue-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <div className="text-blue-400 text-xs font-bold tracking-wider">ACTIVE COUNTRIES</div>
                      </div>
                      <div className="text-white text-3xl font-bold font-mono mb-1">
                        {displayStats.activeCountries}
                      </div>
                      <div className="text-blue-300 text-xs font-mono">Monitored</div>
                    </div>
                  </div>

                  {/* Avg Per Capita */}
                  <div className="relative bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 rounded-xl p-4 border-2 border-yellow-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                        <div className="text-yellow-400 text-xs font-bold tracking-wider">AVG PER CAPITA</div>
                      </div>
                      <div className="text-white text-3xl font-bold font-mono mb-1">
                        {displayStats.avgPerCapita}
                      </div>
                      <div className="text-yellow-300 text-xs font-mono">Tonnes/Person</div>
                    </div>
                  </div>

                  {/* Total Power Usage */}
                  <div className="relative bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-xl p-4 border-2 border-purple-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        <div className="text-purple-400 text-xs font-bold tracking-wider">TOTAL POWER</div>
                      </div>
                      <div className="text-white text-3xl font-bold font-mono mb-1">
                        {displayStats.totalPower.toLocaleString()}
                      </div>
                      <div className="text-purple-300 text-xs font-mono">TWh Annually</div>
                    </div>
                  </div>

                  {/* Renewable Percentage */}
                  <div className="relative bg-gradient-to-br from-green-900/30 to-green-950/30 rounded-xl p-4 border-2 border-green-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <div className="text-green-400 text-xs font-bold tracking-wider">AVG RENEWABLE</div>
                      </div>
                      <div className="text-white text-3xl font-bold font-mono mb-1">
                        {displayStats.renewablePercent}%
                      </div>
                      <div className="text-green-300 text-xs font-mono">Clean Energy</div>
                      <div className="mt-2 h-1.5 bg-black rounded-full overflow-hidden border border-green-900">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{width: `${displayStats.renewablePercent}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-black/60 rounded-xl p-4 border-2 border-cyan-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyan-400 font-black text-sm tracking-wider">LIVE ACTIVITY FEED</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-cyan-400 text-xs font-mono">STREAMING</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      { country: "China", action: "Emissions spike detected", time: "2s ago", color: "text-red-400" },
                      { country: "Norway", action: "Renewable % increased", time: "5s ago", color: "text-green-400" },
                      { country: "India", action: "Power usage updated", time: "8s ago", color: "text-yellow-400" },
                      { country: "USA", action: "Data refresh complete", time: "12s ago", color: "text-blue-400" },
                      { country: "Germany", action: "New stats available", time: "15s ago", color: "text-purple-400" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${activity.color.replace('text', 'bg')}`}></div>
                          <span className="text-white font-mono">{activity.country}:</span>
                          <span className="text-gray-400">{activity.action}</span>
                        </div>
                        <span className="text-gray-600 font-mono">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-gradient-to-r from-blue-900/20 via-green-900/20 to-blue-900/20 rounded-lg p-3 border border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="text-center">
                      <div className="text-white/60 mb-1">DATA REFRESH</div>
                      <div className="text-green-400 font-bold">LIVE</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 mb-1">ACCURACY</div>
                      <div className="text-blue-400 font-bold">99.8%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60 mb-1">UPTIME</div>
                      <div className="text-cyan-400 font-bold">24/7</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Vending Machine */}
        <div className="relative">
          
          {/* Top Section */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-3xl border-x-4 border-t-4 border-gray-700 p-8">
            <div className="text-center">
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-red-400 to-blue-400 mb-2">
                Carbonated
              </h1>
              <div className="inline-flex items-center gap-2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                Drinks
              </div>
            </div>
          </div>

          {/* Display Section */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-x-4 border-gray-700 p-8 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelection(item)}
                  disabled={isDispensing || item.type === "locked"}
                  className={`
                    relative group
                    ${item.type === "locked" ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    ${isDispensing ? 'pointer-events-none' : ''}
                  `}
                >
                  <div className={`
                    bg-gradient-to-br from-gray-900 to-black
                    rounded-2xl p-6 border-2 transition-all
                    ${selectedItem?.id === item.id 
                      ? 'border-yellow-400 scale-105' 
                      : 'border-white/20 hover:border-white/40 hover:scale-105'
                    }
                  `}>
                    <div className="text-center">
                      <div className="text-5xl mb-3">
                        {item.icon}
                      </div>
                      <div className={`text-xs font-black px-2 py-1 bg-gradient-to-r ${item.color} text-white rounded-full mb-2 inline-block`}>
                        {item.id}
                      </div>
                      <h3 className="text-sm font-black text-white">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {isDispensing && selectedItem?.id === item.id && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 animate-fall">
                      <div className="text-4xl">
                        {item.icon}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedItem && isDispensing && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-yellow-400 text-black font-black px-6 py-2 rounded-full text-sm">
                  DISPENSING {selectedItem.id}...
                </div>
              </div>
            )}
          </div>

          {/* Collection Tray */}
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-b-3xl border-x-4 border-b-4 border-gray-700 p-6">
            <div className="bg-black/60 rounded-2xl border-2 border-white/10 p-8 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-yellow-400 text-xl">▼</div>
                  <span className="text-white/60 font-bold text-sm">COLLECTION TRAY</span>
                </div>
                {dispensedItem && (
                  <button
                    onClick={resetVending}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:from-red-600 hover:to-red-800 transition-all"
                  >
                    ← BACK
                  </button>
                )}
              </div>

              {!dispensedItem ? (
                <div className="text-center py-20">
                  <div className="text-7xl mb-6 opacity-20">📭</div>
                  <p className="text-white/40 font-bold text-xl">
                    SELECT AN ITEM ABOVE
                  </p>
                </div>
              ) : (
                <div className="animate-slideUp">
                  {renderContent()}
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 rounded-xl p-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white font-bold">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                READY
              </div>
              <div className="text-white font-bold">
                {dispensedItem ? `${dispensedItem.id}` : 'STANDBY'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Extension Dialog */}
      <Dialog open={extensionDialogOpen} onOpenChange={setExtensionDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 rounded-2xl shadow-2xl p-0 overflow-hidden" style={{ borderColor: selectedExtension?.borderColor.replace('border-', '#') || '#3b82f6' }}>
          <div className="h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500 animate-pulse"></div>
          
          <div className="p-6">
            <DialogHeader>
              <div className={`relative bg-gradient-to-br from-gray-800 to-black rounded-xl p-1 border-2 shadow-lg`} style={{ borderColor: selectedExtension?.borderColor.replace('border-', '#') || '#3b82f6' }}>
                <div className="relative bg-black/80 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    {/* Extension Icon/Image */}
                    <div className={`w-24 h-24 rounded-xl ${selectedExtension?.color} flex items-center justify-center text-5xl shadow-lg border-4 border-white/30`}>
                      {selectedExtension?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-400 text-xs font-mono mb-1">{selectedExtension?.category}</div>
                      <DialogTitle className="text-3xl font-bold text-white tracking-wider">
                        {selectedExtension?.name.toUpperCase()}
                      </DialogTitle>
                      <div className="text-gray-400 text-sm mt-2">{selectedExtension?.purpose}</div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {/* Features Section */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-white/10">
                <h3 className="text-cyan-400 font-black text-sm mb-3 tracking-wider flex items-center gap-2">
                  <span>⚡</span> KEY FEATURES
                </h3>
                <div className="space-y-2">
                  {selectedExtension?.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="text-green-400 mt-0.5">✓</div>
                      <div className="text-gray-300">{feature}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Cases Section */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-white/10">
                <h3 className="text-yellow-400 font-black text-sm mb-3 tracking-wider flex items-center gap-2">
                  <span>🎯</span> USE CASES
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedExtension?.useCases.map((useCase, i) => (
                    <div key={i} className="bg-black/40 rounded-lg p-3 border border-white/10">
                      <div className="text-white text-xs font-mono">{useCase}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setExtensionDialogOpen(false)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all border-2 border-gray-600"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => window.open(selectedExtension?.downloadLink, '_blank')}
                  className={`${selectedExtension?.color} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all border-2 border-white/30 shadow-lg`}
                >
                  INSTALL NOW →
                </button>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500 animate-pulse"></div>
        </DialogContent>
      </Dialog>

      {/* Country Data Dialog (existing) */}
      <Dialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-blue-500 rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500 animate-pulse"></div>
          
          <div className="p-6">
            <DialogHeader>
              <div className="relative bg-gradient-to-br from-blue-950 to-black rounded-xl p-1 border-2 border-blue-400 shadow-lg shadow-blue-500/50">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 to-transparent rounded-xl pointer-events-none"></div>
                <div className="relative bg-black/80 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <DialogTitle className="text-3xl font-bold text-center text-blue-400 tracking-wider font-mono">
                    {selectedCountry?.toUpperCase() || "SELECT COUNTRY"}
                  </DialogTitle>
                  <div className="text-center text-red-400 text-xs mt-2 tracking-widest font-mono">
                    ▶ EMISSIONS ANALYSIS
                  </div>
                </div>
              </div>
            </DialogHeader>

            {currentData ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-xl p-4 border-2 border-red-500/50 overflow-hidden">
                    <div className="absolute inset-0 scanlines pointer-events-none"></div>
                    <div className="relative bg-black/50 rounded-lg p-3">
                      <div className="text-red-400 text-[10px] font-bold tracking-wider mb-1">CO₂ OUTPUT</div>
                      <div className="text-white text-xl font-bold font-mono">{currentData.emissions}</div>
                      <div className="mt-2 h-1.5 bg-black rounded-full overflow-hidden border border-red-900">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400" 
                          style={{
                            width: `${Math.min((parseEmissions(currentData.emissions) / maxEmissions) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-xl p-4 border-2 border-blue-500/50 overflow-hidden">
                    <div className="absolute inset-0 scanlines pointer-events-none"></div>
                    <div className="relative bg-black/50 rounded-lg p-3">
                      <div className="text-blue-400 text-[10px] font-bold tracking-wider mb-1">POWER USE</div>
                      <div className="text-white text-xl font-bold font-mono">{currentData.powerUsage}</div>
                      <div className="mt-2 h-1.5 bg-black rounded-full overflow-hidden border border-blue-900">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-cyan-500/30 text-center">
                    <div className="text-cyan-400 text-[10px] font-bold tracking-wider mb-1">POPULATION</div>
                    <div className="text-white font-bold text-sm font-mono">{currentData.population}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-green-500/30 text-center">
                    <div className="text-green-400 text-[10px] font-bold tracking-wider mb-1">RENEWABLE %</div>
                    <div className="text-white font-bold text-sm font-mono">{currentData.renewablePercent}</div>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border-2 border-yellow-500/40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 pointer-events-none"></div>
                  <div className="relative text-center">
                    <div className="text-yellow-400 text-xs font-bold tracking-widest mb-2">⚡ PER CAPITA EMISSIONS ⚡</div>
                    <div className="text-white text-4xl font-bold font-mono bg-black/40 rounded-lg py-2 border border-yellow-600/30">
                      {currentData.perCapitaEmissions}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setCountryDialogOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all border-2 border-blue-400/50 shadow-lg shadow-blue-500/30"
                  >
                    ← BACK
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all border-2 border-red-400/50 shadow-lg shadow-red-500/30"
                  >
                    DETAILS →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border-2 border-yellow-500/50">
                  <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                  <p className="text-yellow-400 text-lg font-bold mb-2 font-mono">NO DATA AVAILABLE</p>
                  <p className="text-gray-400 text-sm">This country is not in our database</p>
                </div>
                <button
                  onClick={() => setCountryDialogOpen(false)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 text-white font-bold py-3 rounded-xl border-2 border-white/20"
                >
                  ← RETURN
                </button>
              </div>
            )}
          </div>

          <div className="h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500 animate-pulse"></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}