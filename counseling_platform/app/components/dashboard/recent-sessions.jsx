"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecentSessions = void 0;
const badge_1 = require("@/components/ui/badge");
const date_fns_1 = require("date-fns");
function RecentSessions({ sessions, userRole }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "ESCALATED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    if (!(sessions === null || sessions === void 0 ? void 0 : sessions.length)) {
        return (<div className="text-center py-8 text-gray-500">
        <p>No recent sessions found</p>
      </div>);
    }
    return (<div className="space-y-3">
      {sessions.map((session) => {
            var _a, _b, _c, _d, _e;
            return (<div key={session.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">
                {((_a = session.child) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Child"}
              </p>
              <p className="text-xs text-gray-600">
                Age: {((_b = session.child) === null || _b === void 0 ? void 0 : _b.age) || "N/A"}
                {userRole === "ADMIN" && ((_c = session.volunteer) === null || _c === void 0 ? void 0 : _c.name) && (<span> • Volunteer: {session.volunteer.name}</span>)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(0, date_fns_1.formatDistanceToNow)(new Date(session.createdAt))} ago
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <badge_1.Badge variant="secondary" className={getStatusColor(((_d = session.summary) === null || _d === void 0 ? void 0 : _d.resolutionStatus) || "PENDING")}>
                {((_e = session.summary) === null || _e === void 0 ? void 0 : _e.resolutionStatus) || "Pending"}
              </badge_1.Badge>
            </div>
          </div>
        </div>);
        })}
    </div>);
}
exports.RecentSessions = RecentSessions;
