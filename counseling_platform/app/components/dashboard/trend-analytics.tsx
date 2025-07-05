"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, BarChart3, RefreshCw } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TrendData {
  week: string;
  fullDate: string;
  sessions: number;
  concernsRecorded: number;
  concernsResolved: number;
}

interface AvailableMonth {
  value: string;
  label: string;
}

interface TrendAnalyticsProps {
  className?: string;
}

export function TrendAnalytics({ className }: TrendAnalyticsProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trends, setTrends] = useState({
    totalSessions: 0,
    concernsRecorded: 0,
    concernsResolved: 0,
  });

  // Helper to get all weeks between two dates
  function getWeeklyBuckets(startDate: Date, endDate: Date) {
    const weeks: { startDate: Date; endDate: Date; weekLabel: string }[] = [];
    const current = new Date(startDate);
    // Start from Monday
    current.setDate(current.getDate() - current.getDay() + 1);
    while (current <= endDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      weeks.push({
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || user?.app_metadata?.role;
      if (!user || role !== 'ADMIN') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      // Fetch concerns
      const { data: concernsData, error: concernsError } = await supabase
        .from('concerns')
        .select('*');
      if (concernsError) throw concernsError;
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*');
      if (sessionsError) throw sessionsError;
      // Aggregate trends
      setTrends({
        totalSessions: sessionsData.length,
        concernsRecorded: concernsData.length,
        concernsResolved: concernsData.filter(c => c.status === 'RESOLVED').length,
        // Add more trend analytics as needed
      });
      setLoading(false);
    };
    fetchTrends();
  }, []);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const refreshData = () => {
    // Implement refresh logic
  };

  // Calculate totals for summary
  const totals = {
    sessions: trends.totalSessions,
    concernsRecorded: trends.concernsRecorded,
    concernsResolved: trends.concernsResolved,
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">Week of {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Trends Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading trend data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Trends Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">{error}</p>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Trends Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Unauthorized</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Weekly Trends Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time (Last 12 weeks)</SelectItem>
                {/* Add available months based on data */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{totals.sessions}</p>
            <p className="text-sm text-blue-600">Total Sessions</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{totals.concernsRecorded}</p>
            <p className="text-sm text-orange-600">Concerns Recorded</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{totals.concernsResolved}</p>
            <p className="text-sm text-green-600">Concerns Resolved</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data?.length > 0 ? (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Sessions Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Concerns Recorded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Concerns Resolved</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="week" 
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    label={{ 
                      value: 'Count', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    name="Sessions Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="concernsRecorded" 
                    stroke="#F97316" 
                    strokeWidth={3}
                    dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2 }}
                    name="Concerns Recorded"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="concernsResolved" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                    name="Concerns Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Resolution Rate:</span>{" "}
                    {totals.concernsRecorded > 0 
                      ? Math.round((totals.concernsResolved / totals.concernsRecorded) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Avg Sessions/Week:</span>{" "}
                    {data?.length > 0 ? Math.round(totals.sessions / data.length) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Period:</span>{" "}
                    {selectedMonth === "all" ? "Last 12 weeks" : "Selected Month"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No trend data available</p>
            <p className="text-sm text-gray-400">
              {selectedMonth === "all" 
                ? "No sessions or concerns found in the last 12 weeks"
                : "No data available for the selected month"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
