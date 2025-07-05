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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = exports.dynamic = void 0;
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
exports.dynamic = "force-dynamic";
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== "ADMIN") {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = yield request.json();
            const { action, child_id, volunteerId, assignmentId } = body;
            if (action === "assign") {
                // Check if assignment already exists
                const existingAssignment = yield db_1.prisma.assignment.findFirst({
                    where: {
                        child_id: child_id,
                        volunteerId: volunteerId,
                        isActive: true
                    }
                });
                if (existingAssignment) {
                    return server_1.NextResponse.json({ error: "Assignment already exists for this volunteer and child" }, { status: 400 });
                }
                // Create new assignment
                const assignment = yield db_1.prisma.assignment.create({
                    data: {
                        child_id: child_id,
                        volunteerId: volunteerId,
                        isActive: true
                    },
                    include: {
                        child: {
                            select: { name: true, age: true, state: true }
                        },
                        volunteer: {
                            select: { name: true, email: true, specialization: true }
                        }
                    }
                });
                return server_1.NextResponse.json({
                    success: true,
                    message: "Assignment created successfully",
                    assignment
                });
            }
            if (action === "remove" && assignmentId) {
                // Deactivate assignment instead of deleting
                const assignment = yield db_1.prisma.assignment.update({
                    where: { id: assignmentId },
                    data: { isActive: false }
                });
                return server_1.NextResponse.json({
                    success: true,
                    message: "Assignment removed successfully",
                    assignment
                });
            }
            return server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        catch (error) {
            console.error("Assignment API error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.POST = POST;
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== "ADMIN") {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const assignments = yield db_1.prisma.assignment.findMany({
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
            });
            return server_1.NextResponse.json({ assignments });
        }
        catch (error) {
            console.error("Assignment fetch error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.GET = GET;
