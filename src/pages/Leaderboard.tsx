import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Trophy, Medal, Loader as Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [activeTab, setActiveTab] = useState("global");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchFilters();
    fetchLeaderboard();
  }, [activeTab, selectedCountry, selectedState, selectedCity]);

  const fetchFilters = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("city, state, country");

      if (profiles) {
        const uniqueCountries = [...new Set(profiles.map(p => p.country).filter(Boolean))] as string[];
        const uniqueStates = [...new Set(profiles.map(p => p.state).filter(Boolean))] as string[];
        const uniqueCities = [...new Set(profiles.map(p => p.city).filter(Boolean))] as string[];

        setCountries(uniqueCountries.sort());
        setStates(uniqueStates.sort());
        setCities(uniqueCities.sort());
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, username, avatar_url, city, state, country, total_hype_received")
        .order("total_hype_received", { ascending: false })
        .limit(50);

      if (activeTab === "country" && selectedCountry) {
        query = query.eq("country", selectedCountry);
      } else if (activeTab === "state" && selectedState) {
        query = query.eq("state", selectedState);
      } else if (activeTab === "city" && selectedCity) {
        query = query.eq("city", selectedCity);
      }

      const { data, error } = await query;

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

  const LeaderboardList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (leaders.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found in this leaderboard</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {leaders.map((user, index) => (
          <div
            key={user.id}
            className="bg-card rounded-xl p-4 flex items-center gap-4 shadow-card border border-border hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
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
                <p className="text-xs text-muted-foreground">
                  {[user.city, user.state, user.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 bg-gradient-hype px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-black" />
              <span className="font-bold text-black">{user.total_hype_received}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3 mb-6 animate-slide-up">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="country">Country</TabsTrigger>
            <TabsTrigger value="city">City</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <LeaderboardList />
          </TabsContent>

          <TabsContent value="country" className="space-y-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountry && <LeaderboardList />}
            {!selectedCountry && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a country to view leaderboard</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="city" className="space-y-4">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCity && <LeaderboardList />}
            {!selectedCity && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a city to view leaderboard</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
