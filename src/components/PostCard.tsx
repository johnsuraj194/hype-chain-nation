import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    image_url: string;
    caption: string;
    hype_count: number;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
  };
  currentUserId?: string;
  onHypeGiven: () => void;
}

export const PostCard = ({ post, currentUserId, onHypeGiven }: PostCardProps) => {
  const [giving, setGiving] = useState(false);
  const { toast } = useToast();

  const handleGiveHype = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "You need to be signed in to give HYPE",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === post.user_id) {
      toast({
        title: "Can't hype yourself",
        description: "You can't give HYPE to your own posts",
        variant: "destructive",
      });
      return;
    }

    setGiving(true);
    try {
      const { data, error } = await supabase.functions.invoke("give-hype", {
        body: {
          post_id: post.id,
          to_user_id: post.user_id,
          amount: 1,
        },
      });

      if (error) throw error;

      toast({
        title: "HYPE given! 🔥",
        description: `You gave ${post.profiles.username} some HYPE`,
      });
      
      onHypeGiven();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to give HYPE",
        variant: "destructive",
      });
    } finally {
      setGiving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border">
      {/* User Info */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.profiles.avatar_url || ""} />
          <AvatarFallback className="bg-gradient-primary text-white">
            {post.profiles.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.profiles.username}</p>
        </div>
      </div>

      {/* Image */}
      <img
        src={post.image_url}
        alt="Post"
        className="w-full aspect-square object-cover"
      />

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleGiveHype}
            disabled={giving || currentUserId === post.user_id}
            className="bg-gradient-hype hover:opacity-90 text-black font-bold gap-2"
          >
            <Flame className="w-5 h-5" />
            Give HYPE
          </Button>
          <div className="flex items-center gap-2 text-lg font-bold">
            <Flame className="w-5 h-5 text-accent" />
            {post.hype_count}
          </div>
        </div>

        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.profiles.username}</span>{" "}
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
};
