import { useState, useEffect } from "react";
import { getAllPosts } from "@/lib/firestore";
import { User, Post } from "@/types/firebase";
import { BlueskyPost } from "@/components/bluesky/BlueskyPost";
import { TrendingUp, Hash } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface FindScreenProps {
  currentUser?: User;
}

interface TrendingHashtag {
  tag: string;
  posts: number;
  views: number;
  likes: number;
  total: number;
}

export function FindScreen({ currentUser }: FindScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getAllPosts();
      const allPosts = result.posts || [];
      setPosts(allPosts);
      
      // Extract and analyze hashtags
      const hashtagStats = extractTrendingHashtags(allPosts);
      setTrendingHashtags(hashtagStats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractTrendingHashtags = (posts: Post[]): TrendingHashtag[] => {
    const hashtagMap = new Map<string, { posts: number; views: number; likes: number }>();
    
    posts.forEach(post => {
      if (post.textCaption) {
        // Extract hashtags from post content
        const hashtags = post.textCaption.match(/#\w+/g) || [];
        hashtags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          const current = hashtagMap.get(normalizedTag) || { posts: 0, views: 0, likes: 0 };
          hashtagMap.set(normalizedTag, {
            posts: current.posts + 1,
            views: current.views + (post.viewCount || 0),
            likes: current.likes + (post.likeCount || 0)
          });
        });
      }
    });

    // Convert to array and sort by total engagement
    const trending = Array.from(hashtagMap.entries())
      .map(([tag, stats]) => ({
        tag,
        posts: stats.posts,
        views: stats.views,
        likes: stats.likes,
        total: stats.posts + stats.views + stats.likes
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return trending;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-40">
            <h1 className="text-xl font-bold flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              Explore
            </h1>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Trending Hashtags */}
              <div className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-primary" />
                  Trending for you
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trendingHashtags.map((hashtag, index) => (
                    <div 
                      key={hashtag.tag}
                      className="p-4 bg-card hover:bg-muted/50 rounded-lg border border-border cursor-pointer transition-all hover:shadow-custom-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            #{index + 1} · Trending
                          </p>
                          <p className="font-bold text-primary group-hover:text-primary-hover transition-colors">
                            {hashtag.tag}
                          </p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                            <span>{formatNumber(hashtag.posts)} posts</span>
                            <span>{formatNumber(hashtag.views)} views</span>
                            <span>{formatNumber(hashtag.likes)} likes</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posts Feed */}
              <div className="border-t border-border">
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-4">Recent Posts</h2>
                </div>
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <BlueskyPost 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser}
                      onPostClick={(postId) => window.location.href = `/post/${postId}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}