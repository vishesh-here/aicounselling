"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: lucide_react_1.LayoutDashboard,
        roles: ["ADMIN", "VOLUNTEER"],
    },
    {
        name: "Children",
        href: "/children",
        icon: lucide_react_1.Users,
        roles: ["ADMIN", "VOLUNTEER"],
    },
    {
        name: "Knowledge Base",
        href: "/knowledge-base",
        icon: lucide_react_1.BookOpen,
        roles: ["ADMIN", "VOLUNTEER"],
    },
];
const adminNavigation = [
    {
        name: "User Approvals",
        href: "/admin/user-approvals",
        icon: lucide_react_1.UserCheck,
        roles: ["ADMIN"],
    },
    {
        name: "Assignments",
        href: "/admin/assignments",
        icon: lucide_react_1.UserPlus,
        roles: ["ADMIN"],
    },
    {
        name: "Manage KB",
        href: "/admin/manage-kb",
        icon: lucide_react_1.Settings,
        roles: ["ADMIN"],
    },
];
function Sidebar({ className }) {
    var _a, _b, _c, _d, _e, _f;
    const [collapsed, setCollapsed] = (0, react_1.useState)(false);
    const pathname = (0, navigation_1.usePathname)();
    const isAdmin = ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) === "ADMIN";
    const handleSignOut = () => {
        // (0, react_2.signOut)({ callbackUrl: "/login" });
    };
    return (<div className={(0, utils_1.cn)("flex h-screen flex-col bg-slate-900 text-white transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (<div className="flex items-center space-x-2">
            <lucide_react_1.Heart className="h-6 w-6 text-orange-400"/>
            <span className="font-semibold text-lg">Talesmith.ai</span>
          </div>)}
        <button_1.Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="text-white hover:bg-slate-800">
          {collapsed ? <lucide_react_1.Menu className="h-4 w-4"/> : <lucide_react_1.X className="h-4 w-4"/>}
        </button_1.Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (<link_1.default key={item.name} href={item.href}>
              <div className={(0, utils_1.cn)("flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive
                    ? "bg-orange-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white")}>
                <item.icon className="h-5 w-5 shrink-0"/>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </div>
            </link_1.default>);
        })}

        {/* Admin Section */}
        {isAdmin && (<>
            <div className="pt-6">
              {!collapsed && (<p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin
                </p>)}
            </div>
            {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (<link_1.default key={item.name} href={item.href}>
                  <div className={(0, utils_1.cn)("flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive
                        ? "bg-orange-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white")}>
                    <item.icon className="h-5 w-5 shrink-0"/>
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </div>
                </link_1.default>);
            })}
          </>)}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
            <span className="text-sm font-medium">
              {((_c = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.charAt(0).toUpperCase()) || "U"}
            </span>
          </div>
          {!collapsed && (<div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {((_d = session === null || session === void 0 ? void 0 : session.user) === null || _d === void 0 ? void 0 : _d.name) || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {((_f = (_e = session === null || session === void 0 ? void 0 : session.user) === null || _e === void 0 ? void 0 : _e.role) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || "volunteer"}
              </p>
            </div>)}
        </div>
        {!collapsed && (<button_1.Button variant="ghost" onClick={handleSignOut} className="mt-3 w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white">
            <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
            Sign Out
          </button_1.Button>)}
      </div>
    </div>);
}
exports.Sidebar = Sidebar;
