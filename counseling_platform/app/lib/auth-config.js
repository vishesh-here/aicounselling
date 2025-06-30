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
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const prisma_adapter_1 = require("@next-auth/prisma-adapter");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.authOptions = {
    adapter: (0, prisma_adapter_1.PrismaAdapter)(db_1.prisma),
    providers: [
        (0, credentials_1.default)({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize(credentials) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {
                        return null;
                    }
                    const user = yield db_1.prisma.user.findUnique({
                        where: { email: credentials.email }
                    });
                    if (!user) {
                        return null;
                    }
                    const passwordsMatch = yield bcryptjs_1.default.compare(credentials.password, user.password);
                    if (!passwordsMatch) {
                        return null;
                    }
                    // Check if user is approved (admins are always approved)
                    if (user.role === 'VOLUNTEER' && user.approvalStatus !== 'APPROVED') {
                        throw new Error('Account pending approval or rejected');
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        approvalStatus: user.approvalStatus,
                    };
                });
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        jwt({ token, user }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user) {
                    token.role = user.role;
                    token.approvalStatus = user.approvalStatus;
                }
                return token;
            });
        },
        session({ session, token }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (token) {
                    session.user.id = token.sub;
                    session.user.role = token.role;
                    session.user.approvalStatus = token.approvalStatus;
                }
                return session;
            });
        },
    },
    pages: {
        signIn: "/login",
    },
};
