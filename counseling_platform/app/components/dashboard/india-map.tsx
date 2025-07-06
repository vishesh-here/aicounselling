"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import India from "@react-map/india";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

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
  childrenData: Array<{ state: string; value: number }>;
  volunteersData: Array<{ state: string; value: number }>;
  selectedHeatmap: 'children' | 'volunteers';
  onHeatmapChange: (type: 'children' | 'volunteers') => void;
}

const stateNameMap: Record<string, string> = {
  // Map @react-map/india state codes to your state names if needed
  // e.g. 'AP': 'Andhra Pradesh', ...
};

export function IndiaMap({ childrenData, volunteersData, selectedHeatmap, onHeatmapChange }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // Choose data based on selectedHeatmap
  const data = selectedHeatmap === 'children' ? childrenData : volunteersData;
  const stateDataMap = Object.fromEntries(data.map((d) => [d.state, d]));
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  // Color scale
  const getStateColor = (state: string) => {
    const stateData = stateDataMap[state];
    if (!stateData || stateData.value === 0) return "#f3f4f6";
    const intensity = stateData.value / maxValue;
    if (intensity >= 0.75) return "#ea580c";
    if (intensity >= 0.5) return "#f59e42";
    if (intensity >= 0.25) return "#fbbf24";
    return "#fef08a";
  };
  // Download as PNG
  const handleDownload = async () => {
    if (!mapRef.current) return;
    const canvas = await html2canvas(mapRef.current);
    const link = document.createElement('a');
    link.download = `india-map-${selectedHeatmap}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  // Tooltip content
  const renderTooltip = () =>
    hoveredState ? (
      <div className="absolute top-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-xs z-10 animate-fade-in">
        <h3 className="font-semibold text-gray-900 mb-2">{hoveredState.state}</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-600" />
            <span>{hoveredState.value} {selectedHeatmap === 'children' ? 'Children' : 'Volunteers'}</span>
          </div>
        </div>
      </div>
    ) : null;
  // Map state code to data
  const handleHover = (stateCode: string) => {
    const stateName = stateNameMap[stateCode] || stateCode;
    const d = stateDataMap[stateName];
    if (d) setHoveredState({ ...d, state: stateName });
    else setHoveredState(null);
  };
  return (
    <div className="space-y-4 relative">
      {/* Tabs and Download Icon at the Top */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${selectedHeatmap === 'children' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => onHeatmapChange('children')}
          >
            Children
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${selectedHeatmap === 'volunteers' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => onHeatmapChange('volunteers')}
          >
            Volunteers
          </button>
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-200"
          title="Download Map as PNG"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600 px-2">
        <span className="font-medium">
          {selectedHeatmap === 'children' ? 'Children Distribution Across India' : 'Volunteers Distribution Across India'}
        </span>
        <div className="flex items-center space-x-2">
          <span>Low</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-yellow-200 rounded border"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded border"></div>
            <div className="w-4 h-4 bg-orange-400 rounded border"></div>
            <div className="w-4 h-4 bg-orange-600 rounded border"></div>
          </div>
          <span>High</span>
          <div className="ml-4 w-4 h-4 bg-gray-200 rounded border"></div>
          <span>No Data</span>
        </div>
      </div>
      {/* India Map */}
      <div ref={mapRef} className="relative bg-white rounded-lg border shadow-lg p-2 flex justify-center">
        <India
          type="select-single"
          size={600}
          mapColor="#f3f4f6"
          strokeColor="#374151"
          strokeWidth={1.5}
          hoverColor="#f59e42"
          hints={true}
          hintTextColor="#fff"
          hintBackgroundColor="#ea580c"
          selectColor="#ea580c"
        />
        {renderTooltip()}
      </div>
      {/* Top States Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data
          .filter((item) => item.value > 0)
          .slice(0, 6)
          .map((item) => (
            <Card key={item.state} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900">{item.state}</div>
                  <div className="text-lg font-bold text-orange-600">{item.value}</div>
                  <div className="text-xs text-gray-500">{selectedHeatmap === 'children' ? 'children' : 'volunteers'}</div>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
