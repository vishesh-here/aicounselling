"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = exports.dynamic = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const auth_config_1 = require("@/lib/auth-config");
exports.dynamic = "force-dynamic";
const handler = (0, next_auth_1.default)(auth_config_1.authOptions);
exports.GET = handler;
exports.POST = handler;
