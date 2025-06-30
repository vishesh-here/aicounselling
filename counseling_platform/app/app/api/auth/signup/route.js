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
exports.POST = void 0;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = yield request.json();
            const { name, email, password, phone, state, specialization, experience, motivation } = body;
            // Validation
            const errors = {};
            if (!(name === null || name === void 0 ? void 0 : name.trim())) {
                errors.name = 'Full name is required';
            }
            if (!(email === null || email === void 0 ? void 0 : email.trim())) {
                errors.email = 'Email is required';
            }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please enter a valid email address';
            }
            if (!password) {
                errors.password = 'Password is required';
            }
            else if (password.length < 8) {
                errors.password = 'Password must be at least 8 characters long';
            }
            if (!(phone === null || phone === void 0 ? void 0 : phone.trim())) {
                errors.phone = 'Phone number is required';
            }
            if (!state) {
                errors.state = 'Please select your state';
            }
            if (!specialization) {
                errors.specialization = 'Please select your area of specialization';
            }
            if (!(experience === null || experience === void 0 ? void 0 : experience.trim())) {
                errors.experience = 'Please describe your experience';
            }
            else if (experience.length < 20) {
                errors.experience = 'Please provide more details about your experience';
            }
            if (!(motivation === null || motivation === void 0 ? void 0 : motivation.trim())) {
                errors.motivation = 'Please explain your motivation';
            }
            else if (motivation.length < 20) {
                errors.motivation = 'Please provide more details about your motivation';
            }
            if (Object.keys(errors).length > 0) {
                return server_1.NextResponse.json({ errors }, { status: 400 });
            }
            // Check if user already exists
            const existingUser = yield prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (existingUser) {
                return server_1.NextResponse.json({ errors: { email: 'An account with this email already exists' } }, { status: 400 });
            }
            // Hash password
            const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
            // Create user with PENDING approval status
            const user = yield prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    phone: phone.trim(),
                    state: state,
                    specialization: specialization,
                    experience: experience.trim(),
                    motivation: motivation.trim(),
                    role: 'VOLUNTEER',
                    approvalStatus: 'PENDING',
                    isActive: false // Inactive until approved
                }
            });
            // Return success response (without sensitive data)
            return server_1.NextResponse.json({
                message: 'Registration successful. Your application is pending admin approval.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    approvalStatus: user.approvalStatus
                }
            }, { status: 201 });
        }
        catch (error) {
            console.error('Signup error:', error);
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
exports.POST = POST;
