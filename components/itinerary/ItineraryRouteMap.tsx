"use client";

import React, { useState } from "react";
import { Compass, Navigation } from "lucide-react";

interface Coords {
  x: number;
  y: number;
}

interface Experience {
  id: string;
  name: string;
  category: string;
}

interface ItineraryItem {
  id: string;
  experiences: Experience | null;
}

interface ItineraryDay {
  id: string;
  day_number: number;
  itinerary_items: ItineraryItem[];
}

interface ItineraryRouteMapProps {
  days: ItineraryDay[];
  activeDayIndex: number;
  cityName: string;
}

// Coordinate mapping helper
const getCoords = (expId: string, name: string): Coords => {
  const lower = name.toLowerCase();
  
  if (lower.includes("universal") || lower.includes("sentosa") || lower.includes("tanjong") || lower.includes("beach")) {
    return { x: 260, y: 340 };
  }
  if (lower.includes("marina bay sands") || lower.includes("mbs") || lower.includes("sands") || lower.includes("infinity pool")) {
    return { x: 380, y: 240 };
  }
  if (lower.includes("gardens") || lower.includes("cloud forest") || lower.includes("supertree")) {
    return { x: 420, y: 270 };
  }
  if (lower.includes("orchard") || lower.includes("shopping") || lower.includes("plaza")) {
    return { x: 200, y: 160 };
  }
  if (lower.includes("airport") || lower.includes("changi") || lower.includes("jewel")) {
    return { x: 680, y: 120 };
  }
  if (lower.includes("flyer")) {
    return { x: 440, y: 210 };
  }
  if (lower.includes("safari") || lower.includes("zoo") || lower.includes("wildlife")) {
    return { x: 300, y: 70 };
  }
  if (lower.includes("china")) {
    return { x: 310, y: 260 };
  }
  if (lower.includes("clarke") || lower.includes("quay") || lower.includes("nightlife") || lower.includes("bar")) {
    return { x: 330, y: 210 };
  }

  // Deterministic fallback based on id/name string
  let hash = 0;
  const str = expId + name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = 160 + Math.abs(hash % 420);
  const y = 100 + Math.abs((hash >> 5) % 210);
  return { x, y };
};

export default function ItineraryRouteMap({ days, activeDayIndex, cityName }: ItineraryRouteMapProps) {
  const [hoveredNode, setHoveredNode] = useState<{ name: string; category: string; coords: Coords } | null>(null);

  // Parse days into coordinates lists
  const dayRoutes = days.map((day) => {
    const coordsList: { coords: Coords; name: string; category: string }[] = [];
    day.itinerary_items?.forEach((item) => {
      const exp = item.experiences;
      if (exp) {
        coordsList.push({
          coords: getCoords(exp.id, exp.name),
          name: exp.name,
          category: exp.category
        });
      }
    });
    return {
      dayNumber: day.day_number,
      route: coordsList
    };
  });

  // Calculate paths
  const getPolylinePoints = (routeList: { coords: Coords }[]) => {
    return routeList.map(r => `${r.coords.x},${r.coords.y}`).join(" ");
  };

  return (
    <div className="bg-deep-charcoal rounded-2xl p-5 border border-border/40 text-sand shadow-lg flex flex-col gap-4 relative overflow-hidden">
      {/* Background visual indicators */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-marigold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-dusk-teal/5 blur-3xl pointer-events-none" />

      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-marigold animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
            Interactive Route Tracker
          </h3>
        </div>
        <div className="text-[10px] font-mono text-sand/60">
          City: <span className="text-white font-bold">{cityName}</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative border border-white/5 rounded-xl bg-deep-charcoal/40 overflow-hidden select-none aspect-video sm:aspect-auto sm:h-64">
        {/* Decorative Grid Dots */}
        <svg className="absolute inset-0 w-full h-full text-white/5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* SVG Route Elements */}
        <svg
          viewBox="0 0 800 420"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simulated Coastlines / Landmass Outline for Singapore */}
          {cityName.toLowerCase().includes("singapore") && (
            <>
              {/* Main Singapore Island vector path outline */}
              <path
                d="M 120,180 C 140,150 180,130 220,120 C 260,110 320,100 380,100 C 440,100 500,105 560,110 C 620,115 670,125 720,140 C 750,150 780,170 780,190 C 780,210 740,225 720,230 C 700,235 680,230 650,235 C 620,240 580,250 540,265 C 500,280 460,290 420,290 C 380,290 350,270 320,270 C 290,270 270,285 240,285 C 210,285 190,270 170,265 C 150,260 130,240 120,220 C 110,200 110,190 120,180 Z"
                fill="#1e293b"
                fillOpacity="0.4"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Sentosa Island */}
              <path
                d="M 230,320 C 250,320 280,330 290,345 C 290,355 260,365 240,360 C 220,355 215,335 230,320 Z"
                fill="#1e293b"
                fillOpacity="0.5"
                stroke="#334155"
                strokeWidth="1.5"
              />
            </>
          )}

          {/* Render Route Paths */}
          {dayRoutes.map((dayRoute, idx) => {
            if (dayRoute.route.length < 2) return null;
            const points = getPolylinePoints(dayRoute.route);
            const isCurrent = idx === activeDayIndex;

            return (
              <g key={dayRoute.dayNumber}>
                {/* Glowing under-line path */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={isCurrent ? "#F59E0B" : "#0D9488"}
                  strokeWidth={isCurrent ? "4" : "1.5"}
                  strokeOpacity={isCurrent ? "0.2" : "0.1"}
                  className="transition-all duration-300"
                />
                {/* Precise connector path line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={isCurrent ? "#F59E0B" : "#334155"}
                  strokeWidth={isCurrent ? "2" : "1"}
                  strokeDasharray={isCurrent ? "none" : "3 3"}
                  strokeOpacity={isCurrent ? "1" : "0.5"}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Render Markers / Nodes */}
          {dayRoutes.map((dayRoute, dayIdx) => {
            const isCurrent = dayIdx === activeDayIndex;

            return dayRoute.route.map((node, nodeIdx) => {
              const isActiveNode = isCurrent;
              return (
                <g 
                  key={`${dayRoute.dayNumber}-${nodeIdx}`}
                  onMouseEnter={() => setHoveredNode({ name: node.name, category: node.category, coords: node.coords })}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                >
                  {/* Outer ripple ring on active day */}
                  {isActiveNode && (
                    <circle
                      cx={node.coords.x}
                      cy={node.coords.y}
                      r="12"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Marker Node */}
                  <circle
                    cx={node.coords.x}
                    cy={node.coords.y}
                    r={isActiveNode ? "7" : "5"}
                    fill={isActiveNode ? "#F59E0B" : "#1E293B"}
                    stroke={isActiveNode ? "#FFFFFF" : "#475569"}
                    strokeWidth={isActiveNode ? "1.5" : "1"}
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Number Label */}
                  {isActiveNode && (
                    <text
                      x={node.coords.x}
                      y={node.coords.y + 3}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none font-mono"
                    >
                      {nodeIdx + 1}
                    </text>
                  )}
                </g>
              );
            });
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div 
            className="absolute bg-deep-charcoal border border-border/60 text-sand text-[10px] p-2 rounded-lg shadow-md pointer-events-none max-w-xs animate-fade-in font-mono leading-relaxed"
            style={{
              left: `${Math.min(75, Math.max(5, (hoveredNode.coords.x / 800) * 100))}%`,
              top: `${Math.min(80, Math.max(5, (hoveredNode.coords.y / 420) * 100 - 15))}%`,
              transform: "translate(-50%, -100%)"
            }}
          >
            <div className="font-bold text-white border-b border-white/5 pb-1 mb-1 truncate">
              {hoveredNode.name}
            </div>
            <div className="text-[8px] text-dusk-teal uppercase font-semibold">
              Category: {hoveredNode.category}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex gap-4 justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2 mt-1">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-marigold" />
            <span>Active Day Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-dusk-teal" />
            <span>Other Days</span>
          </div>
        </div>
        <div className="text-dusk-teal flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span>Interactive Node HUD</span>
        </div>
      </div>
    </div>
  );
}
