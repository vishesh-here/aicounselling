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
exports.POST = exports.GET = exports.dynamic = void 0;
exports.dynamic = "force-dynamic";
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET - Fetch all users for approval management
function GET() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== 'ADMIN') {
                return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const users = yield prisma.user.findMany({
                where: {
                    role: 'VOLUNTEER'
                },
                include: {
                    approver: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: [
                    { approvalStatus: 'asc' },
                    { createdAt: 'desc' }
                ]
            });
            // Remove sensitive data before sending
            const sanitizedUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                state: user.state,
                specialization: user.specialization,
                experience: user.experience,
                motivation: user.motivation,
                approvalStatus: user.approvalStatus,
                rejectionReason: user.rejectionReason,
                createdAt: user.createdAt,
                approvedBy: user.approvedBy,
                approvedAt: user.approvedAt,
                approver: user.approver
            }));
            return server_1.NextResponse.json({ users: sanitizedUsers });
        }
        catch (error) {
            console.error('Error fetching users:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.GET = GET;
// POST - Approve or reject a user
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== 'ADMIN') {
                return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const body = yield request.json();
            const { userId, action, rejectionReason } = body;
            if (!userId || !action || !['approve', 'reject'].includes(action)) {
                return server_1.NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
            }
            if (action === 'reject' && !(rejectionReason === null || rejectionReason === void 0 ? void 0 : rejectionReason.trim())) {
                return server_1.NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
            }
            // Get the user to be updated
            const user = yield prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return server_1.NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            if (user.approvalStatus !== 'PENDING') {
                return server_1.NextResponse.json({ error: 'User has already been processed' }, { status: 400 });
            }
            // Update user based on action
            const updateData = {
                approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
                approvedBy: session.user.id,
                approvedAt: new Date()
            };
            if (action === 'approve') {
                updateData.isActive = true;
            }
            else {
                updateData.rejectionReason = rejectionReason.trim();
                updateData.isActive = false;
            }
            const updatedUser = yield prisma.user.update({
                where: { id: userId },
                data: updateData,
                include: {
                    approver: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            // Remove sensitive data before sending
            const sanitizedUser = {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                approvalStatus: updatedUser.approvalStatus,
                approvedBy: updatedUser.approvedBy,
                approvedAt: updatedUser.approvedAt,
                rejectionReason: updatedUser.rejectionReason,
                approver: updatedUser.approver
            };
            return server_1.NextResponse.json({
                message: `User ${action}d successfully`,
                user: sanitizedUser
            });
        }
        catch (error) {
            console.error('Error processing user action:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.POST = POST;
