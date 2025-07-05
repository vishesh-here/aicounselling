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
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const session_interface_1 = require("@/components/session/session-interface");
exports.dynamic = "force-dynamic";
function getSessionData(child_id, userRole, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if there's an active session for this child
        let activeSession = yield db_1.prisma.session.findFirst({
            where: {
                child_id: child_id,
                status: { in: ["PLANNED", "IN_PROGRESS"] }
            },
            include: {
                child: {
                    include: {
                        concerns: {
                            where: { status: { not: "RESOLVED" } }
                        },
                        assignments: {
                            include: {
                                volunteer: {
                                    select: { id: true, name: true, email: true }
                                }
                            }
                        }
                    }
                },
                volunteer: {
                    select: { name: true, email: true }
                },
                summary: true,
                chatMessages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });
        // Get child data for access control
        const child = yield db_1.prisma.child.findUnique({
            where: { id: child_id, isActive: true },
            include: {
                assignments: {
                    include: {
                        volunteer: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
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
        return { activeSession, child };
    });
}
function SessionPage({ params }) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        const userRole = ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) || "VOLUNTEER";
        const userId = ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) || "";
        try {
            const { activeSession, child } = yield getSessionData(params.id, userRole, userId);
            return (<div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <link_1.default href={`/children/${params.id}`}>
              <button_1.Button variant="outline" size="sm">
                ← Back to Profile
              </button_1.Button>
            </link_1.default>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Session with {child.name}
              </h1>
              <p className="text-gray-600">
                {child.age} years old • {child.state}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSession ? (<badge_1.Badge variant="secondary" className={`${activeSession.status === "IN_PROGRESS"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"}`}>
                <lucide_react_1.PlayCircle className="h-3 w-3 mr-1"/>
                {activeSession.status === "IN_PROGRESS" ? "Session Active" : "Session Planned"}
              </badge_1.Badge>) : (<badge_1.Badge variant="outline">
                No Active Session
              </badge_1.Badge>)}
          </div>
        </div>

        {/* Session Interface */}
        <session_interface_1.SessionInterface child={child} activeSession={activeSession} userId={userId} userRole={userRole}/>
      </div>);
        }
        catch (error) {
            return (<div className="p-6">
        <card_1.Card>
          <card_1.CardContent className="text-center py-12">
            <lucide_react_1.AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this session.
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
exports.default = SessionPage;
