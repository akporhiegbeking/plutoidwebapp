import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  Settings,
  Bookmark,
  MoreHorizontal,
  Feather
} from "lucide-react";

interface BlueskySidebarProps {
  className?: string;
  currentUser?: any;
}

// Exact BlueSky navigation structure
const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Mail, label: "Chat", href: "/messages" },
  { icon: Bookmark, label: "Feeds", href: "/feeds" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function BlueskySidebar({ className, currentUser }: BlueskySidebarProps) {
  const [activeItem, setActiveItem] = useState("/");

  return (
    <div className={cn("flex flex-col h-screen w-64 bg-background", className)}>
      {/* Logo - Exact BlueSky style */}
      <div className="flex items-center px-4 py-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
      </div>

      {/* Navigation - Exact BlueSky layout */}
      <nav className="flex-1 px-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setActiveItem(item.href)}
              className={cn(
                "flex items-center w-full px-3 py-3 text-xl rounded-full transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                activeItem === item.href && "font-bold"
              )}
            >
              <item.icon className="w-7 h-7 mr-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Compose Button - Exact BlueSky style */}
        <div className="mt-8 px-3">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors">
            <Feather className="w-5 h-5 mr-2 inline" />
            Compose post
          </button>
        </div>
      </nav>

      {/* User Profile Section - Exact BlueSky style */}
      <div className="p-3">
        <button className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
            {currentUser?.imageURL ? (
              <img 
                src={currentUser.imageURL} 
                alt={currentUser.firstName} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-semibold">
                {currentUser?.firstName?.[0] || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
            </div>
            <div className="text-gray-500 text-sm">
              @{currentUser?.userName || 'username'}
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}