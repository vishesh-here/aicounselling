"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
const google_1 = require("next/font/google");
require("./globals.css");
const providers_1 = require("@/components/providers");
const inter = (0, google_1.Inter)({
    subsets: ["latin"],
    variable: "--font-inter",
});
const poppins = (0, google_1.Poppins)({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});
exports.metadata = {
    title: "Talesmith.ai - AI-Powered Counseling Platform",
    description: "Talesmith.ai: Revolutionary AI-powered counseling platform for underprivileged children in India, featuring cultural wisdom stories and volunteer-driven support.",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    }
};
function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <providers_1.Providers>
          {children}
        </providers_1.Providers>
      </body>
    </html>);
}
exports.default = RootLayout;
