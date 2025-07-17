import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  Settings, 
  LogOut,
  PenSquare,
  Hash,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", path: "/messages" },
  { icon: Hash, label: "Explore", path: "/explore" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("/");

  return (
    <div className={cn("flex flex-col h-screen w-64 bg-background border-r border-border", className)}>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Plutoid
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={activeItem === item.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left p-3 h-auto",
                activeItem === item.path && "bg-accent/50 text-primary font-medium"
              )}
              onClick={() => setActiveItem(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-base">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Compose Button */}
        <div className="mt-8">
          <Button variant="compose" className="w-full h-12 text-base font-semibold">
            <PenSquare className="w-5 h-5 mr-2" />
            Post
          </Button>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">@johndoe</p>
          </div>
          <Button variant="ghost" size="xs">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}