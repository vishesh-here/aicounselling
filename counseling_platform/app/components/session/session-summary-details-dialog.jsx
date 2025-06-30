"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSummaryDetailsDialog = void 0;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const badge_1 = require("@/components/ui/badge");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function SessionSummaryDetailsDialog({ session, trigger }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const [open, setOpen] = (0, react_1.useState)(false);
    const summary = session.summary;
    if (!summary) {
        return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
        <dialog_1.DialogTrigger asChild>{trigger}</dialog_1.DialogTrigger>
        <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Session Summary</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
            <p>No detailed summary available for this session.</p>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>);
    }
    const getStatusColor = (status) => {
        switch (status) {
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "ESCALATED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    const getEngagementColor = (level) => {
        switch (level === null || level === void 0 ? void 0 : level.toLowerCase()) {
            case "high": return "text-green-600";
            case "medium": return "text-yellow-600";
            case "low": return "text-red-600";
            default: return "text-gray-600";
        }
    };
    const getEffectivenessColor = (rating) => {
        const num = parseInt(rating);
        if (num >= 4)
            return "text-green-600";
        if (num >= 3)
            return "text-yellow-600";
        return "text-red-600";
    };
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>{trigger}</dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <div className="flex items-center justify-between">
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <lucide_react_1.FileText className="h-5 w-5"/>
              Detailed Session Summary
            </dialog_1.DialogTitle>
            <div className="flex items-center gap-2">
              <badge_1.Badge className={getStatusColor(summary.resolutionStatus)}>
                {summary.resolutionStatus}
              </badge_1.Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <lucide_react_1.Calendar className="h-4 w-4"/>
              {(0, date_fns_1.format)(new Date(session.createdAt), "PPP")}
            </div>
            <div className="flex items-center gap-1">
              <lucide_react_1.User className="h-4 w-4"/>
              {((_a = session.volunteer) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Volunteer"}
            </div>
            <div className="flex items-center gap-1">
              <lucide_react_1.Clock className="h-4 w-4"/>
              {summary.sessionDuration || "Duration not recorded"}
            </div>
          </div>
        </dialog_1.DialogHeader>

        <tabs_1.Tabs defaultValue="overview" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-6">
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="mood">Mood & State</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="content">Content</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="techniques">Techniques</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="planning">Planning</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Overview Tab */}
          <tabs_1.TabsContent value="overview" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Activity className="h-5 w-5"/>
                  Session Overview
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Summary</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{summary.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Session Type</h4>
                    <badge_1.Badge variant="outline">{summary.sessionType || session.sessionType}</badge_1.Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Engagement Level</h4>
                    <span className={`font-medium ${getEngagementColor(summary.engagementLevel)}`}>
                      {summary.engagementLevel || "Not assessed"}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Session Effectiveness</h4>
                    <span className={`font-medium ${getEffectivenessColor(summary.sessionEffectiveness)}`}>
                      {summary.sessionEffectiveness ? `${summary.sessionEffectiveness}/5` : "Not rated"}
                    </span>
                  </div>
                </div>

                {summary.participationNotes && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Participation Notes</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.participationNotes}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Mood & State Tab */}
          <tabs_1.TabsContent value="mood" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Heart className="h-5 w-5"/>
                  Mood & Emotional State
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Initial Mood</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {summary.initialMood || "Not recorded"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Final Mood</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                      {summary.finalMood || "Not recorded"}
                    </p>
                  </div>
                </div>

                {summary.moodChanges && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Mood Changes During Session</h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{summary.moodChanges}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Content Tab */}
          <tabs_1.TabsContent value="content" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.MessageCircle className="h-5 w-5"/>
                  Session Content
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {((_b = summary.topicsDiscussed) === null || _b === void 0 ? void 0 : _b.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Topics Discussed</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.topicsDiscussed.map((topic, index) => (<badge_1.Badge key={index} variant="secondary">{topic}</badge_1.Badge>))}
                    </div>
                  </div>)}

                {((_c = summary.concernsDiscussed) === null || _c === void 0 ? void 0 : _c.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Concerns Addressed</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.concernsDiscussed.map((concern, index) => (<badge_1.Badge key={index} variant="outline" className="bg-orange-50 text-orange-800">
                          {concern}
                        </badge_1.Badge>))}
                    </div>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Techniques Tab */}
          <tabs_1.TabsContent value="techniques" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BookOpen className="h-5 w-5"/>
                  Techniques & Cultural Elements
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {((_d = summary.techniquesUsed) === null || _d === void 0 ? void 0 : _d.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Counseling Techniques Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.techniquesUsed.map((technique, index) => (<badge_1.Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                          {technique}
                        </badge_1.Badge>))}
                    </div>
                  </div>)}

                {((_e = summary.culturalStoriesUsed) === null || _e === void 0 ? void 0 : _e.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Cultural Stories Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.culturalStoriesUsed.map((story, index) => (<badge_1.Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {story}
                        </badge_1.Badge>))}
                    </div>
                  </div>)}

                {summary.storyResponse && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Response to Cultural Stories</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.storyResponse}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Insights Tab */}
          <tabs_1.TabsContent value="insights" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Lightbulb className="h-5 w-5"/>
                  Insights & Breakthroughs
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {summary.breakthroughs && (<div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.Star className="h-4 w-4 text-yellow-500"/>
                      Breakthroughs & Key Moments
                    </h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      {summary.breakthroughs}
                    </p>
                  </div>)}

                {summary.keyInsights && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Insights About the Child</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{summary.keyInsights}</p>
                  </div>)}

                {summary.challengesFaced && (<div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
                      Challenges Faced
                    </h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">{summary.challengesFaced}</p>
                  </div>)}

                {summary.challengeHandling && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">How Challenges Were Handled</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.challengeHandling}</p>
                  </div>)}

                {summary.progressMade && (<div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500"/>
                      Progress Made
                    </h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{summary.progressMade}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Planning Tab */}
          <tabs_1.TabsContent value="planning" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Target className="h-5 w-5"/>
                  Planning & Next Steps
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {((_f = summary.actionItems) === null || _f === void 0 ? void 0 : _f.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                    <ul className="space-y-2">
                      {summary.actionItems.map((item, index) => (<li key={index} className="flex items-start gap-2">
                          <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0"/>
                          <span className="text-gray-700">{item}</span>
                        </li>))}
                    </ul>
                  </div>)}

                {((_g = summary.nextSteps) === null || _g === void 0 ? void 0 : _g.length) > 0 && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                    <ul className="space-y-2">
                      {summary.nextSteps.map((step, index) => (<li key={index} className="flex items-start gap-2">
                          <lucide_react_1.Target className="h-4 w-4 text-blue-600 mt-0.5 shrink-0"/>
                          <span className="text-gray-700">{step}</span>
                        </li>))}
                    </ul>
                  </div>)}

                {summary.recommendations && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.recommendations}</p>
                  </div>)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Volunteer Confidence</h4>
                    <span className={`font-medium ${getEffectivenessColor(summary.volunteerConfidence)}`}>
                      {summary.volunteerConfidence ? `${summary.volunteerConfidence}/5` : "Not rated"}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Session Timing</h4>
                    <span className="text-gray-700">{summary.nextSessionTiming || "Not specified"}</span>
                  </div>
                </div>

                {summary.nextSessionFocus && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Session Focus</h4>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg">{summary.nextSessionFocus}</p>
                  </div>)}

                {summary.followUpNeeded && (<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                      <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                      Follow-up Required
                    </div>
                    {summary.followUpDate && (<p className="text-yellow-800 text-sm">
                        Scheduled for: {(0, date_fns_1.format)(new Date(summary.followUpDate), "PPP")}
                      </p>)}
                  </div>)}

                {summary.additionalNotes && (<div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{summary.additionalNotes}</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
exports.SessionSummaryDetailsDialog = SessionSummaryDetailsDialog;
