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
const next_auth_1 = require("next-auth");
const navigation_1 = require("next/navigation");
const sidebar_1 = require("@/components/layout/sidebar");
const auth_config_1 = require("@/lib/auth-config");
function DashboardLayout({ children, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        if (!session) {
            (0, navigation_1.redirect)("/login");
        }
        return (<div className="flex h-screen bg-gray-50">
      <sidebar_1.Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>);
    });
}
exports.default = DashboardLayout;
