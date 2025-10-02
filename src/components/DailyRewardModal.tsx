import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Flame, Gift, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyRewardModalProps {
  userId?: string;
  onRewardClaimed?: () => void;
}

export const DailyRewardModal = ({ userId, onRewardClaimed }: DailyRewardModalProps) => {
  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      checkDailyReward();
    }
  }, [userId]);

  const checkDailyReward = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: rewardData } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("user_id", userId)
        .eq("reward_date", today)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("streak_days")
        .eq("id", userId)
        .single();

      if (profile) {
        setStreakDays(profile.streak_days || 0);
      }

      if (!rewardData) {
        setCanClaim(true);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error checking daily reward:", error);
    }
  };

  const claimReward = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-daily-reward");

      if (error) throw error;

      toast({
        title: "Daily reward claimed!",
        description: `You received ${data.reward.amount} HYPE! Streak: ${data.reward.streak_days} days`,
      });

      setOpen(false);
      if (onRewardClaimed) {
        onRewardClaimed();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (!canClaim) return null;

  const potentialReward = 10 + Math.min(streakDays, 6) * 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display">
            Daily Reward Available!
          </DialogTitle>
          <DialogDescription className="text-center">
            Claim your daily HYPE to keep your streak going
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-hype flex items-center justify-center shadow-glow animate-bounce-subtle">
              <Gift className="w-10 h-10 text-black" />
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-8 h-8 text-accent" />
                <span className="text-4xl font-bold bg-gradient-hype bg-clip-text text-transparent">
                  +{potentialReward}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">HYPE Reward</p>
            </div>

            {streakDays > 0 && (
              <div className="bg-gradient-primary p-3 rounded-lg">
                <p className="text-white font-semibold text-center">
                  {streakDays} Day Streak!
                </p>
                <p className="text-white/80 text-xs text-center">
                  Keep claiming daily for bonus HYPE
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={claimReward}
            disabled={claiming}
            className="w-full bg-gradient-hype hover:opacity-90 text-black font-bold h-12 text-lg"
          >
            {claiming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Reward"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Base: 10 HYPE + Streak Bonus: {Math.min(streakDays, 6) * 2} HYPE
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
