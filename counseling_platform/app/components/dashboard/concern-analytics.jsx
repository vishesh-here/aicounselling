"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcernAnalytics = void 0;
const recharts_1 = require("recharts");
function ConcernAnalytics({ data }) {
    // Transform the data for the chart
    const chartData = (data === null || data === void 0 ? void 0 : data.reduce((acc, item) => {
        const existingGroup = acc.find(group => group.ageGroup === item.age_group);
        if (existingGroup) {
            existingGroup[item.category] = parseInt(item.count);
        }
        else {
            acc.push({
                ageGroup: item.age_group,
                [item.category]: parseInt(item.count)
            });
        }
        return acc;
    }, [])) || [];
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
    return (<div className="h-80">
      <recharts_1.ResponsiveContainer width="100%" height="100%">
        <recharts_1.BarChart data={chartData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
        }}>
          <recharts_1.CartesianGrid strokeDasharray="3 3"/>
          <recharts_1.XAxis dataKey="ageGroup" tick={{ fontSize: 10 }} tickLine={false}/>
          <recharts_1.YAxis tick={{ fontSize: 10 }} tickLine={false}/>
          <recharts_1.Tooltip contentStyle={{ fontSize: 11 }}/>
          <recharts_1.Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top"/>
          
          {Object.keys(colors).map((category) => (<recharts_1.Bar key={category} dataKey={category} fill={colors[category]} name={category.charAt(0) + category.slice(1).toLowerCase()}/>))}
        </recharts_1.BarChart>
      </recharts_1.ResponsiveContainer>
    </div>);
}
exports.ConcernAnalytics = ConcernAnalytics;
