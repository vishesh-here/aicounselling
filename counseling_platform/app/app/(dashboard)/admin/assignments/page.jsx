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
const assignment_manager_1 = require("@/components/admin/assignment-manager");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
exports.dynamic = "force-dynamic";
function getAssignmentData() {
    return __awaiter(this, void 0, void 0, function* () {
        const [children, volunteers, assignments] = yield Promise.all([
            db_1.prisma.child.findMany({
                where: { isActive: true },
                include: {
                    assignments: {
                        where: { isActive: true },
                        include: {
                            volunteer: {
                                select: { id: true, name: true, email: true, specialization: true }
                            }
                        }
                    },
                    concerns: {
                        where: { status: { not: "RESOLVED" } }
                    }
                },
                orderBy: { name: "asc" }
            }),
            db_1.prisma.user.findMany({
                where: {
                    role: "VOLUNTEER",
                    approvalStatus: "APPROVED",
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    specialization: true,
                    state: true
                },
                orderBy: { name: "asc" }
            }),
            db_1.prisma.assignment.findMany({
                where: { isActive: true },
                include: {
                    child: {
                        select: { id: true, name: true, age: true, state: true }
                    },
                    volunteer: {
                        select: { id: true, name: true, email: true, specialization: true }
                    }
                },
                orderBy: { assignedAt: "desc" }
            })
        ]);
        return { children, volunteers, assignments };
    });
}
function AssignmentsPage() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        if (((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
            return (<div className="p-6">
        <card_1.Card>
          <card_1.CardContent className="text-center py-12">
            <lucide_react_1.AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You need admin privileges to access this page.
            </p>
            <link_1.default href="/dashboard">
              <button_1.Button variant="outline">Back to Dashboard</button_1.Button>
            </link_1.default>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
        }
        const { children, volunteers, assignments } = yield getAssignmentData();
        const stats = {
            totalChildren: children.length,
            assignedChildren: children.filter(child => child.assignments.length > 0).length,
            unassignedChildren: children.filter(child => child.assignments.length === 0).length,
            totalVolunteers: volunteers.length,
            activeAssignments: assignments.length
        };
        return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage volunteer-child assignments and track coverage
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalChildren}</p>
              <p className="text-sm text-gray-600">Total Children</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.assignedChildren}</p>
              <p className="text-sm text-gray-600">Assigned</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.unassignedChildren}</p>
              <p className="text-sm text-gray-600">Unassigned</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalVolunteers}</p>
              <p className="text-sm text-gray-600">Active Volunteers</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.activeAssignments}</p>
              <p className="text-sm text-gray-600">Total Assignments</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Assignment Manager Component */}
      <assignment_manager_1.AssignmentManager children={children} volunteers={volunteers} assignments={assignments}/>
    </div>);
    });
}
exports.default = AssignmentsPage;
