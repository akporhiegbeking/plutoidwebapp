import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Feed } from "@/components/posts/Feed";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first responsive layout */}
      <div className="flex w-full">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside className="hidden md:block fixed left-0 top-0 h-full">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64">
          {/* Top Bar */}
          <TopBar />

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Feed - Takes up most space */}
              <div className="lg:col-span-3">
                <Feed />
              </div>

              {/* Right Sidebar - Trending/Suggestions */}
              <div className="hidden lg:block space-y-6">
                {/* Trending Section */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="font-bold text-lg mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Trending
                  </h2>
                  <div className="space-y-3">
                    {[
                      { topic: "#PlutoidLaunch", posts: "12.3K posts" },
                      { topic: "#TechNews", posts: "8.7K posts" },
                      { topic: "#Photography", posts: "25.1K posts" },
                      { topic: "#AI", posts: "15.6K posts" }
                    ].map((trend, index) => (
                      <div key={index} className="p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                        <p className="font-medium text-card-foreground">{trend.topic}</p>
                        <p className="text-sm text-muted-foreground">{trend.posts}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Users */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="font-bold text-lg mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Who to follow
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Chen", username: "alexc", avatar: "AC" },
                      { name: "Maria Garcia", username: "mariag", avatar: "MG" },
                      { name: "David Park", username: "davidp", avatar: "DP" }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-xs">
                              {user.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plutoid Stats */}
                <div className="bg-gradient-secondary border border-border rounded-lg p-4">
                  <h2 className="font-bold text-lg mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Plutoid Stats
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active users</span>
                      <span className="font-semibold">2.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts today</span>
                      <span className="font-semibold">156K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement rate</span>
                      <span className="font-semibold text-primary">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex justify-around items-center h-16 px-4">
          {[
            { icon: "🏠", label: "Home" },
            { icon: "🔍", label: "Search" },
            { icon: "🔔", label: "Notifications" },
            { icon: "💬", label: "Messages" },
            { icon: "👤", label: "Profile" }
          ].map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 h-auto py-2"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
