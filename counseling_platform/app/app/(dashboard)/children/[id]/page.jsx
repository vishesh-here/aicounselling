"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const pre_session_briefing_1 = require("@/components/children/pre-session-briefing");
const session_history_1 = require("@/components/children/session-history");
const profile_details_1 = require("@/components/children/profile-details");
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
exports.dynamic = "force-dynamic";
function getChildData(childId, userRole, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check access permissions
        const child = yield db_1.prisma.child.findUnique({
            where: { id: childId, isActive: true },
            include: {
                assignments: {
                    include: {
                        volunteer: {
                            select: { id: true, name: true, email: true, specialization: true }
                        }
                    }
                },
                sessions: {
                    include: {
                        volunteer: { select: { name: true } },
                        summary: true
                    },
                    orderBy: { createdAt: "desc" }
                },
                concerns: {
                    orderBy: { createdAt: "desc" }
                },
                tags: true
            }
        });
        if (!child) {
            throw new Error("Child not found");
        }
        // Check access permissions for volunteers
        if (userRole === "VOLUNTEER") {
            const hasAccess = child.assignments.some(assignment => assignment.volunteerId === userId && assignment.isActive);
            if (!hasAccess) {
                throw new Error("Access denied");
            }
        }
        return child;
    });
}
function ChildDetailPage({ params }) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        const userRole = ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) || "VOLUNTEER";
        const userId = ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) || "";
        try {
            const child = yield getChildData(params.id, userRole, userId);
            const activeAssignment = child.assignments.find(a => a.isActive);
            const activeConcerns = child.concerns.filter(c => c.status !== "RESOLVED");
            const lastSession = child.sessions[0];
            const getSeverityColor = (severity) => {
                switch (severity) {
                    case "HIGH": return "bg-red-100 text-red-800";
                    case "MEDIUM": return "bg-yellow-100 text-yellow-800";
                    case "LOW": return "bg-green-100 text-green-800";
                    default: return "bg-gray-100 text-gray-800";
                }
            };
            const getStatusColor = (status) => {
                switch (status) {
                    case "RESOLVED": return "bg-green-100 text-green-800";
                    case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
                    case "OPEN": return "bg-yellow-100 text-yellow-800";
                    case "CLOSED": return "bg-gray-100 text-gray-800";
                    default: return "bg-gray-100 text-gray-800";
                }
            };
            return (<div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <lucide_react_1.User className="h-8 w-8 text-orange-600"/>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mt-1">
                <span>{child.age} years old</span>
                <span>•</span>
                <span className="capitalize">{child.gender.toLowerCase()}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <lucide_react_1.MapPin className="h-4 w-4"/>
                  <span>{child.state}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Assigned to:</span>
                <badge_1.Badge variant="outline">
                  {((_c = activeAssignment === null || activeAssignment === void 0 ? void 0 : activeAssignment.volunteer) === null || _c === void 0 ? void 0 : _c.name) || "Unassigned"}
                </badge_1.Badge>
                {((_d = activeAssignment === null || activeAssignment === void 0 ? void 0 : activeAssignment.volunteer) === null || _d === void 0 ? void 0 : _d.specialization) && (<badge_1.Badge variant="secondary" className="text-xs">
                    {activeAssignment.volunteer.specialization}
                  </badge_1.Badge>)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeConcerns.length > 0 && (<link_1.default href={`/session/${child.id}`}>
                <button_1.Button className="bg-orange-600 hover:bg-orange-700">
                  <lucide_react_1.MessageCircle className="h-4 w-4 mr-2"/>
                  Start Session
                </button_1.Button>
              </link_1.default>)}
            <button_1.Button variant="outline">
              <lucide_react_1.Heart className="h-4 w-4 mr-2"/>
              Add to Favorites
            </button_1.Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{child.sessions.length}</p>
                </div>
                <lucide_react_1.Calendar className="h-8 w-8 text-blue-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Concerns</p>
                  <p className="text-2xl font-bold text-gray-900">{activeConcerns.length}</p>
                </div>
                <lucide_react_1.AlertCircle className="h-8 w-8 text-orange-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Session</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lastSession
                    ? (0, date_fns_1.formatDistanceToNow)(new Date(lastSession.createdAt)) + " ago"
                    : "No sessions yet"}
                  </p>
                </div>
                <lucide_react_1.Clock className="h-8 w-8 text-green-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-sm font-medium text-gray-900">
                    {((_e = lastSession === null || lastSession === void 0 ? void 0 : lastSession.summary) === null || _e === void 0 ? void 0 : _e.resolutionStatus) || "Assessment needed"}
                  </p>
                </div>
                <lucide_react_1.CheckCircle className="h-8 w-8 text-purple-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Active Concerns Alert */}
        {activeConcerns.length > 0 && (<card_1.Card className="border-orange-200 bg-orange-50">
            <card_1.CardContent className="p-4">
              <div className="flex items-start gap-3">
                <lucide_react_1.AlertCircle className="h-5 w-5 text-orange-600 mt-0.5"/>
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900 mb-2">Active Concerns Requiring Attention</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeConcerns.map((concern) => (<badge_1.Badge key={concern.id} className={getSeverityColor(concern.severity)}>
                        {concern.category}: {concern.title}
                      </badge_1.Badge>))}
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Main Content Tabs */}
        <tabs_1.Tabs defaultValue="briefing" className="space-y-6">
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="briefing" className="flex items-center gap-2">
              <lucide_react_1.Brain className="h-4 w-4"/>
              Pre-Session Briefing
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="history" className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-4 w-4"/>
              Session History
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="profile" className="flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4"/>
              Profile Details
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="briefing">
            <pre_session_briefing_1.PreSessionBriefing child={child}/>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="history">
            <session_history_1.SessionHistory sessions={child.sessions}/>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="profile">
            <profile_details_1.ProfileDetails child={child} userRole={userRole}/>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>);
        }
        catch (error) {
            return (<div className="p-6">
        <card_1.Card>
          <card_1.CardContent className="text-center py-12">
            <lucide_react_1.AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to view this child's profile.
            </p>
            <link_1.default href="/children">
              <button_1.Button variant="outline">Back to Children</button_1.Button>
            </link_1.default>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
        }
    });
}
exports.default = ChildDetailPage;
