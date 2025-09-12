import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPostsPaginated } from "@/lib/firestore";
import { DocumentSnapshot } from "firebase/firestore";

interface FeedProps {
  className?: string;
}

export function Feed({ className }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const loadPosts = async (isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { posts: newPosts, lastDoc: newLastDoc } = await getPostsPaginated(5, isInitial ? null : lastDoc);
      
      if (newPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
        setLastDoc(newLastDoc);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  };

  const handleNewPost = async (content: string, image?: string) => {
    // In a real app, you'd create the post in Firestore and refresh
    console.log('New post:', { content, image });
    // Reload posts to show new post
    await loadPosts(true);
  };

  // Load initial posts
  useEffect(() => {
    loadPosts(true);
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 100 &&
        !isLoading && 
        !initialLoading && 
        hasMorePosts
      ) {
        loadPosts(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, initialLoading, hasMorePosts, lastDoc]);

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Feed Header */}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm border-b border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            For You
          </h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-primary font-medium">
              For You
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Following
            </Button>
          </div>
        </div>
      </div>

      {/* Post Composer */}
      {showComposer && (
        <div className="mb-6">
          <PostComposer onPost={handleNewPost} />
        </div>
      )}

      {/* Posts */}
      {initialLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Loading indicator for pagination */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* No more posts indicator */}
          {!hasMorePosts && posts.length > 0 && (
            <div className="flex justify-center py-8 text-muted-foreground">
              No more posts to load
            </div>
          )}
        </>
      )}
    </div>
  );
}