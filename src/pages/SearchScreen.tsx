import { useState, useEffect } from "react";
import { searchUsers, searchPosts } from "@/lib/firestore";
import { User, Post } from "@/types/firebase";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlueskyPost } from "@/components/bluesky/BlueskyPost";
import { Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchScreenProps {
  currentUser?: User;
}

export function SearchScreen({ currentUser }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setUsers([]);
      setPosts([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [usersResult, postsResult] = await Promise.all([
        searchUsers(searchQuery),
        searchPosts(searchQuery)
      ]);
      setUsers(usersResult);
      setPosts(postsResult);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const trendingTopics = [
    { tag: "#PlutoidLaunch", posts: "12.3K posts" },
    { tag: "#Photography", posts: "8.7K posts" },
    { tag: "#SocialMedia", posts: "25.1K posts" },
    { tag: "#DigitalArt", posts: "15.2K posts" },
    { tag: "#TechNews", posts: "18.5K posts" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center space-x-4 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search Plutoid"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-gray-900 border-none rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {!searchQuery ? (
          /* Trending Section */
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">What's happening</h2>
            <div className="space-y-1">
              {trendingTopics.map((topic, index) => (
                <div 
                  key={index}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg cursor-pointer transition-colors"
                >
                  <p className="text-gray-500 text-sm">Trending</p>
                  <p className="font-bold">{topic.tag}</p>
                  <p className="text-gray-500 text-sm">{topic.posts}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Search Results */
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sticky top-20 bg-white dark:bg-black">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {posts.map((post) => (
                    <BlueskyPost 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser}
                      onPostClick={(postId) => navigate(`/post/${postId}`)}
                    />
                  ))}
                </div>
              ) : searchQuery && (
                <div className="p-8 text-center text-gray-500">
                  No posts found for "{searchQuery}"
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="people" className="mt-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : users.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {users.map((user) => (
                    <div key={user.uid} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          {user.imageURL ? (
                            <img 
                              src={user.imageURL} 
                              alt={user.firstName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-semibold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold">{user.firstName} {user.lastName}</div>
                          <div className="text-gray-500 text-sm">@{user.userName}</div>
                          {user.bio && <div className="text-sm mt-1">{user.bio}</div>}
                        </div>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && (
                <div className="p-8 text-center text-gray-500">
                  No people found for "{searchQuery}"
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}