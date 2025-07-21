import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, RotateCw } from "lucide-react";
import { User, Post } from "@/types/firebase";
import { getUserByUid, getAllPosts } from "@/lib/firestore";
import { BlueskyPost } from "@/components/bluesky/BlueskyPost";
import { DocumentSnapshot } from "firebase/firestore";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadUserPosts();
    }
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;
    try {
      const userData = await getUserByUid(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadUserPosts = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const result = await getAllPosts(10);
      // Filter posts by this user
      const userPosts = result.posts.filter(post => post.uid === userId);
      setPosts(userPosts);
      setLastDoc(result.lastDoc);
      setHasMore(userPosts.length === 10);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore || !userId) return;
    
    try {
      setIsLoadingMore(true);
      const result = await getAllPosts(10, lastDoc);
      const userPosts = result.posts.filter(post => post.uid === userId);
      setPosts(prev => [...prev, ...userPosts]);
      setLastDoc(result.lastDoc);
      setHasMore(userPosts.length === 10);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="flex justify-center items-center h-64">
          <RotateCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
            <div className="flex items-center p-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-sm text-gray-500">{posts.length} posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {/* Profile Image and Basic Info */}
          <div className="flex items-start justify-between mb-4">
            <img
              src={user.imageURL || '/placeholder.svg'}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          {/* Name and Username */}
          <div className="mb-3">
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500">@{user.userName}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mb-3 text-gray-900 dark:text-gray-100">{user.bio}</p>
          )}

          {/* Location and Join Date */}
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
            {user.country && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.country}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {user.dateCreated?.toDate ? user.dateCreated.toDate().toLocaleDateString() : new Date(user.dateCreated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No posts yet</p>
            </div>
          ) : (
            <>
              {posts.map((post, index) => (
                <BlueskyPost 
                  key={post.id || index}
                  post={post} 
                  currentUser={user}
                  onPostClick={(postId) => navigate(`/post/${postId}`)}
                />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button 
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingMore && <RotateCw className="w-4 h-4 animate-spin" />}
                    {isLoadingMore ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}