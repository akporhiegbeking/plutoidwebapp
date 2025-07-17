import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  MoreHorizontal,
  Bookmark
} from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar?: string;
    };
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    comments: number;
    reposts: number;
    isLiked?: boolean;
    isReposted?: boolean;
    isBookmarked?: boolean;
  };
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <article className={cn(
      "bg-card border border-border rounded-lg p-4 hover:shadow-custom-sm transition-all duration-200 cursor-pointer",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {post.author.avatar || post.author.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{post.author.name}</h3>
            <p className="text-muted-foreground text-sm">@{post.author.username} · {post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="xs">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-card-foreground leading-relaxed mb-3">{post.content}</p>
        
        {/* Image */}
        {post.image && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img 
              src={post.image} 
              alt="Post image" 
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-6">
          {/* Like */}
          <Button 
            variant="like" 
            size="sm" 
            className={cn(
              "flex items-center space-x-2",
              isLiked && "text-like"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-sm">{formatNumber(likes)}</span>
          </Button>

          {/* Comment */}
          <Button variant="comment" size="sm" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{formatNumber(post.comments)}</span>
          </Button>

          {/* Repost */}
          <Button 
            variant="repost" 
            size="sm" 
            className={cn(
              "flex items-center space-x-2",
              isReposted && "text-repost"
            )}
            onClick={handleRepost}
          >
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(reposts)}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="xs"
            className={cn(isBookmarked && "text-primary")}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
          
          <Button variant="ghost" size="xs">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}