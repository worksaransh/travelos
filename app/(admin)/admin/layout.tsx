"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Compass,
  Package,
  CircleDollarSign,
  HelpCircle,
  BrainCircuit,
  Image,
  Kanban,
  Users,
  Contact,
  ShieldCheck,
  Search,
  BarChart3,
  ScrollText,
  Settings,
  Menu,
  X,
  Bell,
  User,
  ClipboardList
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Destinations", href: "/admin/destinations", icon: MapPin },
  { name: "Experiences", href: "/admin/experiences", icon: Compass },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Pricing Engine", href: "/admin/pricing", icon: CircleDollarSign },
  { name: "Questionnaire", href: "/admin/questionnaire", icon: HelpCircle },
  { name: "AI Review Queue", href: "/admin/ai-review", icon: BrainCircuit },
  { name: "Media Library", href: "/admin/media", icon: Image },
  { name: "Lead CRM", href: "/admin/crm", icon: Kanban },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Agent Sheets", href: "/admin/agents", icon: Contact },
  { name: "Users & Roles", href: "/admin/users-rbac", icon: ShieldCheck },
  { name: "SEO Manager", href: "/admin/seo", icon: Search },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Improvement Logs", href: "/admin/improvements", icon: ClipboardList },
  { name: "Audit Logs", href: "/admin/logs", icon: ScrollText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand/30 flex text-deep-charcoal font-body antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink-indigo text-white shrink-0 shadow-lg border-r border-ink-indigo/10 z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-lg font-display font-bold tracking-wider text-marigold">
              JOURNEY OS
            </span>
            <span className="text-[10px] bg-marigold/20 text-marigold px-1.5 py-0.5 rounded font-mono font-semibold">
              Admin
            </span>
          </Link>
        </div>

        {/* Scrollable Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-marigold text-ink-indigo shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-ink-indigo" : "text-marigold"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-ink-indigo/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-ink-indigo text-white flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <span className="text-lg font-display font-bold text-marigold tracking-wider">
            JOURNEY OS
          </span>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-marigold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-marigold text-ink-indigo shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-ink-indigo" : "text-marigold"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border/40 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-ink-indigo hover:bg-sand/35 rounded-lg mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick search/Status info */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-semibold text-dusk-teal bg-sand/50 px-2.5 py-1 rounded-full border border-border/20">
              Live Database: Connected
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              AI Engine: Gemini Active
            </span>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-dusk-teal hover:bg-sand/30 rounded-full transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-clay-rose rounded-full" />
            </button>

            <div className="h-8 w-px bg-border/40" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-ink-indigo/10 flex items-center justify-center text-ink-indigo font-bold text-xs">
                SA
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-ink-indigo leading-none">Super Admin</span>
                <span className="text-[10px] text-dusk-teal leading-normal">System Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace viewport container */}
        <main className="flex-1 overflow-y-auto bg-sand/10 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
