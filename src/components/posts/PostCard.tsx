import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
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
    user: {
      uid: string;
      userName: string;
      firstName: string;
      lastName: string;
      imageURL?: string;
      countryOrigin?: string;
    };
    textCaption: string;
    imageURL?: string;
    dateCreated: any;
    likeCount: number;
    commentsCount: number;
    viewCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
  };
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isSaved || false);
  const [likes, setLikes] = useState(post.likeCount || 0);
  
  // Format display name
  const displayName = `${post.user.firstName} ${post.user.lastName}`.trim() || post.user.userName;
  const timestamp = post.dateCreated?.toDate ? post.dateCreated.toDate().toLocaleDateString() : 'Unknown';

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handlePostClick = () => {
    console.log('Post ID:', post.id);
    navigate(`/post/${post.id}`);
  };

  return (
    <article 
      className={cn(
        "bg-card border border-border rounded-lg p-4 hover:shadow-custom-sm transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={handlePostClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {post.user.imageURL ? (
            <img 
              src={post.user.imageURL} 
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-card-foreground">{displayName}</h3>
            <p className="text-muted-foreground text-sm">@{post.user.userName} · {timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="xs">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-card-foreground leading-relaxed mb-3">{post.textCaption}</p>
        
        {/* Image */}
        {post.imageURL && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img 
              src={post.imageURL} 
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
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-sm">{formatNumber(likes)}</span>
          </Button>

          {/* Comment */}
          <Button 
            variant="comment" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{formatNumber(post.commentsCount || 0)}</span>
          </Button>

          {/* Views */}
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <span className="text-sm">{formatNumber(post.viewCount || 0)} views</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="xs"
            className={cn(isBookmarked && "text-primary")}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}