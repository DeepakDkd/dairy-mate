"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Milk, TrendingUp, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Milk Records", icon: Milk, href: "/dashboard/milk-records" },
    { label: "Transactions", icon: TrendingUp, href: "/dashboard/transactions" },
    { label: "Users", icon: Users, href: "/dashboard/users" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  return (
    <aside
      className={`bg-white border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } flex flex-col h-screen sticky top-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008ED6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg">DairyMate</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-[#008ED6] text-white" : "text-foreground hover:bg-gray-100"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
