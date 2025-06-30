"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendAnalytics = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const recharts_1 = require("recharts");
function TrendAnalytics({ className }) {
    var _a;
    const [data, setData] = (0, react_1.useState)([]);
    const [availableMonths, setAvailableMonths] = (0, react_1.useState)([]);
    const [selectedMonth, setSelectedMonth] = (0, react_1.useState)("all");
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchTrendData = (month) => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (month && month !== "all") {
                const [year, monthNum] = month.split("-");
                params.append("month", monthNum);
                params.append("year", year);
            }
            const response = yield fetch(`/api/dashboard/trends?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch trend data");
            }
            const result = yield response.json();
            if (result.success) {
                setData(result.data || []);
                setAvailableMonths(result.availableMonths || []);
            }
            else {
                throw new Error("Invalid response format");
            }
        }
        catch (err) {
            console.error("Trend data fetch error:", err);
            setError("Failed to load trend data");
        }
        finally {
            setLoading(false);
        }
    });
    (0, react_1.useEffect)(() => {
        fetchTrendData(selectedMonth);
    }, [selectedMonth]);
    const handleMonthChange = (month) => {
        setSelectedMonth(month);
    };
    const refreshData = () => {
        fetchTrendData(selectedMonth);
    };
    // Calculate totals for summary
    const totals = (data === null || data === void 0 ? void 0 : data.reduce((acc, item) => ({
        sessions: acc.sessions + item.sessions,
        concernsRecorded: acc.concernsRecorded + item.concernsRecorded,
        concernsResolved: acc.concernsResolved + item.concernsResolved
    }), { sessions: 0, concernsRecorded: 0, concernsResolved: 0 })) || { sessions: 0, concernsRecorded: 0, concernsResolved: 0 };
    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (<div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">Week of {label}</p>
          {payload.map((entry, index) => (<p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>))}
        </div>);
        }
        return null;
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-5 w-5"/>
            Weekly Trends Analytics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center h-64">
            <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin text-gray-400"/>
            <span className="ml-2 text-gray-500">Loading trend data...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-5 w-5"/>
            Weekly Trends Analytics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <lucide_react_1.BarChart3 className="h-12 w-12 text-gray-400 mb-4"/>
            <p className="text-gray-500 mb-2">{error}</p>
            <button_1.Button onClick={refreshData} variant="outline" size="sm">
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
              Try Again
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-5 w-5 text-blue-600"/>
            Weekly Trends Analytics
          </card_1.CardTitle>
          <div className="flex items-center gap-2">
            <button_1.Button onClick={refreshData} variant="outline" size="sm">
              <lucide_react_1.RefreshCw className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4 text-gray-500"/>
            <select_1.Select value={selectedMonth} onValueChange={handleMonthChange}>
              <select_1.SelectTrigger className="w-48">
                <select_1.SelectValue placeholder="Filter by month"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Time (Last 12 weeks)</select_1.SelectItem>
                {availableMonths === null || availableMonths === void 0 ? void 0 : availableMonths.map((month) => (<select_1.SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
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
      </card_1.CardHeader>

      <card_1.CardContent>
        {(data === null || data === void 0 ? void 0 : data.length) > 0 ? (<div className="space-y-4">
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
              <recharts_1.ResponsiveContainer width="100%" height="100%">
                <recharts_1.LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <recharts_1.XAxis dataKey="week" tickLine={false} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd"/>
                  <recharts_1.YAxis tickLine={false} tick={{ fontSize: 11 }} label={{
                value: 'Count',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 11 }
            }}/>
                  <recharts_1.Tooltip content={<CustomTooltip />}/>
                  <recharts_1.Line type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }} name="Sessions Completed"/>
                  <recharts_1.Line type="monotone" dataKey="concernsRecorded" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2 }} name="Concerns Recorded"/>
                  <recharts_1.Line type="monotone" dataKey="concernsResolved" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }} name="Concerns Resolved"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
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
                : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Avg Sessions/Week:</span>{" "}
                    {(data === null || data === void 0 ? void 0 : data.length) > 0 ? Math.round(totals.sessions / data.length) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Period:</span>{" "}
                    {selectedMonth === "all" ? "Last 12 weeks" : (_a = availableMonths === null || availableMonths === void 0 ? void 0 : availableMonths.find(m => m.value === selectedMonth)) === null || _a === void 0 ? void 0 : _a.label}
                  </p>
                </div>
              </div>
            </div>
          </div>) : (<div className="flex flex-col items-center justify-center h-64 text-center">
            <lucide_react_1.BarChart3 className="h-12 w-12 text-gray-400 mb-4"/>
            <p className="text-gray-500 mb-2">No trend data available</p>
            <p className="text-sm text-gray-400">
              {selectedMonth === "all"
                ? "No sessions or concerns found in the last 12 weeks"
                : "No data available for the selected month"}
            </p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
exports.TrendAnalytics = TrendAnalytics;
