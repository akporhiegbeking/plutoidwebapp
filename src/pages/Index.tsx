import { useState, useEffect } from "react";
import { BlueskySidebar } from "@/components/bluesky/BlueskySidebar";
import { BlueskyFeed } from "@/components/bluesky/BlueskyFeed";
import { BlueskyCompose } from "@/components/bluesky/BlueskyCompose";
import { User } from "@/types/firebase";
import { getUserByUid } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Feather, Search, Bell, Mail } from "lucide-react";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserByUid(firebaseUser.uid);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Demo user for development (remove when auth is implemented)
  useEffect(() => {
    if (!currentUser && !isLoading) {
      // Set a demo user for development
      const demoUser: User = {
        uid: 'demo-user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        userName: 'johndoe',
        imageURL: '',
        country: 'US',
        bio: 'Demo user for Plutoid development',
        phoneNumber: '',
        deviceName: '',
        tfa: '',
        feed_preference: '',
        dateofBirth: '',
        gender: '',
        category: '',
        chat_setting: '0',
        status: '1',
        dateCreated: new Date()
      };
      setCurrentUser(demoUser);
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <p className="text-gray-500">Loading Plutoid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Exact BlueSky layout */}
      <div className="flex max-w-6xl mx-auto">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-800">
          <BlueskySidebar currentUser={currentUser} />
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl border-r border-gray-200 dark:border-gray-800">
          <BlueskyFeed currentUser={currentUser} />
        </div>

        {/* Right Sidebar - Hidden on mobile and tablet */}
        <div className="hidden xl:block w-80 p-4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trending */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">What's happening</h2>
            <div className="space-y-3">
              {[
                { trend: "Trending in Technology", title: "#PlutoidLaunch", posts: "12.3K posts" },
                { trend: "Trending in Photography", title: "#DigitalArt", posts: "8.7K posts" },
                { trend: "Trending", title: "#SocialMedia", posts: "25.1K posts" }
              ].map((item, index) => (
                <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="text-gray-500 text-sm">{item.trend}</p>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.posts}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who to follow */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">Who to follow</h2>
            <div className="space-y-3">
              {[
                { name: "Alex Chen", username: "alexc", avatar: "AC" },
                { name: "Maria Garcia", username: "mariag", avatar: "MG" },
                { name: "David Park", username: "davidp", avatar: "DP" }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">{user.avatar}</span>
                    </div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-gray-500 text-sm">@{user.username}</div>
                    </div>
                  </div>
                  <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Exact BlueSky style */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around items-center h-16 px-4">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
          </button>
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Mail className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Floating Compose Button - Mobile */}
      <button
        onClick={() => setShowCompose(true)}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Feather className="w-6 h-6" />
      </button>

      {/* Compose Modal */}
      {showCompose && (
        <BlueskyCompose
          currentUser={currentUser}
          onClose={() => setShowCompose(false)}
          onPostCreated={() => {
            // Refresh feed or handle post creation
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Index;
