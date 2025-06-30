"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionHistory = void 0;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const session_summary_details_dialog_1 = require("@/components/session/session-summary-details-dialog");
function SessionHistory({ sessions }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "ESCALATED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    const getSessionTypeIcon = (type) => {
        switch (type) {
            case "CAREER_GUIDANCE": return <lucide_react_1.Target className="h-4 w-4"/>;
            case "PSYCHOLOGICAL_SUPPORT": return <lucide_react_1.MessageCircle className="h-4 w-4"/>;
            case "FOLLOW_UP": return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            default: return <lucide_react_1.Calendar className="h-4 w-4"/>;
        }
    };
    const getSessionTypeColor = (type) => {
        switch (type) {
            case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800";
            case "PSYCHOLOGICAL_SUPPORT": return "bg-orange-100 text-orange-800";
            case "FOLLOW_UP": return "bg-green-100 text-green-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };
    if (!(sessions === null || sessions === void 0 ? void 0 : sessions.length)) {
        return (<card_1.Card>
        <card_1.CardContent className="text-center py-12">
          <lucide_react_1.Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600 mb-4">
            This child hasn't had any counseling sessions yet.
          </p>
          <button_1.Button className="bg-orange-600 hover:bg-orange-700">
            <lucide_react_1.MessageCircle className="h-4 w-4 mr-2"/>
            Start First Session
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <lucide_react_1.Calendar className="h-8 w-8 text-blue-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => { var _a; return ((_a = s.summary) === null || _a === void 0 ? void 0 : _a.resolutionStatus) === "RESOLVED"; }).length}
                </p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => { var _a; return ((_a = s.summary) === null || _a === void 0 ? void 0 : _a.resolutionStatus) === "IN_PROGRESS"; }).length}
                </p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-orange-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups Needed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => { var _a; return (_a = s.summary) === null || _a === void 0 ? void 0 : _a.followUpNeeded; }).length}
                </p>
              </div>
              <lucide_react_1.MessageCircle className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Session Timeline */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5"/>
            Session Timeline
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {sessions.map((session, index) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            return (<div key={session.id} className="relative">
                {/* Timeline line */}
                {index < sessions.length - 1 && (<div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>)}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    {getSessionTypeIcon(session.sessionType)}
                  </div>
                  
                  {/* Session content */}
                  <div className="flex-1 min-w-0">
                    <card_1.Card className="border border-gray-200 hover:border-orange-300 transition-colors">
                      <card_1.CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              Session #{sessions.length - index}
                            </h4>
                            <badge_1.Badge className={`text-xs ${getSessionTypeColor(session.sessionType)}`}>
                              {session.sessionType.replace('_', ' ').toLowerCase()}
                            </badge_1.Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <badge_1.Badge className={`text-xs ${getStatusColor(((_a = session.summary) === null || _a === void 0 ? void 0 : _a.resolutionStatus) || "PENDING")}`}>
                              {((_b = session.summary) === null || _b === void 0 ? void 0 : _b.resolutionStatus) || "Pending"}
                            </badge_1.Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <lucide_react_1.Calendar className="h-4 w-4 mr-2"/>
                            <span>{(0, date_fns_1.format)(new Date(session.createdAt), "PPP")}</span>
                            <span className="mx-2">•</span>
                            <span>{(0, date_fns_1.formatDistanceToNow)(new Date(session.createdAt))} ago</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <lucide_react_1.User className="h-4 w-4 mr-2"/>
                            <span>Conducted by: {((_c = session.volunteer) === null || _c === void 0 ? void 0 : _c.name) || "Unknown"}</span>
                          </div>

                          {((_d = session.summary) === null || _d === void 0 ? void 0 : _d.summary) && (<div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{session.summary.summary}</p>
                            </div>)}

                          {/* Concerns Discussed */}
                          {((_f = (_e = session.summary) === null || _e === void 0 ? void 0 : _e.concernsDiscussed) === null || _f === void 0 ? void 0 : _f.length) > 0 && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Concerns Discussed:</h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.concernsDiscussed.map((concern, i) => (<badge_1.Badge key={i} variant="outline" className="text-xs">
                                    {concern}
                                  </badge_1.Badge>))}
                              </div>
                            </div>)}

                          {/* Cultural Stories Used */}
                          {((_h = (_g = session.summary) === null || _g === void 0 ? void 0 : _g.culturalStoriesUsed) === null || _h === void 0 ? void 0 : _h.length) > 0 && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1 flex items-center gap-1">
                                <lucide_react_1.BookOpen className="h-3 w-3"/>
                                Cultural Stories Used:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.culturalStoriesUsed.map((story, i) => (<badge_1.Badge key={i} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {story}
                                  </badge_1.Badge>))}
                              </div>
                            </div>)}

                          {/* Next Steps */}
                          {((_k = (_j = session.summary) === null || _j === void 0 ? void 0 : _j.nextSteps) === null || _k === void 0 ? void 0 : _k.length) > 0 && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Next Steps:</h5>
                              <ul className="text-xs text-gray-700 space-y-1">
                                {session.summary.nextSteps.map((step, i) => (<li key={i} className="flex items-start gap-1">
                                    <span className="text-orange-600">•</span>
                                    <span>{step}</span>
                                  </li>))}
                              </ul>
                            </div>)}

                          {/* Follow-up Info */}
                          {((_l = session.summary) === null || _l === void 0 ? void 0 : _l.followUpNeeded) && (<div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-1 text-xs text-yellow-800">
                                <lucide_react_1.Clock className="h-3 w-3"/>
                                <span className="font-medium">Follow-up needed</span>
                                {session.summary.followUpDate && (<span>
                                    by {(0, date_fns_1.format)(new Date(session.summary.followUpDate), "PP")}
                                  </span>)}
                              </div>
                            </div>)}

                          {/* View Details Button */}
                          {session.summary && (<div className="mt-3 pt-3 border-t border-gray-200">
                              <session_summary_details_dialog_1.SessionSummaryDetailsDialog session={session} trigger={<button_1.Button variant="outline" size="sm" className="w-full">
                                    <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
                                    View Detailed Summary
                                  </button_1.Button>}/>
                            </div>)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </div>
                </div>
              </div>);
        })}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.SessionHistory = SessionHistory;
