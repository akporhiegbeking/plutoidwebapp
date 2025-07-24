import { useState, useEffect } from "react";
import { searchUsers, searchPosts, getTrendingHashtags, getPostsByHashtag } from "@/lib/firestore";
import { User, Post, ExtendedPost } from "@/types/firebase";
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
  const [trendingHashtags, setTrendingHashtags] = useState<{ hashtag: string; count: number }[]>([]);
  const [hashtagPosts, setHashtagPosts] = useState<ExtendedPost[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load trending hashtags on component mount
    loadTrendingHashtags();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setUsers([]);
      setPosts([]);
      setSelectedHashtag("");
      setHashtagPosts([]);
    }
  }, [searchQuery]);

  const loadTrendingHashtags = async () => {
    try {
      const hashtags = await getTrendingHashtags(20);
      setTrendingHashtags(hashtags);
    } catch (error) {
      console.error("Error loading trending hashtags:", error);
    }
  };

  const handleHashtagClick = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setLoading(true);
    try {
      const posts = await getPostsByHashtag(hashtag);
      setHashtagPosts(posts);
    } catch (error) {
      console.error("Error loading hashtag posts:", error);
    } finally {
      setLoading(false);
    }
  };

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
        {!searchQuery && !selectedHashtag ? (
          /* Trending Section */
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">What's happening</h2>
            <div className="space-y-1">
              {trendingHashtags.map((hashtag, index) => (
                <div 
                  key={index}
                  onClick={() => handleHashtagClick(hashtag.hashtag)}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg cursor-pointer transition-colors"
                >
                  <p className="text-gray-500 text-sm">Trending</p>
                  <p className="font-bold">{hashtag.hashtag}</p>
                  <p className="text-gray-500 text-sm">{hashtag.count} posts</p>
                </div>
              ))}
            </div>
          </div>
        ) : selectedHashtag ? (
          /* Hashtag Posts */
          <div>
            <div className="sticky top-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setSelectedHashtag("");
                    setHashtagPosts([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold">{selectedHashtag}</h1>
                  <p className="text-gray-500 text-sm">{hashtagPosts.length} posts</p>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {hashtagPosts.map((post) => (
                  <BlueskyPost 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    onPostClick={(postId) => navigate(`/post/${postId}`)}
                  />
                ))}
              </div>
            )}
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