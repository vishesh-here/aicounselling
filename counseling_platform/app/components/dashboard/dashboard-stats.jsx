"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStats = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function DashboardStats({ data, userRole }) {
    const [animatedStats, setAnimatedStats] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        // Animate the numbers counting up
        const stats = userRole === "ADMIN" ? data.stats : data.stats;
        const keys = Object.keys(stats);
        keys.forEach((key) => {
            const finalValue = stats[key];
            let currentValue = 0;
            const increment = Math.ceil(finalValue / 50);
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                setAnimatedStats((prev) => (Object.assign(Object.assign({}, prev), { [key]: currentValue })));
            }, 30);
        });
    }, [data.stats, userRole]);
    if (userRole === "ADMIN") {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <card_1.Card className="card-hover">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Children</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalChildren || 0}</div>
            <p className="text-xs text-muted-foreground">Active profiles</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="card-hover">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Volunteers</card_1.CardTitle>
            <lucide_react_1.UserCheck className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalVolunteers || 0}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="card-hover">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Sessions</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Counseling sessions</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="card-hover">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Resolution Rate</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.resolutionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Concerns resolved</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <card_1.Card className="card-hover">
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">My Children</card_1.CardTitle>
          <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.myChildren || 0}</div>
          <p className="text-xs text-muted-foreground">Assigned to me</p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card className="card-hover">
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">My Sessions</card_1.CardTitle>
          <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.mySessions || 0}</div>
          <p className="text-xs text-muted-foreground">Total conducted</p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card className="card-hover">
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Open Cases</card_1.CardTitle>
          <lucide_react_1.Heart className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.myOpenConcerns || 0}</div>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card className="card-hover">
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Upcoming</card_1.CardTitle>
          <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.upcomingSessions || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled sessions</p>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.DashboardStats = DashboardStats;
