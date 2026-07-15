"use client"

import { Dock } from "@/components/ui/dock-two"
import {
  Home,
  User,
  Folder,
  Heart,
  Mail,
  Search,
} from "lucide-react"

function DockDemo() {
  const items = [
    { icon: Home, label: "Home" },
    { icon: Folder, label: "Projects" },
    { icon: User, label: "Profile" },
    { icon: Heart, label: "Favorites" },
    { icon: Mail, label: "Contact" },
    { icon: Search, label: "Search" },
  ]

  return <Dock items={items} />
}

export { DockDemo }
