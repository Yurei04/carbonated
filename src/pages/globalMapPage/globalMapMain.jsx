"use client";

import { MapProvider, World } from "@yanikemmenegger/react-world-map";

export default function GlobalMapPage() {
  return (
    <div className="map-wrapper">
      <MapProvider>
        <World 
        
            className="world-map" 
        />
      </MapProvider>
    </div>
  );
}
