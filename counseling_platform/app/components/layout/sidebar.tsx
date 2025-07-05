"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Heart,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "VOLUNTEER"],
  },
  {
    name: "Children",
    href: "/children",
    icon: Users,
    roles: ["ADMIN", "VOLUNTEER"],
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen,
    roles: ["ADMIN", "VOLUNTEER"],
  },
];

const adminNavigation = [
  {
    name: "User Approvals",
    href: "/admin/user-approvals",
    icon: UserCheck,
    roles: ["ADMIN"],
  },
  {
    name: "Assignments",
    href: "/admin/assignments",
    icon: UserPlus,
    roles: ["ADMIN"],
  },
  {
    name: "Manage KB",
    href: "/admin/manage-kb",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        console.log('Sidebar user:', data.session.user);
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        console.log('Sidebar user (auth change):', session.user);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
  const isAdmin = userRole === "ADMIN";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-orange-400" />
            <span className="font-semibold text-lg">Talesmith.ai</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-slate-800"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </div>
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-6">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin
                </p>
              )}
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-orange-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
            <span className="text-sm font-medium">
              {session?.user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.email || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {(session?.user?.user_metadata?.role || session?.user?.app_metadata?.role || "volunteer").toLowerCase()}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="mt-3 w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
