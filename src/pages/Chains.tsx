import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link2, Flame, Plus, Loader as Loader2 } from "lucide-react";

interface Chain {
  id: string;
  title: string;
  description: string | null;
  total_hype: number;
  is_active: boolean;
  created_at: string;
  creator_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  chain_posts: {
    id: string;
  }[];
}

const Chains = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchChains();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const fetchChains = async () => {
    try {
      const { data, error } = await supabase
        .from("chains")
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          chain_posts (id)
        `)
        .eq("is_active", true)
        .order("total_hype", { ascending: false });

      if (error) throw error;
      setChains(data || []);
    } catch (error) {
      console.error("Error fetching chains:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header currentUserId={currentUser?.id} />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <Link2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-bold">Hype Chains</h1>
          </div>
          <Button
            onClick={() => navigate("/chains/create")}
            className="bg-gradient-primary hover:opacity-90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Chain
          </Button>
        </div>

        <div className="mb-6 bg-card rounded-xl p-4 border border-border animate-slide-up">
          <p className="text-sm text-muted-foreground">
            Chains are linked challenges where each post keeps the momentum going.
            Create your own chain or join existing ones to build epic stories together!
          </p>
        </div>

        {chains.length === 0 ? (
          <div className="text-center py-12 animate-slide-up">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No chains yet. Start the first one!</p>
            <Button
              onClick={() => navigate("/chains/create")}
              className="bg-gradient-primary hover:opacity-90 gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Chain
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {chains.map((chain, index) => (
              <div
                key={chain.id}
                className="bg-card rounded-2xl p-6 shadow-card border border-border hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chain.profiles.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {chain.profiles.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-lg">{chain.title}</h3>
                      <Badge variant="outline" className="bg-gradient-primary text-white border-0">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {chain.profiles.username}
                    </p>
                  </div>
                </div>

                {chain.description && (
                  <p className="text-sm mb-4">{chain.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-accent" />
                      <span className="font-bold">{chain.total_hype}</span>
                      <span className="text-sm text-muted-foreground">HYPE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-primary" />
                      <span className="font-bold">{chain.chain_posts.length}</span>
                      <span className="text-sm text-muted-foreground">Posts</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chains/${chain.id}`)}
                  >
                    View Chain
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chains;
