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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!post || !postUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Post not found</h2>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Main Post */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <BlueskyPost 
            post={post} 
            currentUser={currentUser}
            onPostClick={() => {}}
            isDetailView={true}
          />
        </div>

        {/* Comment Form */}
        {currentUser && (
          <div className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                {currentUser.imageURL ? (
                  <img 
                    src={currentUser.imageURL} 
                    alt={currentUser.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-semibold">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Post your reply"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border-none resize-none focus:ring-0 text-xl"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {submitting ? "Posting..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const commentUser = commentUsers[comment.uid];
              if (!commentUser) return null;
              
              return (
                <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      {commentUser.imageURL ? (
                        <img 
                          src={commentUser.imageURL} 
                          alt={commentUser.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-sm">
                          {commentUser.firstName[0]}{commentUser.lastName[0]}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold">{commentUser.firstName} {commentUser.lastName}</span>
                        <span className="text-gray-500 text-sm">@{commentUser.userName}</span>
                        <span className="text-gray-500 text-sm">·</span>
                        <span className="text-gray-500 text-sm">
                          {comment.dateCreated?.toDate ? 
                            comment.dateCreated.toDate().toLocaleDateString() : 
                            new Date(comment.dateCreated).toLocaleDateString()
                          }
                        </span>
                      </div>
                      
                      <p className="text-gray-900 dark:text-gray-100 mb-3">
                        {comment.textComment}
                      </p>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center space-x-6 text-gray-500">
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                          <Repeat className="w-4 h-4" />
                        </button>
                        <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}