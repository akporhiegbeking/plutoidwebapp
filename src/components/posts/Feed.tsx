import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedProps {
  className?: string;
}

// Sample data - in a real app this would come from your backend
const samplePosts = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "SC"
    },
    content: "Just captured this amazing sunset from my rooftop! The colors tonight are absolutely incredible. Sometimes you just have to stop and appreciate the beauty around us. 🌅",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    timestamp: "2h",
    likes: 142,
    comments: 23,
    reposts: 8,
    isLiked: false
  },
  {
    id: "2",
    author: {
      name: "Alex Rivera",
      username: "alexr",
      avatar: "AR"
    },
    content: "Working on something exciting in the lab today! Science never sleeps and neither do we apparently 😅 Can't wait to share what we've been building.",
    timestamp: "4h",
    likes: 89,
    comments: 15,
    reposts: 12,
    isLiked: true
  },
  {
    id: "3",
    author: {
      name: "Maya Patel",
      username: "mayap",
      avatar: "MP"
    },
    content: "Coffee shop vibes this morning ☕ There's something magical about the energy in here. Everyone's working on their dreams, one caffeine-fueled moment at a time.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    timestamp: "6h",
    likes: 234,
    comments: 41,
    reposts: 19,
    isLiked: false
  },
  {
    id: "4",
    author: {
      name: "Jordan Kim",
      username: "jordank",
      avatar: "JK"
    },
    content: "Late night coding session turning into early morning productivity! Sometimes the best ideas come when the world is quiet. Building something that I hope will make people's lives easier.",
    timestamp: "8h",
    likes: 167,
    comments: 28,
    reposts: 15,
    isLiked: false
  },
  {
    id: "5",
    author: {
      name: "Luna Martinez",
      username: "lunam",
      avatar: "LM"
    },
    content: "Street art discovery of the day! Found this incredible mural in the downtown district. The talent in our city never ceases to amaze me.",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop",
    timestamp: "12h",
    likes: 312,
    comments: 52,
    reposts: 27,
    isLiked: true
  }
];

export function Feed({ className }: FeedProps) {
  const [posts, setPosts] = useState(samplePosts);
  const [isLoading, setIsLoading] = useState(false);
  const [showComposer, setShowComposer] = useState(true);

  const handleNewPost = async (content: string, image?: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        name: "John Doe",
        username: "johndoe",
        avatar: "JD"
      },
      content,
      image,
      timestamp: "now",
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
  };

  const loadMorePosts = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you'd fetch more posts from your backend
    const morePosts = samplePosts.map(post => ({
      ...post,
      id: `${post.id}-${Date.now()}`,
      timestamp: "1d"
    }));
    
    setPosts(prev => [...prev, ...morePosts]);
    setIsLoading(false);
  };

  // Simulate infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
        return;
      }
      loadMorePosts();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

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
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}