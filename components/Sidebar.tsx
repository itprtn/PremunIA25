"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"

const sidebarNavItems = [
  { title: "Dashboard", href: "/", icon: "fas fa-home" },
  { title: "Contacts", href: "/contacts", icon: "fas fa-users" },
  { title: "Entreprises", href: "/entreprises", icon: "fas fa-building" },
  { title: "Pipeline", href: "/pipeline", icon: "fas fa-filter" },
  { title: "Projets", href: "/projects", icon: "fas fa-tasks" },
  { title: "Tâches", href: "/tasks", icon: "fas fa-check-square" },
  { title: "Contrats", href: "/contracts", icon: "fas fa-file-contract" },
  { title: "Campagnes", href: "/campaigns", icon: "fas fa-bullhorn" },
  { title: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
  { title: "Paramètres", href: "/settings", icon: "fas fa-cog" },
  { title: "Monitoring", href: "/monitoring", icon: "fas fa-desktop" },
]

export function Sidebar() {
  const pathname = usePathname()

  const getLinkClass = (href: string) => {
    const isActive = pathname === href
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-yellow-100 text-yellow-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
    ]
    const colorClass = isActive ? colors[sidebarNavItems.findIndex(item => item.href === href) % colors.length] : ""
    return cn(
      "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
      isActive ? colorClass : "hover:bg-gray-100"
    )
  }

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          CRM Supabase
        </h2>
        <div className="space-y-1">
          {sidebarNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              <i className={cn(item.icon, "mr-2")} />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
