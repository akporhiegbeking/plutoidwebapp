import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Image, 
  Smile, 
  MapPin, 
  Calendar,
  X,
  Camera
} from "lucide-react";

interface PostComposerProps {
  className?: string;
  onPost?: (content: string, image?: string) => void;
  placeholder?: string;
}

export function PostComposer({ className, onPost, placeholder = "What's happening?" }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) return;
    
    setIsPosting(true);
    try {
      await onPost?.(content, selectedImage || undefined);
      setContent("");
      setSelectedImage(null);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const characterLimit = 280;
  const remainingChars = characterLimit - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-4",
      className
    )}>
      {/* User Avatar */}
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-semibold text-sm">JD</span>
        </div>

        <div className="flex-1">
          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground"
            disabled={isPosting}
          />

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-border">
              <img 
                src={selectedImage} 
                alt="Selected image" 
                className="w-full h-auto max-h-96 object-cover"
              />
              <Button
                variant="ghost"
                size="xs"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center space-x-2">
              {/* Image Upload */}
              <label>
                <Button variant="ghost" size="xs" asChild>
                  <span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isPosting}
                    />
                    <Image className="w-5 h-5 text-primary" />
                  </span>
                </Button>
              </label>

              {/* Other Actions */}
              <Button variant="ghost" size="xs" disabled={isPosting}>
                <Camera className="w-5 h-5 text-primary" />
              </Button>
              
              <Button variant="ghost" size="xs" disabled={isPosting}>
                <Smile className="w-5 h-5 text-primary" />
              </Button>
              
              <Button variant="ghost" size="xs" disabled={isPosting}>
                <MapPin className="w-5 h-5 text-primary" />
              </Button>
              
              <Button variant="ghost" size="xs" disabled={isPosting}>
                <Calendar className="w-5 h-5 text-primary" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Character Count */}
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-sm",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}>
                  {remainingChars}
                </span>
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={87.96}
                      strokeDashoffset={87.96 - (content.length / characterLimit) * 87.96}
                      className={cn(
                        isOverLimit ? "text-destructive" : "text-primary"
                      )}
                    />
                  </svg>
                </div>
              </div>

              {/* Post Button */}
              <Button
                variant="compose"
                size="sm"
                onClick={handlePost}
                disabled={(!content.trim() && !selectedImage) || isOverLimit || isPosting}
              >
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
