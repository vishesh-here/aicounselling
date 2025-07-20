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
                <p className="text-sm text-gray-600">Sessions with Summaries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.summary).length}
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
                <p className="text-sm text-gray-600">Effective Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => { var _a; return ((_a = s.summary) === null || _a === void 0 ? void 0 : _a.effectiveness) === "Effective"; }).length}
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
                <p className="text-sm text-gray-600">Sessions with Follow-ups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => { var _a; return (_a = s.summary) === null || _a === void 0 ? void 0 : _a.followup_notes; }).length}
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
                            <badge_1.Badge className={`text-xs ${session.summary ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {session.summary ? "Completed" : "No Summary"}
                            </badge_1.Badge>
                            {session.summary && session.summary.effectiveness && (
                              <badge_1.Badge className={`text-xs ${session.summary.effectiveness === "Effective" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {session.summary.effectiveness}
                              </badge_1.Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <lucide_react_1.Calendar className="h-4 w-4 mr-2"/>
                            <span>{(0, date_fns_1.format)(new Date(session.startedAt || session.createdAt), "PPP 'at' p")}</span>
                            <span className="mx-2">•</span>
                            <span>{(0, date_fns_1.formatDistanceToNow)(new Date(session.startedAt || session.createdAt))} ago</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <lucide_react_1.User className="h-4 w-4 mr-2"/>
                            <span>Conducted by: {((_c = session.volunteer) === null || _c === void 0 ? void 0 : _c.name) || "Unknown"}</span>
                          </div>

                          {((_d = session.summary) === null || _d === void 0 ? void 0 : _d.summary) && (<div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{session.summary.summary}</p>
                            </div>)}

                          {/* Follow-up Notes */}
                          {((_e = session.summary) === null || _e === void 0 ? void 0 : _e.followup_notes) && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Follow-up Notes:</h5>
                              <p className="text-xs text-gray-700">{session.summary.followup_notes}</p>
                            </div>)}

                          {/* New Concerns */}
                          {((_f = (_e = session.summary) === null || _e === void 0 ? void 0 : _e.new_concerns) === null || _f === void 0 ? void 0 : _f.length) > 0 && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">New Concerns:</h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.new_concerns.map((concern, i) => (<badge_1.Badge key={i} variant="outline" className="text-xs">
                                    {typeof concern === 'object' ? concern.title : concern}
                                  </badge_1.Badge>))}
                              </div>
                            </div>)}

                          {/* Resolved Concerns */}
                          {((_g = session.summary) === null || _g === void 0 ? void 0 : _g.resolved_concerns) && session.summary.resolved_concerns.length > 0 && (<div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Resolved Concerns:</h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.resolved_concerns.map((concern, i) => (<badge_1.Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    {concern}
                                  </badge_1.Badge>))}
                              </div>
                            </div>)}

                          {/* Next Session Date */}
                          {((_h = session.summary) === null || _h === void 0 ? void 0 : _h.next_session_date) && (<div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-1 text-xs text-blue-800">
                                <lucide_react_1.Calendar className="h-3 w-3"/>
                                <span className="font-medium">Next session scheduled for:</span>
                                <span>{(0, date_fns_1.format)(new Date(session.summary.next_session_date), "PP")}</span>
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
