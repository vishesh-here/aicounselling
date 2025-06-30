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
exports.DELETE = exports.PUT = exports.GET = exports.dynamic = void 0;
exports.dynamic = "force-dynamic";
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET - Fetch a specific child by ID
function GET(request, { params }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { id } = params;
            // Build filter conditions based on user role
            const where = {
                id: id,
                isActive: true
            };
            // For volunteers, only show assigned children
            if (session.user.role === 'VOLUNTEER') {
                where.assignments = {
                    some: {
                        volunteerId: session.user.id,
                        isActive: true
                    }
                };
            }
            const child = yield prisma.child.findFirst({
                where,
                include: {
                    assignments: {
                        where: { isActive: true },
                        include: {
                            volunteer: {
                                select: {
                                    id: true,
                                    name: true,
                                    specialization: true
                                }
                            }
                        }
                    },
                    concerns: {
                        where: { status: { not: 'CLOSED' } },
                        orderBy: { createdAt: 'desc' }
                    },
                    sessions: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            volunteer: {
                                select: {
                                    name: true
                                }
                            },
                            summary: true
                        }
                    }
                }
            });
            if (!child) {
                return server_1.NextResponse.json({ error: 'Child not found' }, { status: 404 });
            }
            return server_1.NextResponse.json({ child });
        }
        catch (error) {
            console.error('Error fetching child:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.GET = GET;
// PUT - Update a child profile
function PUT(request, { params }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== 'ADMIN') {
                return server_1.NextResponse.json({ error: 'Unauthorized. Only administrators can update child profiles.' }, { status: 401 });
            }
            const { id } = params;
            const body = yield request.json();
            const { name, age, gender, state, district, background, schoolLevel, interests, challenges, language } = body;
            // Validation
            const errors = {};
            if (!(name === null || name === void 0 ? void 0 : name.trim())) {
                errors.name = 'Child name is required';
            }
            if (!age || age < 5 || age > 18) {
                errors.age = 'Age must be between 5 and 18 years';
            }
            if (!gender || !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
                errors.gender = 'Please select a valid gender';
            }
            if (!(state === null || state === void 0 ? void 0 : state.trim())) {
                errors.state = 'State is required';
            }
            if (!(district === null || district === void 0 ? void 0 : district.trim())) {
                errors.district = 'District is required';
            }
            if (!(background === null || background === void 0 ? void 0 : background.trim())) {
                errors.background = 'Background information is required';
            }
            if (!(schoolLevel === null || schoolLevel === void 0 ? void 0 : schoolLevel.trim())) {
                errors.schoolLevel = 'School level is required';
            }
            if (!interests || !Array.isArray(interests) || interests.length === 0) {
                errors.interests = 'At least one interest is required';
            }
            if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
                errors.challenges = 'At least one challenge is required';
            }
            if (!(language === null || language === void 0 ? void 0 : language.trim())) {
                errors.language = 'Preferred language is required';
            }
            if (Object.keys(errors).length > 0) {
                return server_1.NextResponse.json({ errors }, { status: 400 });
            }
            // Check if child exists
            const existingChild = yield prisma.child.findFirst({
                where: {
                    id: id,
                    isActive: true
                }
            });
            if (!existingChild) {
                return server_1.NextResponse.json({ error: 'Child not found' }, { status: 404 });
            }
            // Check if another child with same name, age, and district already exists (excluding current child)
            const duplicateChild = yield prisma.child.findFirst({
                where: {
                    name: name.trim(),
                    age: age,
                    district: district.trim(),
                    isActive: true,
                    id: { not: id }
                }
            });
            if (duplicateChild) {
                return server_1.NextResponse.json({ errors: { name: 'A child with the same name, age, and district already exists' } }, { status: 400 });
            }
            // Update the child profile
            const updatedChild = yield prisma.child.update({
                where: { id: id },
                data: {
                    name: name.trim(),
                    age: age,
                    gender: gender,
                    state: state.trim(),
                    district: district.trim(),
                    background: background.trim(),
                    schoolLevel: schoolLevel.trim(),
                    interests: interests.map((i) => i.trim()),
                    challenges: challenges.map((c) => c.trim()),
                    language: language.trim(),
                    updatedAt: new Date()
                }
            });
            return server_1.NextResponse.json({
                message: 'Child profile updated successfully',
                child: {
                    id: updatedChild.id,
                    name: updatedChild.name,
                    age: updatedChild.age,
                    gender: updatedChild.gender,
                    state: updatedChild.state,
                    district: updatedChild.district
                }
            });
        }
        catch (error) {
            console.error('Error updating child:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.PUT = PUT;
// DELETE - Soft delete a child profile
function DELETE(request, { params }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== 'ADMIN') {
                return server_1.NextResponse.json({ error: 'Unauthorized. Only administrators can delete child profiles.' }, { status: 401 });
            }
            const { id } = params;
            // Check if child exists
            const existingChild = yield prisma.child.findFirst({
                where: {
                    id: id,
                    isActive: true
                }
            });
            if (!existingChild) {
                return server_1.NextResponse.json({ error: 'Child not found' }, { status: 404 });
            }
            // Soft delete the child (set isActive to false)
            yield prisma.child.update({
                where: { id: id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            // Also deactivate any active assignments
            yield prisma.assignment.updateMany({
                where: {
                    childId: id,
                    isActive: true
                },
                data: {
                    isActive: false
                }
            });
            return server_1.NextResponse.json({
                message: 'Child profile deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting child:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.DELETE = DELETE;
