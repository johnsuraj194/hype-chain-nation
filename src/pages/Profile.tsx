import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, LogOut, MapPin, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  hype_balance: number;
  total_hype_received: number;
  total_hype_given: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "See you later! 👋",
    });
    navigate("/auth");
  };

  if (loading || !profile) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-1">
                {profile.username}
              </h1>
              {(profile.city || profile.state || profile.country) && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm mb-6">{profile.bio}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-hype rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-5 h-5 text-black" />
                <p className="text-2xl font-bold text-black">{profile.hype_balance}</p>
              </div>
              <p className="text-xs text-black/70">HYPE Balance</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">{profile.total_hype_received}</p>
              <p className="text-xs text-muted-foreground">Received</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{profile.total_hype_given}</p>
              <p className="text-xs text-muted-foreground">Given</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/profile/edit")}
              className="w-full gap-2 bg-gradient-primary hover:opacity-90"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
