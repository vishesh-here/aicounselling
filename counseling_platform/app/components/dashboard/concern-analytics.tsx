
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ConcernAnalyticsProps {
  data: any[];
}

export function ConcernAnalytics({ data }: ConcernAnalyticsProps) {
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
