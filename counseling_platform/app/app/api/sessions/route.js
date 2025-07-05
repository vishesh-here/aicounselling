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
exports.POST = exports.dynamic = void 0;
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
exports.dynamic = "force-dynamic";
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = yield request.json();
            const { child_id, sessionId, action, notes } = body;
            if (action === "start") {
                // Check if there's already an active session for this child
                const existingSession = yield db_1.prisma.session.findFirst({
                    where: {
                        child_id: child_id,
                        status: { in: ["PLANNED", "IN_PROGRESS"] }
                    }
                });
                if (existingSession) {
                    // Update existing session to IN_PROGRESS
                    const updatedSession = yield db_1.prisma.session.update({
                        where: { id: existingSession.id },
                        data: {
                            status: "IN_PROGRESS",
                            startedAt: new Date()
                        },
                        include: {
                            child: true,
                            volunteer: { select: { name: true, email: true } }
                        }
                    });
                    return server_1.NextResponse.json({
                        success: true,
                        message: "Session started successfully",
                        session: updatedSession
                    });
                }
                else {
                    // Create new session
                    const newSession = yield db_1.prisma.session.create({
                        data: {
                            child_id: child_id,
                            volunteerId: session.user.id,
                            status: "IN_PROGRESS",
                            sessionType: "COUNSELING",
                            startedAt: new Date()
                        },
                        include: {
                            child: true,
                            volunteer: { select: { name: true, email: true } }
                        }
                    });
                    return server_1.NextResponse.json({
                        success: true,
                        message: "Session created and started successfully",
                        session: newSession
                    });
                }
            }
            if (action === "end" && sessionId) {
                // End the session
                const updatedSession = yield db_1.prisma.session.update({
                    where: { id: sessionId },
                    data: {
                        status: "COMPLETED",
                        endedAt: new Date(),
                        notes: notes || undefined
                    }
                });
                return server_1.NextResponse.json({
                    success: true,
                    message: "Session ended successfully",
                    session: updatedSession
                });
            }
            return server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        catch (error) {
            console.error("Session API error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.POST = POST;
