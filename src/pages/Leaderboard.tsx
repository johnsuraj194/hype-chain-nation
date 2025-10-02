import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  total_hype_received: number;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, city, state, country, total_hype_received")
        .order("total_hype_received", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-accent" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-muted-foreground font-bold w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="country">Country</TabsTrigger>
            <TabsTrigger value="city">City</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-3">
            {leaders.map((user, index) => (
              <div
                key={user.id}
                className="bg-card rounded-xl p-4 flex items-center gap-4 shadow-card border border-border"
              >
                <div className="w-8">{getRankIcon(index)}</div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{user.username}</p>
                  {user.country && (
                    <p className="text-xs text-muted-foreground">{user.country}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-gradient-hype px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-black" />
                  <span className="font-bold text-black">{user.total_hype_received}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="country" className="space-y-3">
            <p className="text-center text-muted-foreground py-8">
              Country leaderboards coming soon! 🌍
            </p>
          </TabsContent>

          <TabsContent value="city" className="space-y-3">
            <p className="text-center text-muted-foreground py-8">
              City leaderboards coming soon! 🏙️
            </p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
