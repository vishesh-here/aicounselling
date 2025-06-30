"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const middleware_1 = require("next-auth/middleware");
exports.default = (0, middleware_1.withAuth)(function middleware(req) {
    // Add any additional middleware logic here
}, {
    callbacks: {
        authorized: ({ token, req }) => {
            // Protect all routes except login and public pages
            if (req.nextUrl.pathname === "/login") {
                return true;
            }
            return !!token;
        },
    },
});
exports.config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
