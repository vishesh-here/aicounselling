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
// GET - Fetch all children with optional filtering
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            const state = searchParams.get('state');
            const gender = searchParams.get('gender');
            const ageMin = searchParams.get('ageMin');
            const ageMax = searchParams.get('ageMax');
            const assignedOnly = searchParams.get('assignedOnly');
            // Build filter conditions
            const where = {
                isActive: true
            };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { district: { contains: search, mode: 'insensitive' } },
                    { interests: { hasSome: [search] } },
                    { challenges: { hasSome: [search] } }
                ];
            }
            if (state) {
                where.state = state;
            }
            if (gender) {
                where.gender = gender;
            }
            if (ageMin) {
                where.age = Object.assign(Object.assign({}, where.age), { gte: parseInt(ageMin) });
            }
            if (ageMax) {
                where.age = Object.assign(Object.assign({}, where.age), { lte: parseInt(ageMax) });
            }
            // Handle assignment filtering
            if (session.user.role === 'VOLUNTEER' && assignedOnly === 'true') {
                where.assignments = {
                    some: {
                        volunteerId: session.user.id,
                        isActive: true
                    }
                };
            }
            const children = yield prisma.child.findMany({
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
                        orderBy: { createdAt: 'desc' },
                        take: 3
                    },
                    sessions: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: {
                            volunteer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { createdAt: 'desc' }
                ]
            });
            return server_1.NextResponse.json({ children });
        }
        catch (error) {
            console.error('Error fetching children:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.GET = GET;
// POST - Create a new child profile
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== 'ADMIN') {
                return server_1.NextResponse.json({ error: 'Unauthorized. Only administrators can create child profiles.' }, { status: 401 });
            }
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
            // Check if child with same name, age, and district already exists
            const existingChild = yield prisma.child.findFirst({
                where: {
                    name: name.trim(),
                    age: age,
                    district: district.trim(),
                    isActive: true
                }
            });
            if (existingChild) {
                return server_1.NextResponse.json({ errors: { name: 'A child with the same name, age, and district already exists' } }, { status: 400 });
            }
            // Create the child profile
            const child = yield prisma.child.create({
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
                    isActive: true
                }
            });
            return server_1.NextResponse.json({
                message: 'Child profile created successfully',
                child: {
                    id: child.id,
                    name: child.name,
                    age: child.age,
                    gender: child.gender,
                    state: child.state,
                    district: child.district
                }
            }, { status: 201 });
        }
        catch (error) {
            console.error('Error creating child:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.POST = POST;
