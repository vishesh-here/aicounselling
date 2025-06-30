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
const db_1 = require("@/lib/db");
const auth_config_1 = require("@/lib/auth-config");
exports.dynamic = "force-dynamic";
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== "ADMIN") {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = yield request.json();
            const { title, summary, content, category, subCategory } = body;
            if (!title || !summary || !content || !category) {
                return server_1.NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }
            const knowledgeBase = yield db_1.prisma.knowledgeBase.create({
                data: {
                    title,
                    summary,
                    content,
                    category,
                    subCategory: subCategory || null,
                    createdById: session.user.id
                }
            });
            return server_1.NextResponse.json({ message: "Knowledge base entry created successfully", id: knowledgeBase.id }, { status: 201 });
        }
        catch (error) {
            console.error("Knowledge base creation error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.POST = POST;
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const knowledgeBase = yield db_1.prisma.knowledgeBase.findMany({
                where: { isActive: true },
                include: {
                    createdBy: {
                        select: { name: true }
                    },
                    tags: true
                },
                orderBy: { createdAt: "desc" }
            });
            return server_1.NextResponse.json({ knowledgeBase });
        }
        catch (error) {
            console.error("Knowledge base fetch error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.GET = GET;
