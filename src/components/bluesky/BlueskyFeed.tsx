import { useState, useEffect, useRef } from "react";
import { BlueskyPost } from "./BlueskyPost";
import { Post, User } from "@/types/firebase";
import { getPosts } from "@/lib/firestore";
import { Loader2, Sparkles } from "lucide-react";

interface BlueskyFeedProps {
  currentUser?: User;
  className?: string;
}

export function BlueskyFeed({ currentUser, className }: BlueskyFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedType, setFeedType] = useState<'following' | 'discover'>('discover');
  const lastPostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    try {
      setIsLoading(true);
      const postsData = await getPosts(20);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      // In a real implementation, you'd use pagination with startAfter
      const morePosts = await getPosts(10);
      setPosts(prev => [...prev, ...morePosts]);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Feed Header - Exact BlueSky style */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Home</h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
        
        {/* Feed tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              feedType === 'following'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFeedType('discover')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              feedType === 'discover'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      {/* Posts */}
      <div>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts yet. Start following people to see their posts!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id || index}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <BlueskyPost 
                post={post} 
                currentUser={currentUser}
                onPostClick={() => {
                  // Handle post click - could navigate to post detail
                  console.log('Post clicked:', post.id);
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}