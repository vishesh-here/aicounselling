"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = void 0;
const react_1 = require("next-auth/react");
const theme_provider_1 = require("./theme-provider");
const sonner_1 = require("sonner");
const react_2 = require("react");
function Providers({ children }) {
    const [mounted, setMounted] = (0, react_2.useState)(false);
    (0, react_2.useEffect)(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }
    return (<react_1.SessionProvider>
      <theme_provider_1.ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
        <sonner_1.Toaster position="top-right"/>
      </theme_provider_1.ThemeProvider>
    </react_1.SessionProvider>);
}
exports.Providers = Providers;
