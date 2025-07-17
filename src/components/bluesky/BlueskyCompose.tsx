import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Image as ImageIcon, MapPin, Smile } from "lucide-react";
import { createPost } from "@/lib/firestore";
import { User } from "@/types/firebase";

interface BlueskyComposeProps {
  currentUser?: User;
  onClose: () => void;
  onPostCreated?: () => void;
}

export function BlueskyCompose({ currentUser, onClose, onPostCreated }: BlueskyComposeProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const maxLength = 300; // BlueSky character limit
  const remainingChars = maxLength - text.length;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!currentUser || (!text.trim() && !selectedImage) || isPosting) return;

    try {
      setIsPosting(true);
      
      await createPost({
        uid: currentUser.uid,
        email: currentUser.email,
        textCaption: text,
        imageURL: selectedImage || "",
        country: currentUser.country,
        re_post: "no"
      });

      setText("");
      setSelectedImage(null);
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg">New post</h2>
          <button
            onClick={handlePost}
            disabled={(!text.trim() && !selectedImage) || remainingChars < 0 || isPosting}
            className={cn(
              "px-4 py-2 rounded-full font-bold transition-colors",
              (!text.trim() && !selectedImage) || remainingChars < 0 || isPosting
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User info */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {currentUser?.imageURL ? (
                <img 
                  src={currentUser.imageURL} 
                  alt={currentUser.firstName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold text-sm">
                  {currentUser?.firstName?.[0] || 'U'}
                </span>
              )}
            </div>
            <div>
              <div className="font-bold">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
              </div>
              <div className="text-gray-500 text-sm">
                @{currentUser?.userName || 'username'}
              </div>
            </div>
          </div>

          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-xl placeholder:text-gray-500"
            autoFocus
          />

          {/* Image preview */}
          {selectedImage && (
            <div className="relative mt-4 rounded-xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 left-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Actions */}
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5 text-blue-500 hover:text-blue-600 transition-colors" />
              </label>
              <button className="text-blue-500 hover:text-blue-600 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="text-blue-500 hover:text-blue-600 transition-colors">
                <MapPin className="w-5 h-5" />
              </button>
            </div>

            {/* Character count */}
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-sm",
                remainingChars < 20 ? "text-red-500" : "text-gray-500"
              )}>
                {remainingChars}
              </span>
              <div className="w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-300"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - text.length / maxLength)}`}
                    className={cn(
                      "transition-all",
                      remainingChars < 20 ? "text-red-500" : "text-blue-500"
                    )}
                    style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}