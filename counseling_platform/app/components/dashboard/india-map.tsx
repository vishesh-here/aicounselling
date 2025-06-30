
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";

// @ts-ignore - Suppress all React Simple Maps TypeScript compatibility issues with React 18
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

interface MapDataState {
  state: string;
  children: number;
  volunteers: number;
  sessions: number;
  concerns: number;
  resolvedConcerns: number;
  resolutionRate: number;
}

interface IndiaMapProps {
  data?: any[]; // Keep for backward compatibility, but we'll fetch our own data
}

const geoUrl = "/india-states.json";

export function IndiaMap({ data }: IndiaMapProps) {
  const [mapData, setMapData] = useState<MapDataState[]>([]);
  const [hoveredState, setHoveredState] = useState<MapDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const response = await fetch('/api/dashboard/map-data');
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      const result = await response.json();
      setMapData(result.data || []);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  // Create a map of state name to data for quick lookup
  const stateDataMap = mapData.reduce((acc: { [key: string]: MapDataState }, item) => {
    acc[item.state] = item;
    return acc;
  }, {});

  // Find max values for color scaling
  const maxChildren = Math.max(...mapData.map(item => item.children), 1);
  const maxVolunteers = Math.max(...mapData.map(item => item.volunteers), 1);

  // Get color intensity based on children count
  const getStateColor = (stateName: string) => {
    const stateData = stateDataMap[stateName];
    if (!stateData || stateData.children === 0) {
      return "#e2e8f0"; // gray-300 for no data
    }

    const intensity = stateData.children / maxChildren;
    if (intensity >= 0.75) return "#ea580c"; // orange-600
    if (intensity >= 0.5) return "#f97316"; // orange-500  
    if (intensity >= 0.25) return "#fb923c"; // orange-400
    return "#fed7aa"; // orange-200
  };

  // Handle geography mouse events
  const handleMouseEnter = (geo: any) => {
    const stateName = geo.properties.st_nm;
    const stateData = stateDataMap[stateName];
    if (stateData) {
      setHoveredState(stateData);
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-gray-600">Loading India map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Children Distribution Across India</span>
        <div className="flex items-center space-x-2">
          <span>Low</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-orange-200 rounded border"></div>
            <div className="w-4 h-4 bg-orange-400 rounded border"></div>
            <div className="w-4 h-4 bg-orange-500 rounded border"></div>
            <div className="w-4 h-4 bg-orange-600 rounded border"></div>
          </div>
          <span>High</span>
          <div className="ml-4 w-4 h-4 bg-gray-300 rounded border"></div>
          <span>No Data</span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative bg-white rounded-lg border shadow-sm">
        {/* @ts-ignore - React Simple Maps TypeScript compatibility issue */}
        <ComposableMap
          projectionConfig={{
            scale: 1000,
            center: [78.9629, 20.5937] // Center of India
          }}
          width={800}
          height={500}
          className="w-full h-auto"
        >
          {/* @ts-ignore - React Simple Maps TypeScript compatibility issue */}
          <ZoomableGroup zoom={1}>
            {/* @ts-ignore - React Simple Maps TypeScript compatibility issue */}
            <Geographies geography={geoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  const stateName = geo.properties.st_nm;
                  return (
                    // @ts-ignore - React Simple Maps TypeScript compatibility issue
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(stateName)}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          outline: "none", 
                          fill: "#c2410c", // orange-700 on hover
                          strokeWidth: 1,
                          cursor: "pointer"
                        },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover Tooltip */}
        {hoveredState && (
          <div className="absolute top-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-xs z-10">
            <h3 className="font-semibold text-gray-900 mb-2">{hoveredState.state}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span>{hoveredState.children} Children</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span>{hoveredState.volunteers} Volunteers</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>{hoveredState.sessions} Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span>{hoveredState.resolutionRate}% Resolution Rate</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top States Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mapData
          .filter(item => item.children > 0)
          .slice(0, 6)
          .map((item) => (
            <Card key={item.state} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900">{item.state}</div>
                  <div className="text-lg font-bold text-orange-600">{item.children}</div>
                  <div className="text-xs text-gray-500">children</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">{item.volunteers}</div>
                  <div className="text-xs text-gray-500">volunteers</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{item.sessions} sessions</span>
                  <span>{item.resolutionRate}% resolved</span>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
