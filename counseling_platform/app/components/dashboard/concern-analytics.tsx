"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function ConcernAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        const response = await fetch('/api/dashboard/concern-analytics', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const result = await response.json();
        if (!result.data) throw new Error('Failed to fetch concern analytics');
        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load concern analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transform the data for the chart
  const chartData = data?.reduce((acc: any[], item: any) => {
    const existingGroup = acc.find(group => group.ageGroup === item.age_group);
    if (existingGroup) {
      existingGroup[item.category] = parseInt(item.count);
    } else {
      acc.push({
        ageGroup: item.age_group,
        [item.category]: parseInt(item.count)
      });
    }
    return acc;
  }, []) || [];

  const colors = {
    ACADEMIC: "#3B82F6",
    FAMILY: "#EF4444", 
    EMOTIONAL: "#8B5CF6",
    CAREER: "#10B981",
    SOCIAL: "#F59E0B",
    BEHAVIORAL: "#EC4899",
    HEALTH: "#06B6D4",
    FINANCIAL: "#84CC16"
  };

  if (loading) return <div className="h-80 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="h-80 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="ageGroup" 
            tick={{ fontSize: 10 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ fontSize: 11 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 11 }}
            verticalAlign="top"
          />
          {Object.keys(colors).map((category) => (
            <Bar 
              key={category}
              dataKey={category}
              fill={colors[category as keyof typeof colors]}
              name={category.charAt(0) + category.slice(1).toLowerCase()}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
