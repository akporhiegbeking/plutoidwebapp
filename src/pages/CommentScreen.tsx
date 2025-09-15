import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, getCommentsByPostId, getUserByUid, createComment } from "@/lib/firestore";
import { Post, User, Comment } from "@/types/firebase";
import { BlueskyPost } from "@/components/bluesky/BlueskyPost";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageCircle, Repeat, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentScreenProps {
  currentUser?: User;
}

export function CommentScreen({ currentUser }: CommentScreenProps) {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [postUser, setPostUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUsers, setCommentUsers] = useState<{ [uid: string]: User }>({});
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPostData();
    }
  }, [postId]);

  const loadPostData = async () => {
    if (!postId) return;
    
    try {
      // Load post
      const postData = await getPostById(postId);
      if (postData) {
        setPost(postData);
        
        // Load post author
        const userData = await getUserByUid(postData.uid);
        setPostUser(userData);
        
        // Load comments
        const commentsData = await getCommentsByPostId(postId);
        setComments(commentsData);
        
        // Load comment users
        const userPromises = commentsData.map(comment => getUserByUid(comment.uid));
        const users = await Promise.all(userPromises);
        const usersMap: { [uid: string]: User } = {};
        users.forEach((user, index) => {
          if (user) {
            usersMap[commentsData[index].uid] = user;
          }
        });
        setCommentUsers(usersMap);
      }
    } catch (error) {
      console.error("Error loading post data:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || !postId) return;
    
    setSubmitting(true);
    try {
      await createComment({
        uid: currentUser.uid,
        post_id: postId,
        email: currentUser.email,
        textComment: newComment.trim(),
        dateCreated: new Date()
      });
      
      setNewComment("");
      toast({ title: "Comment posted!" });
      
      // Reload comments
      const updatedComments = await getCommentsByPostId(postId);
      setComments(updatedComments);
      
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ 
        title: "Error", 
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!post || !postUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">Post not found</h2>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center space-x-4 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Main Post */}
        <div className="border-b border-border">
          <BlueskyPost 
            post={post} 
            currentUser={currentUser}
            onPostClick={() => {}}
            isDetailView={true}
          />
        </div>

        {/* Comment Form */}
        {currentUser && (
          <div className="border-b border-border p-4">
            <div className="flex space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                {currentUser.imageURL ? (
                  <img 
                    src={currentUser.imageURL} 
                    alt={currentUser.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground font-semibold">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Post your reply"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border-none resize-none focus:ring-0 text-xl bg-transparent text-muted-foreground placeholder:text-muted-foreground/70"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground"
                  >
                    {submitting ? "Posting..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="divide-y divide-border">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const commentUser = commentUsers[comment.uid];
              if (!commentUser) return null;
              
              return (
                <div key={comment.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      {commentUser.imageURL ? (
                        <img 
                          src={commentUser.imageURL} 
                          alt={commentUser.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground font-semibold text-sm">
                          {commentUser.firstName[0]}{commentUser.lastName[0]}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-foreground">{commentUser.firstName} {commentUser.lastName}</span>
                        <span className="text-muted-foreground text-sm">@{commentUser.userName}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">
                          {comment.dateCreated?.toDate ? 
                            comment.dateCreated.toDate().toLocaleDateString() : 
                            new Date(comment.dateCreated).toLocaleDateString()
                          }
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {comment.textComment}
                      </p>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center space-x-6 text-muted-foreground">
                        <button className="flex items-center space-x-2 hover:text-primary hover:bg-primary/10 rounded-full p-1 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="flex items-center space-x-2 hover:text-repost hover:bg-repost/10 rounded-full p-1 transition-colors">
                          <Repeat className="w-4 h-4" />
                        </button>
                        <button className="flex items-center space-x-2 hover:text-like hover:bg-like/10 rounded-full p-1 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}