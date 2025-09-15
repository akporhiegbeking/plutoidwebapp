import { useState, useEffect } from "react";
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
import { Post, User, Like, Comment } from "@/types/firebase";
import { 
  getLikesByPost, 
  getUserLike, 
  addLike, 
  removeLike,
  getCommentsByPost,
  addView,
  getUserByUid,
  getUserSavedItem,
  addSavedItem,
  removeSavedItem
} from "@/lib/firestore";

interface BlueskyPostProps {
  post: any; // Enhanced post with user data and stats
  currentUser?: User;
  onPostClick?: (postId: string) => void;
  isDetailView?: boolean;
}

export function BlueskyPost({ post, currentUser, onPostClick, isDetailView }: BlueskyPostProps) {
  const navigate = useNavigate();
  const [author, setAuthor] = useState<User | null>(post.user || null);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [userLike, setUserLike] = useState<Like | null>(null);
  const [savedItem, setSavedItem] = useState<any>(null);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);

  // Format timestamp like BlueSky (e.g., "2h", "1d", "Mar 15")
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    // Track view if current user exists
    if (currentUser?.uid && post.id) {
      addView(currentUser.uid, post.id).catch(error => 
        console.error('Error tracking view:', error)
      );
    }
  }, [post.id, currentUser?.uid]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.uid || !post.id) return;

    // Optimistic UI update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked && userLike?.id) {
        await removeLike(userLike.id);
        setUserLike(null);
      } else {
        const likeId = await addLike(currentUser.uid, post.id);
        const newLike = { id: likeId, uid: currentUser.uid, post_id: post.id, dateCreated: new Date() };
        setUserLike(newLike);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.uid || !post.id) return;

    try {
      if (isSaved && savedItem?.id) {
        await removeSavedItem(savedItem.id);
        setIsSaved(false);
        setSavedItem(null);
      } else {
        const savedId = await addSavedItem(currentUser.uid, post.id, post.imageURL);
        const newSavedItem = { id: savedId, uid: currentUser.uid, post_id: post.id, imageURL: post.imageURL };
        setIsSaved(true);
        setSavedItem(newSavedItem);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <article 
      className={`border-b border-gray-200 dark:border-gray-800 p-4 transition-colors ${
        !isDetailView ? 'hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer' : ''
      }`}
      onClick={!isDetailView ? () => {
        console.log('Post ID:', post.id);
        navigate(`/post/${post.id}`);
        onPostClick?.(post.id);
      } : undefined}
    >
      {/* Header */}
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div 
          className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (author) {
              navigate(`/user/${author.uid}`);
            }
          }}
        >
          {author?.imageURL ? (
            <img 
              src={author.imageURL} 
              alt={author.firstName} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold text-sm">
              {author?.firstName?.[0] || 'U'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center space-x-2 mb-1">
            <span 
              className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                if (author) {
                  navigate(`/user/${author.uid}`);
                }
              }}
            >
              {author ? `${author.firstName} ${author.lastName}` : 'Loading...'}
            </span>
            <span className="text-gray-500">@{author?.userName || 'username'}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatTimestamp(post.dateCreated)}</span>
          </div>

          {/* Post text */}
          {post.textCaption && (
            <div className="mb-3">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {post.textCaption}
              </p>
            </div>
          )}

          {/* Post image */}
          {post.imageURL && (
            <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={post.imageURL} 
                alt="Post image" 
                className="w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Actions - Exact BlueSky style */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Reply */}
            <button 
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{commentCount}</span>
            </button>

            {/* Repost */}
            <button 
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full p-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Repeat2 className="w-4 h-4" />
            </button>

            {/* Like */}
            <button 
              className={cn(
                "flex items-center space-x-2 rounded-full p-2 transition-colors",
                isLiked 
                  ? "text-red-500" 
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span className="text-sm">{likeCount}</span>
            </button>

            {/* Save */}
            <button 
              className={cn(
                "flex items-center space-x-2 rounded-full p-2 transition-colors",
                isSaved 
                  ? "text-blue-500" 
                  : "text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>

            {/* Share */}
            <button 
              className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full p-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* More menu */}
        <button 
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}