import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Plus, User, Trophy, Link2 } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  currentUserId?: string;
}

export const Header = ({ currentUserId }: HeaderProps) => {
  const [hypeBalance, setHypeBalance] = useState(0);

  useEffect(() => {
    if (currentUserId) {
      fetchHypeBalance();
    }
  }, [currentUserId]);

  const fetchHypeBalance = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("hype_balance")
      .eq("id", currentUserId)
      .single();
    
    if (data) {
      setHypeBalance(data.hype_balance);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            HypeChain
          </span>
        </Link>

        {/* HYPE Balance */}
        <div className="flex items-center gap-2 bg-gradient-hype px-4 py-2 rounded-full">
          <Flame className="w-4 h-4 text-black" />
          <span className="font-bold text-black">{hypeBalance}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="rounded-full"
          >
            <Link to="/create">
              <Plus className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="rounded-full"
          >
            <Link to="/chains">
              <Link2 className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="rounded-full"
          >
            <Link to="/leaderboard">
              <Trophy className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="rounded-full"
          >
            <Link to="/profile">
              <User className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
