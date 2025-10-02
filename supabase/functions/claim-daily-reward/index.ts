import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existingReward } = await supabase
      .from("daily_rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("reward_date", today)
      .maybeSingle();

    if (existingReward) {
      throw new Error("Daily reward already claimed today");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("hype_balance, last_daily_reward, streak_days")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const lastRewardDate = profile.last_daily_reward;
    let streakDays = profile.streak_days || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastRewardDate === yesterdayStr) {
      streakDays += 1;
    } else if (lastRewardDate !== today) {
      streakDays = 1;
    }

    const baseReward = 10;
    const streakBonus = Math.min(streakDays - 1, 6) * 2;
    const totalReward = baseReward + streakBonus;

    const { error: rewardInsertError } = await supabase
      .from("daily_rewards")
      .insert({
        user_id: user.id,
        reward_date: today,
        amount: totalReward,
        streak_days: streakDays,
      });

    if (rewardInsertError) throw rewardInsertError;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        hype_balance: profile.hype_balance + totalReward,
        last_daily_reward: today,
        streak_days: streakDays,
      })
      .eq("id", user.id);

    if (profileUpdateError) throw profileUpdateError;

    return new Response(
      JSON.stringify({
        success: true,
        reward: {
          amount: totalReward,
          base_reward: baseReward,
          streak_bonus: streakBonus,
          streak_days: streakDays,
          new_balance: profile.hype_balance + totalReward,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in claim-daily-reward function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
