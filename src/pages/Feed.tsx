import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PostCard } from "@/components/PostCard";
import { Header } from "@/components/Header";
import { DailyRewardModal } from "@/components/DailyRewardModal";
import { useNotifications } from "@/hooks/use-notifications";
import { Loader as Loader2 } from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  hype_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useNotifications(currentUser?.id);

  useEffect(() => {
    checkUser();
    fetchPosts();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header currentUserId={currentUser?.id} />
      <DailyRewardModal userId={currentUser?.id} />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                onHypeGiven={fetchPosts}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
