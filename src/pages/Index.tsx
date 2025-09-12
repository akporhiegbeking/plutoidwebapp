import { useState, useEffect } from "react";
import { BlueskySidebar } from "@/components/bluesky/BlueskySidebar";
import { Feed } from "@/components/posts/Feed";
import { BlueskyCompose } from "@/components/bluesky/BlueskyCompose";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { User } from "@/types/firebase";
import { getUserByUid } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Feather, Search, Bell, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserByUid(firebaseUser.uid);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


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

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
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
        <div className="flex-1 max-w-2xl">
          <Feed />
        </div>

      </div>

      {/* Mobile Bottom Navigation - Exact BlueSky style */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around items-center h-16 px-4">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
          </button>
          <button 
            onClick={() => navigate('/search')}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
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
