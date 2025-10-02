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

    const { post_id, to_user_id, amount } = await req.json();

    if (!post_id || !to_user_id || !amount || amount <= 0) {
      throw new Error("Invalid parameters");
    }

    if (user.id === to_user_id) {
      throw new Error("You cannot give HYPE to your own posts");
    }

    const { data: senderProfile, error: senderError } = await supabase
      .from("profiles")
      .select("hype_balance, total_hype_given")
      .eq("id", user.id)
      .single();

    if (senderError) throw senderError;

    if (senderProfile.hype_balance < amount) {
      throw new Error("Insufficient HYPE balance");
    }

    const burnedAmount = Math.floor(amount * 0.15);
    const platformAmount = Math.floor(amount * 0.15);
    const creatorAmount = amount - burnedAmount - platformAmount;

    const transactionId = `${user.id}-${post_id}-${Date.now()}`;

    const { error: senderUpdateError } = await supabase
      .from("profiles")
      .update({
        hype_balance: senderProfile.hype_balance - amount,
        total_hype_given: senderProfile.total_hype_given + amount,
      })
      .eq("id", user.id);

    if (senderUpdateError) throw senderUpdateError;

    const { data: receiverProfile, error: receiverFetchError } = await supabase
      .from("profiles")
      .select("hype_balance, total_hype_received")
      .eq("id", to_user_id)
      .single();

    if (receiverFetchError) throw receiverFetchError;

    const { error: receiverUpdateError } = await supabase
      .from("profiles")
      .update({
        hype_balance: receiverProfile.hype_balance + creatorAmount,
        total_hype_received: receiverProfile.total_hype_received + creatorAmount,
      })
      .eq("id", to_user_id);

    if (receiverUpdateError) throw receiverUpdateError;

    const { data: currentPost } = await supabase
      .from("posts")
      .select("hype_count")
      .eq("id", post_id)
      .single();

    if (currentPost) {
      await supabase
        .from("posts")
        .update({ hype_count: currentPost.hype_count + amount })
        .eq("id", post_id);
    }

    const { error: transactionError } = await supabase
      .from("hype_transactions")
      .insert({
        from_user_id: user.id,
        to_user_id,
        post_id,
        amount,
        burned_amount: burnedAmount,
        platform_amount: platformAmount,
        creator_amount: creatorAmount,
        transaction_id: transactionId,
      });

    if (transactionError) throw transactionError;

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          amount,
          burned: burnedAmount,
          platform: platformAmount,
          creator: creatorAmount,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in give-hype function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
